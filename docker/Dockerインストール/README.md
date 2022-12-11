# Dockerインストール
dockerおよびdocker-composeをインストールします。

## 事前準備
マシンおよび数々のエラーと戦う時間を用意する。

### スペック
- ubuntu: 20.04

### vimのインストール
docker-compse.ymlを編集する際に使う。

vimのインストール
```
sudo apt-get install vim
```

.vimrcファイルの作成
```
vi ~/.vimrc
```
ファイル内に`set nocompatible`と記入。

## Dockerのインストール
cf. https://docs.docker.com/engine/install/ubuntu/  
<br>
必要なパッケージをインストール
```
sudo apt-get update
```
```
 sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
```
GPG鍵の入手  
GPG鍵はメールやファイルの暗号化、ファイルの署名に使うらしい。
```
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```
リポジトリの登録
```
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```
Docker Engine インストール
```
sudo apt-get update
```
```
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

インストールが成功していることを確認
```
sudo docker --version
```
dockerが起動していることを確認
```
systemctl status docker
```
`active(running)`になっていればOK

ユーザをdockerグループに追加
```
sudo usermod -aG docker $USER
```
グループが存在しない場合は`sudo groupadd docker`で作成する。

マシンの再起動後、必要であれば`sudo systemctl restart docker`でdockerを再起動する。

## docker-compose インストール
【M1 Mac 対応】docker compose の v1 -> v2 移行に伴って、docker-composeをインストールする必要がなくなった。  
`docker compose`コマンドを使えばいい、はず。
公式サイトを参考にすればなんとかなる　はず。https://docs.docker.com/compose/install/  
<br>
docker-composeの最新版ダウンロード
```
sudo curl -L https://github.com/docker/compose/releases/download/1.16.1/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
```
バイナリに対して実行権限を付与
```
sudo chmod +x /usr/local/bin/docker-compose
```
インストールが成功していることを確認
```
sudo docker-compose --version
```
