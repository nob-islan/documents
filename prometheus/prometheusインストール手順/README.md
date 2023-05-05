# First Prometheus

cf. https://changineer.info/server/monitoring/monitoring_prometheus_install_docker.html  
インストールから動作確認まで行います。

## 事前準備

タイムゾーンがローカル PC とズレていると画面に警告が出るため、下記設定をしておきます。

```
timedatectl set-timezone Asia/Tokyo
```

## インストール

docker で動かすため、[Docker インストール](../../docker/Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/README.md)を済ませておいてください。

最低限の設定ファイルを作成します。

```
# 作業用ディレクトリ作成
mkdir /etc/prometheus

# 設定ファイル作成
cat << EOF > /etc/prometheus/prometheus.yml
scrape_configs:
  - job_name: prometheus
    static_configs:
      - targets:
        - localhost:9090
EOF
```

## 起動

Prometheus コンテナを起動します。

```
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

もしくは`docker-compose.yml`を下記で記載します。

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
        source: "/etc/prometheus/prometheus.yml"
        target: "/etc/prometheus/prometheus.yml"
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

docker で動かします。

```
docker run -d --name=grafana -p 3000:3000 grafana/grafana
```

もしくは`docker-compose.yml`に下記を追記します。

```diff
version: "3.7"
 services:
   prometheus:
     image: prom/prometheus
     container_name: nob-prometheus
     ports:
       - 9090:9090
     volumes:
       - type: bind
         source: "./volume/prometheus.yml"
         target: "/etc/prometheus/prometheus.yml"
+  grafana:
+    image: grafana/grafana
+    container_name: nob-grafana
+    ports:
+      - 3000:3000
```
