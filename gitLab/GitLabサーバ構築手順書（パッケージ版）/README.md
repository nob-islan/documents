# GitLab サーバ構築手順書（パッケージ版）

だいたい公式ドキュメント通りです。https://about.gitlab.com/install/

## GitLab サーバ手順

構成、必要な依存関係をインストールします。

```
sudo apt-get update
sudo apt-get install -y curl openssh-server ca-certificates tzdata perl
```

postfix をインストールします（メール関係が不要ならスキップしてもいいかも）。

```
sudo apt-get install -y postfix
```

GitLab のパッケージリポジトリを追加、依存関係のインストールします

```
curl https://packages.gitlab.com/install/repositories/gitlab/gitlab-ee/script.deb.sh | sudo bash
```

GitLab インストール

```
sudo apt install gitlab-ee
```

DNS の設定をしないのであれば`http://localhost:80`で GitLab にアクセスできます。ただしログイン画面が表示されるまでに時間がかかる。Error: 502 が出るようであればしばらく待ってみるとよいです。  
root 用のログインパスワードは`/etc/gitlab/initial_root_password`に格納されています。24 時間経つとファイルが消えるので早めにパスワードを変更する必要があります。
