# ローカルにCloud9を構築

aws開発ツールを利用できるWeb IDE: Cloud9をローカルに構築する方法です。

cf. https://github.com/c9/core

## 構築手順

- nodeおよびnvmが入っている必要があります。

```shell
node -v
npm -v
```

- pythonが必要です。なければインストールしてください。

```shell
sudo apt update
sudo apt install -y python2
```

- cloud9をgithubからダウンロードします。

```shell
git clone https://github.com/c9/core.git c9sdk
cd c9sdk
scripts/install-sdk.sh
```

- 下記コマンドで起動します。

```shell
cd c9sdk
node server.js -p 80 -a nob:password -w ../workspace/ --listen {サーバのIPアドレス}
```
