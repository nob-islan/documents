# はじめての nip.io

## 概要

フリーで使えるドメインです。`sample.192.168.151.10.nip.io` などのドメインについて`192.168.151.10`と返すなど、登録不要でドメインを設定することができます。

cf. https://nip.io/

## 使用例

GitLab Pages を簡単にセットアップすることができます:

```yaml
services:
  gitlab:
    image: gitlab/gitlab-ee:latest
    container_name: nob-gitlab
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "http://gitlab.{server_ip}.nip.io"
        gitlab_rails['gitlab_shell_ssh_port'] = 2022
        pages_external_url "http://pages.{server_ip}.nip.io"
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
