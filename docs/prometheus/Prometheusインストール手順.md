# Prometheusインストール手順

cf. https://prometheus.io/docs/prometheus/latest/getting_started/
インストールから動作確認まで行います。

## 事前準備

タイムゾーンがローカルPCとズレていると画面に警告が出るため、下記設定をしておきます。

```
timedatectl set-timezone Asia/Tokyo
```

## インストール

事前にdockerをインストールしておいてください。

## 起動

`docker-compose.yaml`を下記で記載します。

```yaml
version: "3.7"
services:
  prometheus:
    image: prom/prometheus
    container_name: nob-prometheus
    ports:
      - 9090:9090
    volumes:
      - type: bind
        source: "/srv/prometheus/prometheus.yaml"
        target: "/etc/prometheus/prometheus.yaml"
```

`/srv/prometheus`ディレクトリを切り、`prometheus.yaml`を下記で作成します。

```yaml
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

監視したいサーバにて、node exporterを起動します。

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

Prometheusの設定ファイルに下記を追記します。

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

`docker-compose.yaml`に下記を追記します。

```yaml
version: "3.7"
services:
  prometheus:
    image: prom/prometheus
    container_name: nob-prometheus
    ports:
      - 9090:9090
    volumes:
      - type: bind
        source: "/srv/prometheus/prometheus.yaml"
        target: "/etc/prometheus/prometheus.yaml"
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
