# volume設定方法

ホストマシンのディレクトリを開発コンテナ側にも見えるようにします。

## 設定

下記要領でsource, targetを設定します。相対パスだとエラーになります:

```json
  "mounts": [
    {
      "type": "bind",
      "source": "/path/to/source/dir",
      "target": "/path/to/target/dir"
    }
  ],
```
