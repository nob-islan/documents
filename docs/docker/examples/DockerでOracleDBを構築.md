# DockerでOracleDBを構築

cf. https://hub.docker.com/r/gvenzl/oracle-xe

公式ではありませんが信頼性の高いOracleデータベースのイメージです。

```yaml
services:
  db:
    container_name: oracle
    image: gvenzl/oracle-xe:latest
    ports:
      - 1521:1521
    environment:
      - ORACLE_PASSWORD=password
    volumes:
      - ./volumes/oradata:/opt/oracle/oradata
```
