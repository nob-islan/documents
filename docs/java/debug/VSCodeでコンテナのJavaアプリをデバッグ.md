`# VSCodeでコンテナのJavaアプリをデバッグ

コンテナで起動しているJavaアプリケーションをVSCode上でデバッグする手順です。

## 設定

- `Dockerfile`

```Dockerfile
FROM eclipse-temurin:25

# jarの配置などアプリ起動に必要なあれこれ

CMD java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:8484 -jar ${jar_file}
```

上記`CMD`によって、8484ポートでデバッグを待ち受けます。

- `docker-compose.yaml`

```yaml
services:
  java:
    container_name: debug-test
    image: nob-java-app
    ports:
      - 8080:8080
      - 8484:8484
```

ホスト側の8484ポートとコンテナ側の8484ポートをフォワーディングします。

- `launch.json`

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

VSCode上でF5キーを押せばデバッグが開始します。
