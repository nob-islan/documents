# はじめてのPostgreSQLスキーマ構築

PostgreSQLにてスキーマおよびそれを操作するユーザの構築を行います。

cf. https://www.postgresql.org/docs/

## データベース作成

### リファレンス

- https://www.postgresql.org/docs/current/sql-createdatabase.html

### 手順

- rootユーザでログインします:

```shell
psql
```

- データベースを作成します:

```sql
CREATE DATABASE easydb;
```

- データベース一覧を確認します:

```sql
\l
```

```
root=# \l
                                                 List of databases
   Name    | Owner | Encoding | Locale Provider |  Collate   |   Ctype    | Locale | ICU Rules | Access privileges
-----------+-------+----------+-----------------+------------+------------+--------+-----------+-------------------
 easydb    | root  | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 postgres  | root  | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 root      | root  | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           |
 template0 | root  | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | =c/root          +
           |       |          |                 |            |            |        |           | root=CTc/root
 template1 | root  | UTF8     | libc            | en_US.utf8 | en_US.utf8 |        |           | =c/root          +
           |       |          |                 |            |            |        |           | root=CTc/root
(5 rows)
```

## スキーマ作成

### リファレンス

- https://www.postgresql.org/docs/current/sql-createschema.html

### 手順

- データベースを切り替えます:

```sql
\c easydb
```

- スキーマを作成します:

```sql
CREATE SCHEMA easyschema;
```

- スキーマ一覧を確認します:

```sql
\dn
```

```
easydb=# \dn
        List of schemas
    Name    |       Owner
------------+-------------------
 easyschema | root
 public     | pg_database_owner
(2 rows)
```

## ユーザ作成

### リファレンス

- https://www.postgresql.org/docs/current/sql-createuser.html
- https://www.postgresql.org/docs/current/sql-grant.html
- https://www.postgresql.org/docs/current/sql-alterrole.html

### 手順

- ユーザを作成します:

```sql
CREATE USER easyschemauser WITH PASSWORD 'easyschemapass';
```

- ユーザにスキーマへの権限を付与します:

```sql
GRANT USAGE ON SCHEMA easyschema TO easyschemauser;
```

- ユーザにテーブルへの権限を付与します:

```sql
GRANT ALL ON ALL TABLES IN SCHEMA easyschema TO easyschemauser;
```

- ユーザに割り当てられた権限を確認します:

```sql
\dn+
```

```
easydb=# \dn+
                                         List of schemas
    Name    |       Owner       |           Access privileges            |      Description
------------+-------------------+----------------------------------------+------------------------
 easyschema | root              | root=UC/root                          +|
            |                   | easyschemauser=U/root                  |
 public     | pg_database_owner | pg_database_owner=UC/pg_database_owner+| standard public schema
            |                   | =U/pg_database_owner                   |
(2 rows)
```

- （任意）スキーマ検索パスを設定します:

```sql
ALTER ROLE easyschemauser SET search_path=easyschema;
```
