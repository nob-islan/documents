# スキーマ作成手順

スキーマの新規作成手順です。

cf.  
https://blog.dreamhanks.com/oracle-databaseでユーザを作成する方法/

## 前提

Oracle DB を構築して、DBA としてログインできるようにしておいてください。

```
$ sqlplus / as sysdba

SQL*Plus: Release 21.0.0.0.0 - Production on Fri May 5 00:38:20 2023
Version 21.3.0.0.0

Copyright (c) 1982, 2021, Oracle.  All rights reserved.


Connected to:
Oracle Database 21c Express Edition Release 21.0.0.0.0 - Production
Version 21.3.0.0.0

SQL>
```

## 作成手順

- コンテナデータベースに接続していることを確認

```sql
SHOW con_name;
```

- プラガブルデータベースの名前を確認

```sql
SHOW pdbs;
```

- プラガブルデータベースに接続

```sql
ALTER session SET container = ${PDB名};
```

- スキーマの作成

```sql
CREATE
    user ${ユーザ名}
    identified by ${パスワード}
;
```

- ユーザへの権限付与

```sql
GRANT
    create session --DB接続権限
    , create table --テーブル作成権限
    , create view --view作成権限
    , create sequence --シーケンス作成権限
    , create trigger --データベーストリガー作成権限
    , create synonym --シノニム作成権限
TO
    ${ユーザ名}
;
```

- 接続確認

oracle DB のコンテナないからの接続例

```
sqlplus ${スキーマ名}/${パスワード}@${PDB名}
```

ホスト側からの接続例

```
sqlplus ${スキーマ名}/${パスワード}@//localhost:1521/${PDB名}
```
