# volume 設定方法

ホストマシンのディレクトリを開発コンテナ側にも見えるようにします。

## 設定

下記要領で source, target を設定します。相対パスだとエラーになります:

```json
  "mounts": [
    {
      "type": "bind",
      "source": "/path/to/source/dir",
      "target": "/path/to/target/dir"
    }
  ],
```
