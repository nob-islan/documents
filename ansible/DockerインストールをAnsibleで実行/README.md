# Docker インストールを Ansible で実行

[Docker インストールシェル](./docker_install.sh)を応用して、docker インストールおよび、ユーザの docker グループへの追加自動化します。

## 下準備

[first_ansible](../first_ansible/README.md)を参考にして ansible サーバを構築します。

## ディレクトリ構成

```sh
ansible
  └─playbook
      └─docker_install.yml
```

## 実装、実行手順

`docker_install.yml`を下記で作成します。

```yml
- hosts: node # 対象ホストを指定する。
  tasks: # 実行するtaskを指定する。
    # 下準備
    - name: vimインストール
      apt:
        name: vim
      become: yes
    - name: vimrcファイル作成
      shell: |
        cat << EOF > ~/.vimrc
        set nocompatible
        EOF

    # パッケージの更新
    - name: apt update
      apt:
        update_cache: yes
      become: yes
    - name: 関連パッケージのインストール
      apt:
        name:
          - ca-certificates
          - curl
          - gnupg
          - lsb-release
      become: yes
    - name: gpg鍵の入手
      shell: curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --yes --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    - name: リポジトリの登録
      shell: echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

    # dockerインストール
    - name: apt update
      apt:
        update_cache: yes
      become: yes
    - name: dockerインストール
      apt:
        name:
          - docker-ce
          - docker-ce-cli
          - containerd.io
          - docker-compose-plugin
      become: yes
    - name: ユーザをdockerグループに追加
      shell: sudo usermod -aG docker $USER

    # インストール完了
    - name: OS再起動
      reboot:
        reboot_timeout: 300
      become: yes
    - name: インストールが完了していることの確認
      shell: docker --version
```

プレイブックを実行します。

```
ansible-playbook ~/ansible/playbook/docker_install.yml -i /etc/ansible/hosts --private-key ~/.ssh/first-key -u ubuntu
```
