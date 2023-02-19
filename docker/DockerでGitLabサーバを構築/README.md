# DockerコンテナでGitLabサーバを立てる

## 事前準備
仮想マシン、数々のエラーと戦う時間を用意する。

### スペック
- ubuntu: 20.04

### ubuntu側の準備

#### ネットワーク構成
VirtualBoxの設定にて、「設定」->「ネットワーク」->「割り当て」を「ブリッジアダプター」にする。これで仮想マシンがホストマシンと同一のネットワーク上に存在するように見え、自動的にIPアドレスが割り当てられる。

#### vimのインストール
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
[Dockerインストール手順](../Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/README.md)を参考にDockerをインストールする。

## gitlabコンテナを構築
事前に`ip a`コマンドで仮想マシンのIPアドレスを調べておく。  
docker-compose.ymlを作成
```
version: '3'
services:
  gitlab:
    image: gitlab/gitlab-ce:latest
    container_name: gitlab-test
    restart: always
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "http://${IP_address}:80"
        gitlab_rails['gitlab_shell_ssh_port'] = 2022
    ports:
    - '80:80'
    - '2022:22'
    volumes:
    - '/srv/gitlab/config:/etc/gitlab'
    - '/srv/gitlab/logs:/var/log/gitlab'
    - '/srv/gitlab/data:/var/opt/gitlab'
```
`docker-compose up -d`でコンテナを起動する。アクセスできるようになるまでに数分ラグがある。Error: 502であれば根気良く待つこと。しばらく待って`http://${IP_address}:80`にアクセスするとgitlabの画面が表示される。  
rootユーザのパスワードはサーバ内のファイルに記載されているため、以下のコマンドで調べる。
```
sudo docker exec -it gitlab-test grep 'Password:' /etc/gitlab/initial_root_password
```

sshによってリポジトリのクローンなどをする場合は、2022ポート経由で行う。

## gitlab-runnerコンテナを構築
gitlabコンテナ構築時に使用したdocker-compose.ymlに以下を追記する：
```
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: gitlab-runner-test
    restart: always
    volumes:
    - '/srv/gitlab/gitlab-runner/config:/etc/gitlab-runner'
    - '/var/run/docker.sock:/var/run/docker.sock'
```
`docker-compose up -d`を実行してコンテナを作成。  
コンテナ起動後、`docker exec -it gitlab-runner-test /bin/bash`でコンテナの中に入る。`gitlab-runner register`で各種設定を対話形式で進める：  
```
Enter the GitLab instance URL (for example, https://gitlab.com/):
${instance URL}
Enter the registration token:
${registration token}
Enter a description for the runner:
[0d7a963169c9]: ${description for the runner}
Enter tags for the runner (comma-separated):
${tags}
Registering runner... succeeded                     runner=cgdeSzvu
Enter an executor: custom, docker-ssh, ssh, docker+machine, docker, parallels, shell, virtualbox, docker-ssh+machine, kubernetes:
${docker}
Enter the default Docker image (for example, ruby:2.7):
${ruby:2.7}
````
`${instance URL}`および`${dregistration token}`についてはGitLabのSettings -> CI/CD -> Runnersで設定を確認して入力。  
リポジトリにて`.gitlab-ci.yml`ファイルを作成、以下テストファイル：
```
job1:
  stage: deploy
  tags:
    - ${tags}
  script:
    - echo "test"
```
pushすればrunnerが走る。

ジョブを走らせている際に「名前解決ができない」のようなメッセージが出て落ちる場合は、runnerのコンテナ内の`/etc/gitlab-runner/config.toml`に下記を追加する。
```
  [runners.docker]
  ...
    extra_hosts = ["${ドメイン名}:${ホストOSのIPアドレス}"]    
```
`apt-get update` `apt-get install vim`でvimとかを入れておく必要があるので注意。
