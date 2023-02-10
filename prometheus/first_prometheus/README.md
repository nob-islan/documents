# First Prometheus
cf. https://changineer.info/server/monitoring/monitoring_prometheus_install_docker.html  
インストールから動作確認まで行う。

## 事前準備
タイムゾーンがローカルPCとズレていると画面に警告が出るため、下記設定をしておく。
```
timedatectl set-timezone Asia/Tokyo
```

## インストール
dockerで動かすため、[Dockerインストール](../../docker/Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/README.md)を済ませておく。

最低限の設定ファイルを作成する。
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

Prometheusコンテナを起動する。
```
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

下記にアクセスすると、グラフ描画ページが表示される。
```
http://${prometheusサーバのIPアドレス}:9090/
```

下記で監視項目の一覧を確認できる。
```
http://${prometheusサーバのIPアドレス}:9090/metrics
```

監視項目の一覧から適当なもの（`prometheus_http_requests_total`など）をグラフ描画ページの検索ボックスに投入すると、グラフが表示される。

## 他サーバの監視
`node exporter`を使うと、他サーバの各メトリクスを監視できる。

監視したいサーバにて、node exporterを起動する。
```
docker run -d \
  --name node-exporter \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  quay.io/prometheus/node-exporter:latest \
  --path.rootfs=/host
```

監視できているかどうかは下記コマンドで確認できる。
```
curl http://localhost:9100/metrics
```

Prometheusの設定ファイルに下記を追記する。
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

`docker restart prometheus`でコンテナをリスタートし、画面から`Targets`を参照すると、監視対象が追加されていることが確認できる。

## Grafana

dockerで動かす。
```
docker run -d --name=grafana -p 3000:3000 grafana/grafana
```