# Dockerネットワーク内でRunnerからGitLabに疎通をとる

同一docker-compose内でGitLabおよびGitLab Runnerを起動している場合において、runner側からGitLabに疎通をとるために`config.toml`に下記を追加します。

cf. https://docs.gitlab.com/runner/configuration/advanced-configuration/

```toml
[[runners]]
  clone_url = "http://${GitLabのサービス名}"

  [runners.docker]
    network_mode = "${ネットワーク名}"
```
