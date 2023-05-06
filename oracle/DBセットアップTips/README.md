# DB セットアップ Tips

スキーマの作成など、セットアップに関わる Tips を書きます。

管理者としてログイン

```
sqlplus / as sysdba
```

現在接続しているコンテナ名の表示

```
SHOW con_name;
```

PDB 一覧を確認

```
SHOW pdbs;
```

コンテナ切り替え

```
ALTER session SET container = XXX;
```

ユーザ一覧の確認

```
SELECT * FROM all_users;
SELECT * FROM dba_users;
```

DBA 権限の付与

```
GRANT dba TO ${ユーザ名}
```
