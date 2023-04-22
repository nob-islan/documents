# First ansible

構築から簡単な動作確認までを行います。

## 構築

### インストール

[公式ドキュメント](https://docs.ansible.com/ansible/2.9_ja/installation_guide/intro_installation.html)を参考に ansible をインストールします。

```
sudo apt update
sudo apt install software-properties-common
sudo apt-add-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```

### ssh 接続の準備

管理ホスト（ansible のプレイブックなどを管理するホスト）から対象ホスト（プレイブック内の処理が実行されるホスト）に対して、パスフレーズなしで ssh 接続できるようにします。

ssh キーを作成します。

```
ssh-keygen -t rsa
```

対象ホストに公開鍵を記憶させます。

```
ssh-copy-id -i ~/.ssh/id_rsa.pub ${user_name}@${ip_address}
```

## 使用例

### ping モジュールの実行

対象ホストで行う操作のことを`モジュール`というらしい。

ping モジュールを実行します。

```
ansible ${対象ホストのIPアドレス} -m ping
```

### hosts を記載してプレイブックを実行

インベントリファイル`/etc/ansible/hosts`を作成します。

```
[master]
${管理ホストのIPアドレス}
[node]
${対象ホストのIPアドレス}
```

プレイブックファイル`/etc/ansible/first.yaml`を作成します。

```yaml
- hosts: node #対象ホストを指定する。
  tasks: #実行するtaskを指定する。
    - name: ディレクトリを作成する。
      file: path=/tmp/nob/first state=directory
```

プレイブックコマンドを実行します。`-i`はインベントリファイル指定のオプションです。

```
ansible-playbook first.yaml -i hosts
```
