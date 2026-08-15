# DockerでMariaDBを構築

## 設定

### `docker-compose.yaml`

DBサーバおよびGUIでDBを管理できる`adminer`を起動します。

```yaml
services:
  db:
    container_name: nob-mariadb
    image: mariadb:latest
    ports:
      - 3306:3306
    volumes:
      - ./volumes/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
      # - MYSQL_ALLOW_EMPTY_PASSWORD=true # 空パスワードを許容する
  adminer:
    container_name: nob-adminer
    image: adminer
    ports:
      - 8081:8080
```

### `volumes/initdb.d/create_db.sql`

テーブル作成、初期データ投入などを行うSQLファイルです。

```sql
-- データベース作成
CREATE DATABASE eadb;

-- テーブル作成
CREATE TABLE eadb.users (
    id INT PRIMARY KEY AUTO_INCREMENT
    , username VARCHAR(10)
    , age VARCHAR(3)
);

-- ユーザ作成
CREATE USER eadbuser;
-- テーブルへの権限付与
GRANT ALL ON eadb.* TO eadbuser@'%' IDENTIFIED BY 'eadbpass';
```
