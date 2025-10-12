# Docker インストール

docker および docker-compose をインストールします。

## 自動化したもの

```shell
# vimインストール
sudo apt -y install vim

# .vimrcファイルの作成
cat << EOF > ~/.vimrc
set nocompatible
EOF

# パッケージインストール
sudo apt update
sudo apt -y install ca-certificates curl gnupg lsb-release

# GPG 鍵の入手
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# リポジトリの登録
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engineインストール
sudo apt -y update
sudo apt -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# ユーザを docker グループに追加
sudo usermod -aG docker $USER

# 再起動
sudo reboot
```

## 事前準備

### vim のインストール

docker-compse.yaml を編集する際に使います。

vim のインストール

```shell
sudo apt-get install vim
```

.vimrc ファイルの作成

```shell
vi ~/.vimrc
```

ファイル内に`set nocompatible`と記入します。

## Docker のインストール

cf. https://docs.docker.com/engine/install/ubuntu/

- 必要なパッケージをインストールします:

```shell
sudo apt-get update
```

```shell
 sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```

- GPG 鍵を入手します:

```shell
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

- リポジトリを登録します:

```shell
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

- Docker Engine をインストールします:

```shell
sudo apt-get update
```

```shell
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

- インストールが成功していることを確認します:

```shell
sudo docker --version
```

- docker が起動していることを確認します:

```shell
systemctl status docker
```

`active(running)`になっていれば OK です。

- ユーザを docker グループに追加します:

```shell
sudo usermod -aG docker $USER
```

グループが存在しない場合は`sudo groupadd docker`で作成します。マシンの再起動後、必要であれば`sudo systemctl restart docker`で docker を再起動します。
