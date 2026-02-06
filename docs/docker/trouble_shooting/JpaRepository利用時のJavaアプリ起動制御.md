# JpaRepository起動時のJavaアプリ制御

JpaRepositoryを利用してrepository層を実装したJavaアプリについて、`docker-compose.yaml`にJava, DBの設定を単純に記載しただけだと起動がうまくいきませんでした。Java側からDBに接続しに行くのにDBの起動が間に合わず、接続に失敗して落ちることが原因だったため、下記のように順序制御を入れる必要があります:

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

- db側ではヘルスチェックの設定を入れ、`test`で指定したコマンドが成功することを定期的に確認します。
- app側ではdb側に依存することを宣言しています。
