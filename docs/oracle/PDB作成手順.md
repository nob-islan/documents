# PDB作成手順

PDBの作成手順です。

cf.  
https://xn--w8j8bac3czf5bl7e.com/2018/07/09/pdbの作成方法/

## 前提

DBAとしてCDBに接続しておいてください。

```
SQL> SHOW con_name;

CON_NAME
------------------------------
CDB$ROOT
```

## 作成手順

- PDBの元となるシードファイルの位置を確認します。

```sql
-- PDBシードに接続
ALTER session SET container = PDB$SEED;
-- ファイルの位置を確認
SELECT file_name FROM dba_data_files;
```

出力例

```
SQL> ALTER session SET container = PDB$SEED;

Session altered.

SQL> select file_name from dba_data_files;

FILE_NAME
--------------------------------------------------------------------------------
/opt/oracle/oradata/XE/pdbseed/system01.dbf
/opt/oracle/oradata/XE/pdbseed/sysaux01.dbf
/opt/oracle/oradata/XE/pdbseed/undotbs01.dbf
```

- PDBデータファイル用のディレクトリ作成

```sql
-- CDBに接続
conn / as sysdba;
-- pdbseedと同列になるようにディレクトリを作成
!mkdir /opt/oracle/oradata/XE/${PDBディレクトリ名}
```

- PDB作成

```sql
CREATE
    pluggable database ${PDB名}
    admin user ${adminユーザ名}
    identified by ${パスワード}
    file_name_convert = ('/opt/oracle/oradata/XE/pdbseed/', '/opt/oracle/oradata/XE/${PDBディレクトリ名}')
;
```

- PDB起動

```sql
ALTER pluggable database ${PDB名} open;
```

- tnsnames.oraへの設定記述

下記接続情報を記載します。

```tnsnames.ora
${ネットワークサービス名} =
  (DESCRIPTION =
    (ADDRESS_LIST =
      (ADDRESS = (PROTOCOL = TCP)(HOST = 0.0.0.0)(PORT = 1521))
    )
    (CONNECT_DATA =
      (SERVICE_NAME = ${PDB名})
    )
  )
```
