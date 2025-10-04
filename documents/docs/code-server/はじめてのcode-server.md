# はじめての code-server

VSCode を Web 上で利用できる**code-server**（パッケージ版）構築方法です。

## インストール手順

cf. https://coder.com/docs/code-server/install#installsh

- インストールシェルを実行します。

```shell
curl -fsSL https://code-server.dev/install.sh | sh
```

- code-server を起動します。

```shell
sudo systemctl start code-server@{ユーザ}
```

- 設定ファイルを編集します。

```shell
# bind-addr, certなど
vim ~/.config/code-server/config.yaml
```

- code-server を再起動します。

```shell
sudo systemctl restart code-server@{ユーザ}
```

## 各種設定手順

`~/.config/code-server/config.yml`を編集して設定を入れます。

cf. https://coder.com/docs/code-server/guide
