# Docker コンテナで GitLab サーバを立てる

## Docker のインストール

[Docker インストール手順](../Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/README.md)を参考に Docker をインストールします。

## gitlab コンテナを構築

事前に`ip a`コマンドで仮想マシンの IP アドレスを調べておき、docker-compose.yml を作成します。

```yaml
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
      - "80:80"
      - "2022:22"
    volumes:
      - "/srv/gitlab/config:/etc/gitlab"
      - "/srv/gitlab/logs:/var/log/gitlab"
      - "/srv/gitlab/data:/var/opt/gitlab"
```

`docker-compose up -d`でコンテナを起動します。アクセスできるようになるまでに数分ラグがあります。Error: 502 であれば根気良く待ってください。しばらく待って`http://${IP_address}:80`にアクセスすると gitlab の画面が表示されます。  
root ユーザのパスワードはサーバ内のファイルに記載されているため、以下のコマンドで調べられます。

```
sudo docker exec -it gitlab-test grep 'Password:' /etc/gitlab/initial_root_password
```

### SSL 通信をできるようにする

下記を追加すると`https://${設定したドメイン}`で GitLab にアクセスできます:

```yaml
environment:
  GITLAB_OMNIBUS_CONFIG: |
    external_url "https://{ドメイン}:443"
    nginx['redirect_http_to_https'] = true
    nginx['listen_port'] = 443
    nginx['ssl_certificate'] = "/etc/gitlab/ssl/server.crt"
    nginx['ssl_certificate_key'] = "/etc/gitlab/ssl/server.key"

volumes:
  - "./volumes/ssl:/etc/gitlab/ssl"
```

## gitlab-runner コンテナを構築

gitlab コンテナ構築時に使用した docker-compose.yml に以下を追記します：

```yaml
gitlab-runner:
  image: gitlab/gitlab-runner:latest
  container_name: gitlab-runner-test
  restart: always
  volumes:
    - "/srv/gitlab/gitlab-runner/config:/etc/gitlab-runner"
    - "/var/run/docker.sock:/var/run/docker.sock"
```

`docker-compose up -d`を実行してコンテナを作成。  
コンテナ起動後、`docker exec -it gitlab-runner-test /bin/bash`でコンテナの中に入ります。`gitlab-runner register`で各種設定を対話形式で進めます：

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
```

`${instance URL}`および`${dregistration token}`については GitLab の Settings -> CI/CD -> Runners で設定を確認して入力します。  
リポジトリにて`.gitlab-ci.yml`ファイルを作成します、以下テストファイル：

```
job1:
  stage: deploy
  tags:
    - ${tags}
  script:
    - echo "test"
```

push すれば runner が走ります。

ジョブを走らせている際に「名前解決ができない」のようなメッセージが出て落ちる場合は、runner のコンテナ内の`/etc/gitlab-runner/config.toml`に下記を追加します。

```
  [runners.docker]
  ...
    extra_hosts = ["${ドメイン名}:${ホストOSのIPアドレス}"]
```

`apt-get update` `apt-get install vim`で vim とかを入れておく必要があるので注意。
