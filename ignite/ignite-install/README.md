# Ignite のインストール

公式ドキュメント: https://ignite.apache.org/docs/latest/

## openjdk のインストール

パッケージインデックスを更新します。

```
sudo apt update
```

Java が既にインストールされているか確認します。

```
java -version
```

インストールされていない場合は推奨コマンド群が出てくるので、必要なバージョンのコマンドを叩けば OK です。

```
sudo apt install openjdk-11-jre-headless
```

環境変数`JAVA_HOME`を設定します。

```
# java_home.shを作成
sudo vi /etc/profile.d/java_home.sh
```

`java_home.sh`に以下の内容を記載します。

```
export JAVA_HOME=`echo $(dirname $(readlink $(readlink $(which java)))) | sed -e 's/\/bin$//g' | sed -e 's/\/jre$//g'`
```

```
# JAVA_HOME反映
source /etc/profile.d/java_home.sh

# 確認
echo $JAVA_HOME
```

## Ignite のインストール

[公式サイト](https://ignite.apache.org/download.cgi)から zip ファイルをダウンロードします。Binary Releases を選択してください。その後、zip ファイルを`/opt`配下に展開します。

```
cd /opt
sudo unzip ${zipファイルのパス}
sudo ln -s ${binファイルのパス} /opt/apache-ignite
```

Ignite を起動します。

```
cd /opt/apache-ignite/bin
sudo ./ignite.sh ../examples/config/example-ignite.xml
```
