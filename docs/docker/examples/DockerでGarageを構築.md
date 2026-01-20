# DockerでGarageを構築

cf. https://garagehq.deuxfleurs.fr/

- docker-compose.yamlを下記で作成します:

```yaml
services:
  garage:
    container_name: garage
    image: dxflrs/garage:v2.1.0
    volumes:
      - ./volumes/garage.toml:/etc/garage.toml
      - ./volumes/meta:/var/lib/garage/meta
      - ./volumes/data:/var/lib/garage/data
    ports:
      - 3900:3900
      - 3901:3901
      - 3902:3902
      - 3903:3903
```

- volumes/garage.tomlを下記で作成します:

```toml
metadata_dir = "/tmp/meta"
data_dir = "/tmp/data"
db_engine = "sqlite"

replication_factor = 1

rpc_bind_addr = "[::]:3901"
rpc_public_addr = "127.0.0.1:3901"
rpc_secret = "27b6cf4aa953b8cac2c577f9ed84d81354696401f137a4e1fadb90314d369ad0"

[s3_api]
s3_region = "garage"
api_bind_addr = "[::]:3900"
root_domain = ".s3.garage.localhost"

[s3_web]
bind_addr = "[::]:3902"
root_domain = ".web.garage.localhost"
index = "index.html"

[k2v_api]
api_bind_addr = "[::]:3904"

[admin]
api_bind_addr = "[::]:3903"
admin_token = "YPfPkYkZ3Ph2/ap5Trfll2GzBC7hveBRd1t5+FTti/s="
metrics_token = "zy683OP6MVj9f7xCyzcdLyDSR7SObSfG6ZyGTWlZaQA="
```
