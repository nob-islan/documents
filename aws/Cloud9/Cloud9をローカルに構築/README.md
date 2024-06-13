# Cloud9 をローカルに構築

aws 開発ツールを利用できる Web IDE: Cloud9 をローカルに構築する方法です。

## 構築手順

- node および nvm が入っている必要があります。

  ```shell
  node -v
  npm -v
  ```

- python が必要です。なければインストールしてください。

  ```shell
  sudo apt update
  sudo apt install -y python2
  ```

- cloud9 を github からダウンロードします。

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
