# Async-profilerでアプリのパフォーマンスを可視化

cf. https://github.com/async-profiler/async-profiler

## 事前準備

- Async-profilerをダウンロードします:

```shell
wget https://github.com/async-profiler/async-profiler/releases/download/v4.3/async-profiler-4.3-linux-arm64.tar.gz
tar -xzf async-profiler-4.3-linux-arm64.tar.gz
```

## 利用方法

- 監視対象アプリのプロセスIDを確認します:

```shell
jps -l | grep easyapp
```

- Flame graphを出力するコマンドサンプルです:

```shell
asprof -d 30 -f flamegraph.html ${PID}
```
