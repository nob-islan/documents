# Zabbix インストール手順

Zabbix サーバの構築方法および、監視対象のサーバへのエージェントの設定方法を記載します。

## Zabbix サーバインストール

### 事前準備

- mysql インストール

  ```shell
  sudo apt update
  sudo apt install mysql-server-8.0 -f
  ```

### Zabbix サーバインストール

#### 参考文献

- https://www.zabbix.com/documentation/current/en/manual/installation/install_from_packages/debian_ubuntu
- https://www.zabbix.com/download?zabbix=7.0&os_distribution=ubuntu&os_version=24.04&components=server_frontend_agent&db=mysql&ws=apache

#### 手順

- root ユーザに昇格

  ```shell
  sudo su -
  ```

- Zabbix reporitory をインストール

  ```shell
  wget https://repo.zabbix.com/zabbix/7.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_7.0-2+ubuntu24.04_all.deb
  dpkg -i zabbix-release_7.0-2+ubuntu24.04_all.deb
  apt update
  ```

- パッケージをインストール

  ```shell
  apt install zabbix-server-mysql zabbix-frontend-php zabbix-apache-conf zabbix-sql-scripts zabbix-agent
  ```

- mysql テーブル作成

  ```shell
  mysql -u root
  ```

  ```sql
  create database zabbix character set utf8mb4 collate utf8mb4_bin;
  create user zabbix@localhost identified by 'password';
  grant all privileges on zabbix.* to zabbix@localhost;
  set global log_bin_trust_function_creators = 1;
  quit;
  ```

- 初期データ投入

  ```shell
  zcat /usr/share/zabbix-sql-scripts/mysql/server.sql.gz | mysql --default-character-set=utf8mb4 -uzabbix -p zabbix
  ```

- `log_bin_trust_function_creators`の無効化

  ```shell
  mysql -u root
  ```

  ```
  set global log_bin_trust_function_creators = 0;
  quit;
  ```

- `/etc/zabbix/zabbix_server.conf`を編集

  ```conf
  DBPassword={password}
  ```

- Zabbix サーバの開始

  ```shell
  systemctl restart zabbix-server zabbix-agent apache2
  systemctl enable zabbix-server zabbix-agent apache2
  ```

`http://${IPアドレス}/zabbix`にアクセスするとログイン画面が表示されます。初期ユーザ/パスワードは`Admin/zabbix`です。

## Zabbix Agent インストール

### 参考文献

- https://www.zabbix.com/download?zabbix=7.0&os_distribution=ubuntu&os_version=24.04&components=agent&db=&ws=
- https://www.zabbix.com/documentation/6.0/jp/manual/appendix/config/zabbix_agentd
- https://qiita.com/ohtsuka-shota/items/a08848ff69dc868e6e43

### インストール手順

- root ユーザに昇格

  ```shell
  sudo su -
  ```

- Zabbix repository をインストール

  ```shell
  wget https://repo.zabbix.com/zabbix/7.0/ubuntu/pool/main/z/zabbix-release/zabbix-release_7.0-2+ubuntu24.04_all.deb
  dpkg -i zabbix-release_7.0-2+ubuntu24.04_all.deb
  apt update
  ```

- Zabbix Agent インストール

  ```shell
  apt install zabbix-agent
  ```

- `/etc/zabbix/zabbix_agentd.conf`を編集

  ```conf
  Server=${ZabbixサーバのIPアドレス}
  ServerActive=${ZabbixサーバのIPアドレス}
  ```

- プロセス開始

  ```shell
  systemctl restart zabbix-agent
  systemctl enable zabbix-agent
  ```

### ホスト登録手順

- **Data collection** > **Hosts** から **Create host** を選択
  - **Templates** について適当に選択
  - **Interfaces** については **Agent** を選択し、監視対象の IP アドレスを入力
- 10 ~ 15 分後に **Availability** が点灯したら監視開始
