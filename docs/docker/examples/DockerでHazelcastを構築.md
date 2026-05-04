# DockerでHazelcastを構築

cf. https://docs.hazelcast.com/hazelcast/latest/getting-started/get-started-docker

```yaml
services:
  hazelcast:
    image: hazelcast/hazelcast:5.6.0
    container_name: hazelcast
    environment:
      - HZ_NETWORK_PUBLICADDRESS=localhost:5701
      - HZ_CLUSTERNAME=nob-hazelcast
      # - HAZELCAST_CONFIG=hazelcast-nob.xml
    ports:
      - 5701:5701
    # volumes:
    #   - ./volumes/config/hazelcast-nob.xml:/opt/hazelcast/hazelcast-nob.xml
    networks:
      - hazelcast-network
networks:
  hazelcast-network:
    name: hazelcast-network
```

Hazelcast構築後、下記コマンドでSQLを発行できます:

```shell
docker run --network hazelcast-network -it --rm hazelcast/hazelcast:5.6.0 hz-cli --targets nob-hazelcast@{hazelcast_host} sql
```
