# Dockerコンテナのログを収集

cf. https://www.fluentd.org/guides/recipes/docker-logging

## 設定

### fluentd設定

- `/etc/fluent/fluentd.conf`を下記で設定します:

```conf
<match *.*>
  @type stdout
</match>

<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>
```

- fluentdを再起動します:

```shell
sudo systemctl restart fluentd.service
```

### アプリ設定

- 下記docker-composeでコンテナを起動します:

```yaml
services:
  tmpgo:
    image: easyapp/easyapp:latest
    container_name: easyapp
    ports:
      - 8080:8080
    logging:
      driver: fluentd
      options:
        fluentd-address: "{fluentIP}:24224"
        tag: "docker.{{.ID}}"
```

アプリ起動後、`/var/log/fluent/fluentd.log`にコンテナのログが出力されます。
