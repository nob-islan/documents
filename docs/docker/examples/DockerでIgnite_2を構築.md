# DockerでIgnite 2を構築

cf. https://ignite.apache.org/docs/ignite2/latest/installation/installing-using-docker.html

```yaml
services:
  ignite:
    container_name: ignite
    image: apacheignite/ignite:2.17.0
    ports:
      - 10800:10800
    # volumes:
    #   - ./volumes/libs:/opt/ignite/apache-ignite/libs/nob
    #   - ./volumes/config:/opt/ignite/apache-ignite/config/nob
    # environment:
    #   - USER_LIBS=/opt/ignite/apache-ignite/libs/nob
    #   - CONFIG_URI=/opt/ignite/apache-ignite/config/nob/nob-config.xml
```

libs配下に配置するモジュールはJava11でないと動かないので注意してください。
