# VSCodeでデバッグ

## 事前準備

- 下記内容で .vscode/launch.jsonを作成します:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "debug_easybatch",
      "request": "attach",
      "hostName": "localhost",
      "port": 8484
    }
  ]
}
```

- ブレークポイントを置いた上で、下記コマンドでアプリを起動します:

```shell
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8484"
```

- VSCodeの「実行とデバッグ」からデバッグしつつアプリを動かせます。
