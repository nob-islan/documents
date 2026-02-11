# DockerでKeycloakを構築

cf.

- https://www.keycloak.org/getting-started/getting-started-docker
- https://www.keycloak.org/server/all-config

## ディレクトリ構成

```shell
.
├── docker-compose.yaml
└── volumes
    └── db
        └── initdb.d
            └── create-database.sql
```

## 設定

### `docker-compose.yaml`

```yaml
services:
  keycloak:
    container_name: keycloak
    image: quay.io/keycloak/keycloak:26.5.3
    environment:
      - KC_HOSTNAME=localhost
      - KC_BOOTSTRAP_ADMIN_USERNAME=admin
      - KC_BOOTSTRAP_ADMIN_PASSWORD=password
      - KC_DB=mariadb
      - KC_DB_URL=jdbc:mariadb://db/kdb
      - KC_DB_USERNAME=root
      - KC_DB_PASSWORD=password
      - KC_HTTP_ENABLED=true
    ports:
      - 8080:8080
    command: start
    depends_on:
      db:
        condition: service_healthy
        restart: true
  db:
    container_name: db
    image: mariadb:10.11
    ports:
      - 3306:3306
    volumes:
      - ./volumes/db/initdb.d:/docker-entrypoint-initdb.d
      - keycloak_data:/var/lib/mysql
    environment:
      - MYSQL_ROOT_PASSWORD=password
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mariadb -u root -p$${MYSQL_ROOT_PASSWORD} kdb -e 'show tables'",
        ]
      interval: 10s
      retries: 5
      start_period: 15s
      timeout: 10s
volumes:
  keycloak_data:
```

### `create-database.sql`

```sql
-- 空のデータベースのみ作成
CREATE DATABASE IF NOT EXISTS kdb;
```
