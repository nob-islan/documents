# k9s インストール手順

Kubernetes クラスター管理ツール **k9s** のインストールおよび使用方法について記載します。

cf.

- https://k9scli.io/
- https://github.com/derailed/k9s

## インストール手順

```shell
# バージョンはhttps://github.com/derailed/k9s/releasesで確認
K9S_VERSION=v0.50.6
wget https://github.com/derailed/k9s/releases/download/${K9S_VERSION}/k9s_linux_amd64.deb

# k9sインストール
sudo apt install ./k9s_linux_amd64.deb

# 不要ファイル削除
rm k9s_linux_amd64.deb
```

## WIP: 使用方法

- 起動

```shell
# デフォルトまたはKUBECONFIGで設定されたcontextを利用する場合
k9s
# contextを指定する場合
k9s --context nobcontext
```
