# GitLab Pages を有効化する

cf. https://docs.gitlab.com/administration/pages/

GitLab Pages を有効化します。

## コンテナ版手順

### 事前準備

下記を導入しておいてください:

- docker
- dnsmasq

### 手順

#### dnsmasq

- GitLab 本体は`gitlab.example.nob`, Pages は`pages.example.nob`で名前解決できるようにします:

```conf
# /etc/dnsmasq-hostsに記載
{gitlab IP} gitlab.example.nob
```

```conf
# /etc/dnsmasq.confに記載
address=/.pages.example.nob/{gitlab IP}
```

- 設定を反映します:

```shell
sudo systemctl restart dnsmasq
```

#### GitLab, GitLab Runner

下記で docker-compose を作成します:

```yml
services:
  gitlab:
    image: gitlab/gitlab-ee:latest
    container_name: nob-gitlab
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "http://gitlab.example.nob"
        gitlab_rails['gitlab_shell_ssh_port'] = 2022
      # 以下pages向け設定
        pages_external_url "http://pages.example.nob"
        gitlab_pages['enable'] = true
    ports:
      - "80:80"
      - "2022:22"
    volumes:
      - "/srv/gitlab/config:/etc/gitlab"
      - "/srv/gitlab/logs:/var/log/gitlab"
      - "/srv/gitlab/data:/var/opt/gitlab"
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: nob-gitlab-runner
    volumes:
      - "/srv/gitlab/gitlab-runner/config:/etc/gitlab-runner"
      - "/var/run/docker.sock:/var/run/docker.sock"
```

## パッケージ版手順

### 事前準備

下記を構築しておいてください:

- GitLab (パッケージ版)
- GitLab Runner (パッケージ版)
- dnsmasq

### 手順

#### dnsmasq

- GitLab 本体は`gitlab.example.nob`, Pages は`pages.example.nob`で名前解決できるようにします:

```conf
# /etc/dnsmasq-hostsに記載
{gitlab IP} gitlab.example.nob
```

```conf
# /etc/dnsmasq.confに記載
address=/.pages.example.nob/{gitlab IP}
```

- 設定を反映します:

```shell
sudo systemctl restart dnsmasq
```

#### GitLab

- `/etc/gitlab/gitlab.rb`に下記を追記します:

```rb
pages_external_url "http://pages.example.nob/"
gitlab_pages['enable'] = true
gitlab_pages['external_http'] = ['0.0.0.0:30090']
```

- 設定を反映します:

```shell
sudo gitlab-ctl reconfigure
```

上記設定後、ページ作成プロジェクトのパイプラインを回して成果物を作成し、Deploy -> Pages にて表示される URL から静的コンテンツにアクセスできます。
