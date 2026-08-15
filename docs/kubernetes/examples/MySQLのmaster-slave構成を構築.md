# MySQLのmaster-slave構成を構築

MySQLをmaster-slave構成で起動するマニフェストのサンプルです。

## MySQL

データベース本体のマニフェストです。

### `mysql-sts.yaml`

- StatefulSetでMysql Podを2台起動し、それぞれにmaster / slaveの状態を持たせます。
- initContainerで、ボリュームを介してそれぞれのコンテナに設定ファイルを渡します:
  - mysql-docker-entrypoint-initdb: データーベース初期構築向けSQL
  - mysql-conf: master / slaveの設定を持たせる`my.cnf`
- volumeClaimTemplatesを使って各Podのバックアップを取ります。

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mysql
spec:
  selector:
    matchLabels:
      app: mysql
  serviceName: mysql-svc
  replicas: 2
  template:
    metadata:
      labels:
        app: mysql
    spec:
      initContainers: # master, slave設定を各Podに投入するコンテナ
        - name: mysql-setting
          image: busybox:1.28
          command: ["sh", "-c", "sh /scripts/mysql-setting.sh"]
          volumeMounts:
            - name: mysql-setting-cm
              mountPath: /scripts
            - name: mysql-master-temp
              mountPath: /temp/master
            - name: mysql-slave-temp
              mountPath: /temp/slave
            - name: mysql-docker-entrypoint-initdb
              mountPath: /share/docker-entrypoint-initdb
            - name: mysql-conf
              mountPath: /share/conf
      containers:
        - name: mysql
          image: mysql:8.0
          env:
            - name: MYSQL_ROOT_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mysql-common-secret
                  key: MYSQL_ROOT_PASSWORD
          volumeMounts:
            - name: mysql-docker-entrypoint-initdb
              mountPath: /docker-entrypoint-initdb.d
            - name: mysql-conf
              mountPath: /etc/mysql/conf.d
            - name: backup
              mountPath: /var/lib/mysql
      volumes:
        - name: mysql-setting-cm # master, slave設定スクリプトを格納
          configMap:
            name: mysql-setting-cm
            items:
              - key: mysql-setting.sh
                path: mysql-setting.sh
        - name: mysql-master-temp # master向け設定ファイルを格納
          configMap:
            name: mysql-master-temp
            items:
              - key: my.cnf
                path: my.cnf
              - key: init.sql
                path: init.sql
        - name: mysql-slave-temp # slave向け設定ファイルを格納
          configMap:
            name: mysql-slave-temp
            items:
              - key: my.cnf
                path: my.cnf
              - key: init.sql
                path: init.sql
        - name: mysql-docker-entrypoint-initdb # DB初期化向けスクリプトを格納
          emptyDir:
            sizeLimit: 500Mi
        - name: mysql-conf # initContainerから各MySQLコンテナにmy.cnfを渡す
          emptyDir:
            sizeLimit: 500Mi
  volumeClaimTemplates: # 各Podのバックアップ
    - metadata:
        name: backup
      spec:
        accessModes: [ReadWriteOnce]
        storageClassName: standard
        resources:
          requests:
            storage: 500Mi
```

### `mysql-common-secret.yaml`

mysql-0, mysql-1に共通するSecretです。`kubectl`コマンドのdry-runによってマニフェストを生成しています（cf. [Managing Secrets using kubectl](https://kubernetes.io/docs/tasks/configmap-secret/managing-secret-using-kubectl/#use-raw-data)）。

```yaml
apiVersion: v1
data:
  MYSQL_ROOT_PASSWORD: cGFzc3dvcmQ=
kind: Secret
metadata:
  name: mysql-common-secret
```

### `mysql-setting-cm.yaml`

initContainerで動かすスクリプトです。Podのホスト名によって適切な設定ファイルをMySQLコンテナに渡します。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-setting-cm
data:
  mysql-setting.sh: |
    if [ "$(hostname)" = "mysql-0" ]; then
      cp /temp/master/my.cnf /share/conf
      cp /temp/master/init.sql /share/docker-entrypoint-initdb/init.sql
    elif [ "$(hostname)" = "mysql-1" ]; then
      cp /temp/slave/my.cnf /share/conf
      cp /temp/slave/init.sql /share/docker-entrypoint-initdb/init.sql
    fi
```

### `mysql-master-temp.yaml`

master向けの`my.cnf`および`init.sql`です。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-master-temp
data:
  my.cnf: |
    [mysqld]
    server-id = 1
    log-bin = mysql-bin
    binlog-format = ROW
    gtid-mode = ON
    enforce-gtid-consistency = ON
  init.sql: |
    -- レプリケーション担当ユーザ作成
    CREATE USER IF NOT EXISTS 'repl'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'replpass';
    GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
    -- アプリケーションからアクセスするユーザ作成
    CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'appuserpass';
    GRANT ALL PRIVILEGES ON *.* TO 'appuser'@'%';
    -- proxysqlからの監視ユーザ作成
    CREATE USER IF NOT EXISTS 'monitor'@'%' IDENTIFIED BY 'monitorpass';
    GRANT USAGE ON *.* TO 'monitor'@'%';
    -- 業務テーブル作成
    CREATE DATABASE eadb;
    CREATE TABLE eadb.users (name VARCHAR(8) PRIMARY KEY, password VARCHAR(32));
    INSERT INTO eadb.users (name, password) VALUES ('nob', 'passwd');
```

### `mysql-slave-temp.yaml`

slave向けの`my.cnf`および`init.sql`です。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mysql-slave-temp
data:
  my.cnf: |
    [mysqld]
    server-id = 2
    relay-log = relay-bin
    read-only = 1
    gtid-mode = ON
    enforce-gtid-consistency = ON
  init.sql: |
    -- レプリカ設定
    CHANGE REPLICATION SOURCE TO
      SOURCE_HOST='mysql-0.mysql-svc',
      SOURCE_USER='repl',
      SOURCE_PASSWORD='replpass',
      SOURCE_AUTO_POSITION=1;
    START REPLICA;
    -- アプリケーション向けユーザ作成
    CREATE USER IF NOT EXISTS 'appuser'@'%' IDENTIFIED WITH 'mysql_native_password' BY 'appuserpass';
    GRANT ALL PRIVILEGES ON *.* TO 'appuser'@'%';
    -- 監視向けユーザ作成
    CREATE USER IF NOT EXISTS 'monitor'@'%' IDENTIFIED BY 'monitorpass';
    GRANT USAGE ON *.* TO 'monitor'@'%';
```

### `mysql-svc.yaml`

MySQL向けのサービスです。アプリケーションとの疎通は後述のProxySQLを介して行うため、ここでは [Headless Service](https://kubernetes.io/docs/concepts/services-networking/service/#headless-services)を作成して各Podに直接疎通が取れるようにしています。

```yaml
apiVersion: v1
kind: Service
metadata:
  name: mysql-svc
spec:
  selector:
    app: mysql
  clusterIP: None
```

## ProxySQL

アプリからデータベースへの疎通を担うProxySQLのマニフェストです。

### `proxysql-deploy.yaml`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: proxysql
  labels:
    app: proxysql
spec:
  replicas: 2
  selector:
    matchLabels:
      app: proxysql
  template:
    metadata:
      labels:
        app: proxysql
    spec:
      containers:
        - name: proxysql
          image: proxysql/proxysql:3.0.2
          volumeMounts:
            - name: proxysql-cm
              mountPath: /etc/proxysql.cnf
              subPath: proxysql.cnf
          ports:
            - containerPort: 3306
      volumes:
        - name: proxysql-cm
          configMap:
            name: proxysql-cm
            items:
              - key: proxysql.cnf
                path: proxysql.cnf
```

### `proxysql-cm.yaml`

master / slaveのルーティングを設定します。`mysql-x.mysql-svc`でPodに直接疎通します。

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: proxysql-cm
data:
  proxysql.cnf: |
    mysql_variables =
    {
        interfaces="0.0.0.0:3306"
        server_version="8.0"
        monitor_username="monitor"
        monitor_password="monitorpass"
    }

    mysql_servers =
    (
        {
            address="mysql-0.mysql-svc"
            port=3306
            hostgroup_id=10
            max_connections=200
        },
        {
            address="mysql-1.mysql-svc"
            port=3306
            hostgroup_id=20
            max_connections=200
        }
    )

    mysql_users =
    (
        {
            username="appuser"
            password="appuserpass"
            default_hostgroup=10
            transaction_persistent=true
            active=1
        }
    )

    mysql_query_rules =
    (
        {
            rule_id=1
            active=1
            match_pattern="^SELECT"
            destination_hostgroup=20
            apply=1
        },
        {
            rule_id=2
            active=1
            match_pattern=".*"
            destination_hostgroup=10
            apply=1
        }
    )

    mysql_replication_hostgroups =
    (
        {
            writer_hostgroup=10
            reader_hostgroup=20
            comment="master-slave replication setup"
        }
    )
```

### `proxysql-svc.yaml`

```yaml
apiVersion: v1
kind: Service
metadata:
  name: proxysql-svc
spec:
  selector:
    app: proxysql
  ports:
    - protocol: TCP
      port: 3306
      targetPort: 3306
```
