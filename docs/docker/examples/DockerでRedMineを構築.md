# DockerでRedMineを構築

## RedMine起動

下記`docker-compose.yaml`を記述して起動します。

```yaml
services:
  redmine:
    image: redmine:latest
    restart: always
    ports:
      - 8080:3000
    environment:
      REDMINE_DB_MYSQL: db
      REDMINE_DB_PASSWORD: example
      REDMINE_SECRET_KEY_BASE: supersecretkey
  db:
    image: mysql:latest
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: redmine
```

http://localhost:8080 にアクセス後、`admin/admin`でログイン可能です。
