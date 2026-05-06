# DockerでGrafanaを構築

```yaml
services:
  grafana:
    image: grafana/grafana
    container_name: nob-grafana
    ports:
      - 3000:3000
    # volumes:
    #   - ./volumes/grafana:/var/lib/grafana
```
