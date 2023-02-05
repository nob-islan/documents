# First Prometheus
インストールから動作確認まで行う。

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

Prometheusコンテナを起動する。
```
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /etc/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```