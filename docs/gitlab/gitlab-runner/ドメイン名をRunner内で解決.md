# ドメイン名をRunner内で解決

```
error checking push permissions -- make sure you entered the correct tag name, and that you are authenticated correctly, and try again: checking push permission for "harbor.local:80/easyapp/easyapp:test": creating push check transport for harbor.local:80 failed: Get "https://harbor.local:80/v2/": dial tcp: lookup harbor.local on 127.0.0.11:53: server misbehaving; Get "http://harbor.local:80/v2/": dial tcp: lookup harbor.local on 127.0.0.11:53: server misbehaving
```

上記エラーのように、GitLabやHarborなどにドメインを当てていて名前解決ができない場合は`config.toml`に下記を追加します。

cf. https://docs.gitlab.com/runner/configuration/advanced-configuration/

```toml
  [runners.docker]
    extra_hosts = ["${ドメイン名}:${GitLabのIPアドレス}"]
```
