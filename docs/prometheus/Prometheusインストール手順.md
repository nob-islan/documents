# Prometheus インストール手順

cf. https://changineer.info/server/monitoring/monitoring_prometheus_install_docker.html  
インストールから動作確認まで行います。

## 事前準備

タイムゾーンがローカル PC とズレていると画面に警告が出るため、下記設定をしておきます。

```
timedatectl set-timezone Asia/Tokyo
```

## インストール

事前に docker をインストールしておいてください。

## 起動

`docker-compose.yml`を下記で記載します。

```yml
version: "3.7"
services:
  prometheus:
    image: prom/prometheus
    container_name: nob-prometheus
    ports:
      - 9090:9090
    volumes:
      - type: bind
        source: "/srv/prometheus/prometheus.yml"
        target: "/etc/prometheus/prometheus.yml"
```

`/srv/prometheus`ディレクトリを切り、`prometheus.yml`を下記で作成します。

```yml
scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets:
          - localhost:9090
```

下記にアクセスすると、グラフ描画ページが表示されます。

```
http://${prometheusサーバのIPアドレス}:9090/
```

下記で監視項目の一覧を確認できます。

```
http://${prometheusサーバのIPアドレス}:9090/metrics
```

監視項目の一覧から適当なもの（`prometheus_http_requests_total`など）をグラフ描画ページの検索ボックスに投入すると、グラフが表示されます。

## 他サーバの監視

`node exporter`を使うと、他サーバの各メトリクスを監視できます。

監視したいサーバにて、node exporter を起動します。

```
docker run -d \
  --name node-exporter \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  quay.io/prometheus/node-exporter:latest \
  --path.rootfs=/host
```

監視できているかどうかは下記コマンドで確認できます。

```
curl http://localhost:9100/metrics
```

Prometheus の設定ファイルに下記を追記します。

```diff
 scrape_configs:
   - job_name: prometheus
     static_configs:
       - targets:
         - localhost:9090
+  - job_name: node
+    static_configs:
+      - targets:
+        - ${監視対象サーバのIPアドレス}:9100
```

`docker restart prometheus`でコンテナをリスタートし、画面から`Targets`を参照すると、監視対象が追加されていることが確認できます。

## Grafana

`docker-compose.yml`に下記を追記します。

```yml
version: "3.7"
services:
  prometheus:
    image: prom/prometheus
    container_name: nob-prometheus
    ports:
      - 9090:9090
    volumes:
      - type: bind
        source: "/srv/prometheus/prometheus.yml"
        target: "/etc/prometheus/prometheus.yml"
  grafana:
    image: grafana/grafana
    container_name: nob-grafana
    ports:
      - 3000:3000
    volumes:
      - "/srv/grafana:/var/lib/grafana"
    user: "$PID:$GID"
```

`user: "$PID:$GID"`はボリューム用のディレクトリを作成するためのユーザ指定です。
