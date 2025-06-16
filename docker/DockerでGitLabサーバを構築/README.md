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
docker exec -it gitlab-test grep 'Password:' /etc/gitlab/initial_root_password
```

### Let's Encrypt を使って SSL 通信をできるようにする

`external_url`を HTTPS プロトコルで設定すると Let’s Encrypt で SSL 通信ができるようにしてくれます。cf. https://docs.gitlab.com/omnibus/settings/ssl/#enable-the-lets-encrypt-integration

```yaml
services:
  gitlab:
    image: gitlab/gitlab-ee:latest
    container_name: nob-gitlab
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "https://nob-gitlab.ddo.jp"
        gitlab_rails['gitlab_shell_ssh_port'] = 2022
    ports:
      - "80:80"
      - "443:443"
      - "2022:22"
    volumes:
      - "/srv/gitlab/config:/etc/gitlab"
      - "/srv/gitlab/logs:/var/log/gitlab"
      - "/srv/gitlab/data:/var/opt/gitlab"
```

### 自己証明書を使って SSL 通信をできるようにする

下記でコンテナを起動すると`https://${設定したドメイン}`で GitLab にアクセスできます:

```yaml
services:
  gitlab:
    image: gitlab/gitlab-ee:latest
    container_name: nob-gitlab
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "https://gitlab.nob.jp"
        gitlab_rails['gitlab_shell_ssh_port'] = 2022
        nginx['redirect_http_to_https'] = true
        letsencrypt['enable'] = false
    ports:
      - "80:80"
      - "443:443"
      - "2022:22"
    volumes:
      - "/srv/gitlab/config:/etc/gitlab"
      - "/srv/gitlab/logs:/var/log/gitlab"
      - "/srv/gitlab/data:/var/opt/gitlab"
      # 証明書をコンテナに配置
      - "./volume/ssl:/etc/gitlab/ssl"
```

```
$ ls -l volume/ssl/
total 12
-rw-r--r-- 1 root root 1123 Apr 27 12:25 gitlab.nob.jp.crt
-rw-r--r-- 1 root root  956 Apr 27 12:25 gitlab.nob.jp.csr
-rw------- 1 root root 1704 Apr 27 12:25 gitlab.nob.jp.key
```

## gitlab-runner コンテナを構築

gitlab-runner は下記で起動できます:

```yaml
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: gitlab-runner-test
    volumes:
      - "/srv/gitlab/gitlab-runner/config:/etc/gitlab-runner"
      - "/var/run/docker.sock:/var/run/docker.sock"
```

`docker-compose up -d`を実行してコンテナを作成。  
コンテナ起動後、`docker exec -it gitlab-runner-test gitlab-runner register`で各種設定を対話形式で進めます：

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

### GitLab が 自己証明書で SSL 通信をしている場合

runner コンテナの中に、GitLab 本体が使っている証明書`{ドメイン名}.crt`として配置する必要があります。例として、`docker-compose.yml`に下記を追加してください:

```yml
volumes:
  - "./volumes/ssl/server.crt:/etc/gitlab-runner/certs/${ドメイン名}.crt"
```

## Runner トラブルシュート

GitLab にドメインを当てているなどしていて「名前解決ができない」のようなメッセージが出て落ちる場合は、runner のコンテナ内の`/srv/gitlab/gitlab-runner/config/config.toml`に下記を追加します。

```
  [runners.docker]
  ...
    extra_hosts = ["${ドメイン名}:${ホストOSのIPアドレス}"]
```
