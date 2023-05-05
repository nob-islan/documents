# sqlplus インストール手順

`sqlplus`コマンドをインストールします。

## インストール手順

### 下準備

- sqlplus パッケージをコンバートするためのパッケージをインストールしておきます。

```
sudo apt update
sudo apt install alien dpkg-dev debhelper build-essential
```

- [公式サイト](https://www.oracle.com/database/technologies/instant-client/linux-x86-64-downloads.html)からパッケージをダウンロードします。DB のバージョンに合わせて、下記を選択すれば多分大丈夫です（basic, sqlplus いずれも必要）。

> oracle-instantclient-basic-21.10.0.0.0-1.x86_64.rpm  
> oracle-instantclient-sqlplus-21.10.0.0.0-1.x86_64.rpm

- パッケージのコンバート

```
sudo alien <rpmのパッケージ名>.rpm
```

- インストール

```
sudo dpkg -i <コンバートしたrpm>.deb
```

- 共有ライブラリのパスを通す

```
# 特権ユーザで下記を実行（バージョンなどに従って微妙にディレクトリが変わります）
echo "/usr/lib/oracle/21/client64/lib" >> /etc/ld.so.conf
ldconfig
```
