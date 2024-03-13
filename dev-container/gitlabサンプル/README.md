# GitLab サンプル

M1 Mac 上で無理やり動かす用

## ディレクトリ構成

```
gitlab/
  ├─.devcontainer/
  │    ├─devcontainer.json
  │    ├─docker-compose.yml
  │    └─Dockerfile
  └─workspace/docker/gitlab
       └─docker-compose.yml
```

## 設定

### .devcontainer

#### devcontainer.json

dind をベースとして、コンテナ上で GitLab コンテナを起動しようとしています。

```json
{
  "name": "nob-gitlab",

  "dockerComposeFile": "./docker-compose.yml",
  "service": "nob-gitlab",
  "workspaceFolder": "/workspace",

  "customizations": {
    "vscode": {
      "extensions": []
    }
  }
}
```

#### docker-compose.yml

```yml
version: "3.7"
services:
  nob-gitlab:
    container_name: nob-gitlab
    build: .
    privileged: true
    ports:
      - 80:80
    volumes:
      - "../workspace:/workspace"
```

```Dockerfile
FROM docker:dind
```

### workspace/docker/gitlab

#### docker-compose.yml

GitLab の設定です。

```yml
version: "3"
services:
  gitlab:
    image: gitlab/gitlab-ee:16.9.1-ee.0
    container_name: nob-gitlab
    environment:
      GITLAB_OMNIBUS_CONFIG: |
        external_url "http://localhost:80"
        gitlab_rails['gitlab_shell_ssh_port'] = 2022
    ports:
      - "80:80"
      - "2022:22"
    volumes:
      - "/srv/gitlab/config:/etc/gitlab"
      - "/srv/gitlab/logs:/var/log/gitlab"
      - "/srv/gitlab/data:/var/opt/gitlab"
```
