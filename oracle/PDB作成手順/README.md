# PDB 作成手順

PDB の作成手順です。

cf.  
https://xn--w8j8bac3czf5bl7e.com/2018/07/09/pdbの作成方法/

## 前提

DBA として CDB に接続しておいてください。

```
SQL> SHOW con_name;

CON_NAME
------------------------------
CDB$ROOT
```

## 作成手順

- PDB の元となるシードファイルの位置を確認します。

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

- PDB データファイル用のディレクトリ作成

```sql
-- CDBに接続
conn / as sysdba;
-- pdbseedと同列になるようにディレクトリを作成
!mkdir /opt/oracle/oradata/XE/${PDBディレクトリ名}
```

- PDB 作成

```sql
CREATE
    pluggable database ${PDB名}
    admin user ${adminユーザ名}
    identified by ${パスワード}
    file_name_convert = ('/opt/oracle/oradata/XE/pdbseed/', '/opt/oracle/oradata/XE/${PDBディレクトリ名}')
;
```

- PDB 起動

```sql
ALTER pluggable database ${PDB名} open;
```
