# DockerでPrometheusを構築

```yaml
services:
  prometheus:
    image: prom/prometheus
    container_name: nob-prometheus
    ports:
      - 9090:9090
    # volumes:
    #   - ./volumes/prometheus:/etc/prometheus/prometheus.yaml
```
