# DockerでGitLabを構築

## gitlabコンテナを構築

```yaml
services:
  gitlab:
    image: gitlab/gitlab-ce:latest
    container_name: nob-gitlab
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

`docker compose up -d`でコンテナを起動します。アクセスできるようになるまでに数分ラグがあります。Error: 502であれば根気良く待ってください。しばらく待って`http://${IP_address}:80`にアクセスするとgitlabの画面が表示されます。  
rootユーザのパスワードはサーバ内のファイルに記載されているため、以下のコマンドで調べられます。

```shell
docker exec -it nob-gitlab grep 'Password:' /etc/gitlab/initial_root_password
```

### Let's Encryptを使ってSSL通信をできるようにする

`external_url`をHTTPSプロトコルで設定するとLet’s EncryptでSSL通信ができるようにしてくれます。cf. https://docs.gitlab.com/omnibus/settings/ssl/#enable-the-lets-encrypt-integration

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

### 自己証明書を使ってSSL通信をできるようにする

下記でコンテナを起動すると`https://${設定したドメイン}`でGitLabにアクセスできます:

```yaml
services:
  gitlab:
    image: gitlab/gitlab-ee:latest
    container_name: nob-gitlab
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "https://gitlab.example.nob"
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
      - "./volumes/ssl:/etc/gitlab/ssl"
```

```
$ ls -l volumes/ssl/
total 12
-rw-r--r-- 1 root root 1123 Apr 27 12:25 gitlab.example.nob.crt
-rw-r--r-- 1 root root  956 Apr 27 12:25 gitlab.example.nob.csr
-rw------- 1 root root 1704 Apr 27 12:25 gitlab.example.nob.key
```

## gitlab-runnerコンテナを構築

gitlab-runnerは下記で起動できます:

```yaml
services:
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: nob-gitlab-runner
    volumes:
      - "/srv/gitlab/gitlab-runner/config:/etc/gitlab-runner"
      - "/var/run/docker.sock:/var/run/docker.sock"
```

`docker compose up -d`を実行してコンテナを作成。起動後、GitLab GUI上の "Create project runner" から作成したコマンドから、対話形式でrunnerを構築できます。

### GitLabが 自己証明書でSSL通信をしている場合

runnerコンテナの中に、GitLab本体が使っている証明書`{ドメイン名}.crt`として配置する必要があります。例として、`docker-compose.yaml`に下記を追加してください:

```yaml
volumes:
  - "./volumes/ssl/server.crt:/etc/gitlab-runner/certs/${ドメイン名}.crt"
```
