# ansible インストール

構築から簡単な動作確認までを行います。

## 構築

### インストール

[公式ドキュメント](https://docs.ansible.com/ansible/2.9_ja/installation_guide/intro_installation.html)を参考に ansible をインストールします。

```shell
sudo apt update
sudo apt install software-properties-common
sudo apt-add-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```

### 接続

#### 接続準備

管理ホスト（ansible のプレイブックなどを管理するホスト）から対象ホスト（プレイブック内の処理が実行されるホスト）に対して、パスフレーズなしで ssh 接続できるようにします。

ssh キーを作成します。

```shell
ssh-keygen -t rsa -f ~/.ssh/first-key
```

対象ホストに公開鍵を記憶させます。

```shell
# 管理ホストから対象ホストへ公開鍵を転送
scp ~/.ssh/first-key.pub ${ユーザ名}@${ホスト名}:~/.ssh

# 対象ホストにて、公開鍵をauthorized_keysに追加
cat ~/.ssh/first-key.pub >> ~/.ssh/authorized_keys
```

インベントリファイル`/etc/ansible/hosts`を作成します。

```
[master]
${管理ホストのIPアドレス}
[node]
${対象ホストのIPアドレス}
```

#### 接続確認

ping モジュールを実行します（対象ホストで行う操作のことを`モジュール`というらしい）。

```shell
ansible ${対象ホストのIPアドレス} -m ping --private-key ~/.ssh/first-key
```
