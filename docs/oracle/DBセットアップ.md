# DBセットアップTips

スキーマの作成など、セットアップに関わるTipsを書きます。

管理者としてログイン

```shell
sqlplus / as sysdba
```

現在接続しているコンテナ名の表示

```sql
SHOW con_name;
```

PDB一覧を確認

```sql
SHOW pdbs;
```

コンテナ切り替え

```sql
ALTER session SET container = XXX;
```

ユーザ一覧の確認

```sql
SELECT * FROM all_users;
SELECT * FROM dba_users;
```

DBA権限の付与

```sql
GRANT dba TO ${ユーザ名}
```
