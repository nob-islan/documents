# JpaRepository 起動時の Java アプリ制御

JpaRepository を利用して repository 層を実装した Java アプリについて、docker-compose に Java, DB の設定を単純に記載しただけだと起動がうまくいきませんでした。Java 側から DB に接続しに行くのに DB の起動が間に合わず、接続に失敗して落ちることが原因だったため、下記のように順序制御を入れる必要があります:

```yaml
services:
  db:
    container_name: db
    image: mariadb:11.4.2
    ports:
      - 3306:3306
    volumes:
      - ./volumes/db/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
    healthcheck:
      test: mariadb -u root -ppassword
      start_period: 5s
      interval: 5s
      timeout: 5s
      retries: 50
  app:
    container_name: app
    image: app
    ports:
      - 8080:8080
    depends_on:
      db:
        condition: service_healthy
```

- db 側ではヘルスチェックの設定を入れ、`test`で指定したコマンドが成功することを定期的に確認します。
- app 側では db 側に依存することを宣言しています。
