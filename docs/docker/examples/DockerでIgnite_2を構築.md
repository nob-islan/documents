# DockerでIgnite 2を構築

cf. https://ignite.apache.org/docs/ignite2/latest/installation/installing-using-docker.html

```yaml
services:
  ignite:
    container_name: ignite
    image: apacheignite/ignite:2.17.0
    ports:
      - 10800:10800
```
