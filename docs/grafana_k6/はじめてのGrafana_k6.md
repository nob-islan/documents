# はじめてのGrafana k6

[Grafana k6](https://grafana.com/docs/k6/latest/)を使ってAPIの負荷テストを行います。

## 実行方法

パッケージ版がarm64に対応していないようなのでDockerで動かします。

cf. https://grafana.com/docs/k6/latest/get-started/running-k6/

- ローカルにスクリプトの雛形を作成します:

```shell
docker run --rm -u $(id -u) -v $PWD:/app -w /app grafana/k6 new
```

- スクリプトを実行します:

```shell
docker run --rm -i grafana/k6 run - <script.js
```
