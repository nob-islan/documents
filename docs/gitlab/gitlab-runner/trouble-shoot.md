# トラブルシュート集

## GitLabのドメインをRunner側で名前解決

GitLabにドメインを当てているなどしていて「名前解決ができない」のようなメッセージが出て落ちる場合は`config.toml`に下記を追加します。

cf. https://docs.gitlab.com/runner/configuration/advanced-configuration/

```toml
  [runners.docker]
    extra_hosts = ["${ドメイン名}:${GitLabのIPアドレス}"]
```

## Dockerネットワーク内でRunnerからGitLabに疎通をとる

同一docker-compose内でGitLabおよびGitLab Runnerを起動している場合において、runner側からGitLabに疎通をとるために`config.toml`に下記を追加します。

cf. https://docs.gitlab.com/runner/configuration/advanced-configuration/

```toml
[[runners]]
  clone_url = "http://${GitLabのサービス名}"

  [runners.docker]
    network_mode = "${ネットワーク名}"
```
