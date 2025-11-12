# VSCode でコンテナの Java アプリをデバッグ

コンテナで起動している Java アプリケーションを VSCode 上でデバッグする手順です。

## 設定

- Dockerfile

```Dockerfile
FROM eclipse-temurin:21

# jarの配置などアプリ起動に必要なあれこれ

CMD java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:8484 -jar ${jar_file}
```

上記`CMD`によって、8484 ポートでデバッグを待ち受けます。

- docker-compose.yaml

```yaml
version: "3.7"
services:
  java:
    container_name: debug-test
    image: nob-java-app
    ports:
      - 8080:8080
      - 8484:8484
```

ホスト側の 8484 ポートとコンテナ側の 8484 ポートをフォワーディングします。

- launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "java",
      "name": "debug_nob-java-app",
      "request": "attach",
      "hostName": "localhost",
      "port": 8484
    }
  ]
}
```

プロジェクトのルートディレクトリ配下に`.vscode/launch.json`を作成します。

## 起動

VSCode 上で F5 キーを押せばデバッグが開始します。
