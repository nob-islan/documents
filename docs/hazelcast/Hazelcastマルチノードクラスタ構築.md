# Hazelcastマルチノードクラスタ構築

cf. https://docs.hazelcast.com/hazelcast/5.6/clusters/creating-clusters

## 設定

設定ファイル内の`cluster-name`タグが一致するノードを自動検出してクラスタを組みます。なのでデフォルト設定のまま同一ネットワーク上にコンテナを複数台起動するだけでクラスタが構築されます:

```yaml
services:
  hazelcast01:
    image: hazelcast/hazelcast:5.6.0
    container_name: hazelcast01
    environment:
      - HZ_CLUSTERNAME=nob-hazelcast
    ports:
      - 5701:5701
    networks:
      - hazelcast-network
  hazelcast02:
    image: hazelcast/hazelcast:5.6.0
    container_name: hazelcast02
    environment:
      - HZ_CLUSTERNAME=nob-hazelcast
    ports:
      - 5702:5701
    networks:
      - hazelcast-network
  hazelcast03:
    image: hazelcast/hazelcast:5.6.0
    container_name: hazelcast03
    environment:
      - HZ_CLUSTERNAME=nob-hazelcast
    ports:
      - 5703:5701
    networks:
      - hazelcast-network
networks:
  hazelcast-network:
    name: hazelcast-network
```

下記コマンドでクラスタ参加者を確認できます:

```shell
docker run --network hazelcast-network -it --rm hazelcast/hazelcast:5.6.0 hz-cli --targets nob-hazelcast@{hazelcast_host} cluster
```
