# はじめてのOracleスキーマ構築

OracleデータベースにてPDBおよびスキーマの構築を行います。

cf. https://docs.oracle.com/en/database/oracle/oracle-database/21/index.html

## PDB作成

### リファレンス

- https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-PLUGGABLE-DATABASE.html
- https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/ALTER-PLUGGABLE-DATABASE.html

### 手順

- DBAとしてログインします:

```sql
sqlplus / as sysdba
```

- PDBを新規作成します:

```sql
CREATE PLUGGABLE DATABASE nobpdb
ADMIN USER nob IDENTIFIED BY nobpass
FILE_NAME_CONVERT = ('/opt/oracle/oradata/XE/pdbseed/', '/opt/oracle/oradata/XE/nobpdb/');
```

- `nobpdb`が作成されたことを確認します:

```sql
SHOW PDBS;
```

- `nobpdb`をOPENします:

```sql
ALTER PLUGGABLE DATABASE nobpdb OPEN;
```

- 状態を保存し、コンテナ再起動後に自動でOPENするようにします:

```sql
ALTER PLUGGABLE DATABASE nobpdb SAVE STATE;
```

## スキーマ作成

### リファレンス

- https://docs.oracle.com/en/database/oracle/oracle-database/21/sqlrf/CREATE-USER.html

### 手順

- PDBを`nobpdb`に切り替えます:

```sql
ALTER SESSION SET CONTAINER = nobpdb;
```

- PDBが切り替わったことを確認します:

```sql
SHOW CON_NAME;
```

- スキーマ（ユーザ）を作成します:

```sql
CREATE USER easydb IDENTIFIED BY easydbpass;
```

- ユーザに権限を付与します:

```sql
GRANT CONNECT, RESOURCE TO easydb;
GRANT UNLIMITED TABLESPACE TO easydb;
```

- 一度sqlplusからログアウトし、`easydb`スキーマにログインします:

```shell
sqlplus easydb/easydbpass@//localhost:1521/nobpdb
```

```shell
# TWO_TASKを使って省略形式でログインすることも可能です
export TWO_TASK=//localhost:1521/nobpdb
sqlplus easydb/easydbpass
```
