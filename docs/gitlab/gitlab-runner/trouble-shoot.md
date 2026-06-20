# トラブルシュート集

## GitLabのドメインをRunner側で名前解決

GitLabにドメインを当てているなどしていて「名前解決ができない」のようなメッセージが出て落ちる場合は`config.toml`に下記を追加します。

cf. https://docs.gitlab.com/runner/configuration/advanced-configuration/

```toml
  [runners.docker]
    extra_hosts = ["${ドメイン名}:${GitLabのIPアドレス}"]
```
