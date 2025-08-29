# GitLab サーバ構築手順書（パッケージ版）

## GitLab サーバ手順

cf. https://docs.gitlab.com/install/package/ubuntu/

構成、必要な依存関係をインストールします。

```
sudo apt install -y curl
```

GitLab のパッケージリポジトリを追加、依存関係のインストールします

```
curl "https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.deb.sh" | sudo bash
```

GitLab をインストールします

```
sudo EXTERNAL_URL="https://gitlab.example.com" apt install gitlab-ee
```

DNS の設定をしないのであれば`http://localhost:80`で GitLab にアクセスできます。ただしログイン画面が表示されるまでに時間がかかる。Error: 502 が出るようであればしばらく待ってみるとよいです。  
root 用のログインパスワードは`/etc/gitlab/initial_root_password`に格納されています。24 時間経つとファイルが消えるので早めにパスワードを変更する必要があります。

## GitLab Runner サーバ手順

cf. https://docs.gitlab.com/runner/install/linux-repository/

GitLab リポジトリを追加します

```
curl -L "https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh" | sudo bash
```

GitLab Runner をインストールします

```
sudo apt install gitlab-runner
```
