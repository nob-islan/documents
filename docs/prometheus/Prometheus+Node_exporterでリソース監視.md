# Prometheus + Node exporterでリソース監視

Node exporterを使ってPrometheus上でリソースを監視する設定です。

## 設定

### Node exporter

cf. https://github.com/prometheus/node_exporter

監視対象のサーバ上で、下記`docker-compose.yaml`からコンテナを起動します:

```yaml
services:
  node_exporter:
    image: quay.io/prometheus/node-exporter:latest
    container_name: node_exporter
    command:
      - "--path.rootfs=/host"
    network_mode: host
    pid: host
    restart: unless-stopped
    volumes:
      - "/:/host:ro,rslave"
```

### Prometheus

cf.

- https://hub.docker.com/r/prom/prometheus
- https://prometheus.io/docs/prometheus/latest/configuration/configuration

下記の`prometheus.yml`で監視対象を指定します:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "node"

    static_configs:
      - targets:
          - {監視対象のサーバIP}:9100
```

このファイルを格納しつつPrometheusコンテナを起動してください。

## 動作確認

cf. https://prometheus.io/docs/prometheus/latest/querying/api/

Prometheus起動後、下記コマンドでPrometheusにNode exporterが登録されているか確認できます:

```shell
curl http://localhost:9090/api/v1/query?query=up
```

```
$ curl http://localhost:9090/api/v1/query?query=up
{"status":"success","data":{"resultType":"vector","result":[{"metric":{"__name__":"up","instance":"192.168.151.6:9100","job":"node"},"value":[1783692008.263,"1"]}]}}
```

メトリクスは下記要領で取得できます:

```shell
curl http://localhost:9090/api/v1/query?query=node_cpu_seconds_total
```

```
$ curl http://localhost:9090/api/v1/query?query=node_cpu_seconds_total
{"status":"success","data":{"resultType":"vector","result":[{"metric":{"__name__":"node_cpu_seconds_total","cpu":"0","instance":"192.168.151.6:9100","job":"node","mode":"idle"},"value":[1783692026.181,"1639.22"]},{"metric":{"__name__":"node_cpu_seconds_total","cpu":"0","instance":"192.168.151.6:9100","job":"node","mode":"iowait"},"value":[1783692026.181,"1.19"]},{"metric":{"__name__":"node_cpu_seconds_total","cpu":"0","instance":"192.168.151.6:9100","job":"node","mode":"irq"},"value":[1783692026.181,"0"]},{"metric":{"__name__":"node_cpu_seconds_total","cpu":"0","instance":"192.168.151.6:9100","job":"node","mode":"nice"},"value":[1783692026.181,"0"]},{"metric":{"__name__":"node_cpu_seconds_total","cpu":"0","instance":"192.168.151.6:9100","job":"node","mode":"softirq"},"value":[1783692026.181,"0.09"]},{"metric":{"__name__":"node_cpu_seconds_total","cpu":"0","instance":"192.168.151.6:9100","job":"node","mode":"steal"},"value":[1783692026.181,"0.2"]},{"metric":{"__name__":"node_cpu_seconds_total","cpu":"0","instance":"192.168.151.6:9100","job":"node","mode":"system"},"value":[1783692026.181,"8.79"]},{"metric":{"__name__":"node_cpu_seconds_total","cpu":"0","instance":"192.168.151.6:9100","job":"node","mode":"user"},"value":[1783692026.181,"8.58"]}]}}
```
