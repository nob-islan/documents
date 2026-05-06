# k6メトリクスをPrometheusに送信する

Grafana k6によるテストメトリクスをPrometheusに送信する設定です。

cf.

- https://grafana.com/docs/k6/latest/results-output/real-time/prometheus-remote-write/
- https://prometheus.io/docs/prometheus/latest/querying/api/#remote-write-receiver

## 設定

### Prometheus

#### `docker-compose.yaml`

```yaml
services:
  prometheus:
    image: prom/prometheus
    container_name: nob-prometheus
    ports:
      - 9090:9090
    command: >
      --web.enable-remote-write-receiver
      --config.file=/etc/prometheus/prometheus.yml
    volumes:
      - ./volumes/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
```

#### `volumes/prometheus/prometheus.yml`

起動コマンドを付与すると設定yamlが必須になるようなので、最小設定のみ入れたyamlを作成します:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "prometheus"
    static_configs:
      - targets: ["localhost:9090"]
```

## 実行

下記コマンドでk6スクリプト実行後、Prometheusに`k6_xxx`のメトリクスが保存されます:

```shell
docker run --rm -e K6_PROMETHEUS_RW_SERVER_URL=http://localhost:9090/api/v1/write -i grafana/k6 run -o experimental-prometheus-rw - <script.js
```
