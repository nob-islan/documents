# First ansible

構築から簡単な動作確認までを行う。

## 構築

### インストール

[公式ドキュメント](https://docs.ansible.com/ansible/2.9_ja/installation_guide/intro_installation.html)を参考にansibleをインストールする。

```
sudo apt update
sudo apt install software-properties-common
sudo apt-add-repository --yes --update ppa:ansible/ansible
sudo apt install ansible
```

### ssh接続の準備
管理ホスト（ansibleのプレイブックなどを管理するホスト）から対象ホスト（プレイブック内の処理が実行されるホスト）に対して、パスフレーズなしでssh接続できるようにする。

sshキーを作成する。
```
ssh-keygen -t rsa
```

対象ホストに公開鍵を記憶させる。
```
ssh-copy-id -i ~/.ssh/id_rsa.pub ${user_name}@${ip_address}
```

## 使い方

### pingモジュールの実行
対象ホストで行う操作のことを`モジュール`というらしい。

pingモジュールを実行する。
```
ansible ${対象ホストのIPアドレス} -m ping
```

### hostsの記載

インベントリファイル`/etc/ansible/hosts`を作成する。
```
[master]
${管理ホストのIPアドレス}
[node]
${対象ホストのIPアドレス}
```

プレイブックファイル`/etc/ansible/first.yaml`を作成する。
```yaml
- hosts: node    #対象ホストを指定する。
  tasks:         #実行するtaskを指定する。
    - name: ディレクトリを作成する。
      file: path=/tmp/nob/first state=directory
```

プレイブックコマンドを実行する。`-i`はインベントリファイル指定のオプション。
```
ansible-playbook first.yaml -i hosts
```