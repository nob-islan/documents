# Docker config

docker configを使ってコンテナ内の設定ファイルをyamlに記載します。

cf.

- https://docs.docker.com/reference/compose-file/configs/
- https://docs.docker.com/reference/compose-file/services/#configs

## サンプル

```yaml
services:
  ubuntu:
    container_name: nobuntu
    image: ubuntu:24.04
    tty: true
    configs:
      - source: ubuntu_config
        target: /nobtest

configs:
  ubuntu_config:
    content: |
      this_is_a_test_file
```

`content` 配下の内容でファイルが作成されます:

```
$ docker exec -it nobuntu cat /nobtest
this_is_a_test_file
```
