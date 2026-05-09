# DinD環境サンプル

基本的には[docker-in-docker](https://github.com/devcontainers/features/tree/main/src/docker-in-docker)のfeatureを使いますが、トラブルなどで使えなくなった場合にDinD環境を構築する設定です:

```json
{
  "name": "DinD",
  "image": "docker:dind",
  "privileged": true,
  "overrideCommand": false
}
```
