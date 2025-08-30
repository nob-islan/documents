# GitLab Pages を有効化する

cf. https://docs.gitlab.com/administration/pages/

GitLab Pages を有効化します。

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
