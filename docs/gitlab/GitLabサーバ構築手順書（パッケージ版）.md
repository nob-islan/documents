# GitLabサーバ構築手順書（パッケージ版）

## GitLabサーバ手順

cf. https://docs.gitlab.com/install/package/ubuntu/

構成、必要な依存関係をインストールします。

```shell
sudo apt install -y curl
```

GitLabのパッケージリポジトリを追加、依存関係のインストールします

```shell
curl "https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.deb.sh" | sudo bash
```

GitLabをインストールします

```shell
sudo EXTERNAL_URL="https://gitlab.example.com" apt install gitlab-ee
```

DNSの設定をしないのであれば http://localhost:80 でGitLabにアクセスできます。ただしログイン画面が表示されるまでに時間がかかります。Error: 502が出るようであればしばらく待ってみるとよいです。  
root用のログインパスワードは`/etc/gitlab/initial_root_password`に格納されています。24時間経つとファイルが消えるので早めにパスワードを変更する必要があります。

## GitLab Runnerサーバ手順

cf. https://docs.gitlab.com/runner/install/linux-repository/

GitLabリポジトリを追加します

```shell
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
```

GitLab Runnerをインストールします

```shell
sudo apt install gitlab-runner
```
