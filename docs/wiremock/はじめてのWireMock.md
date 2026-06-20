# はじめてのWireMock

[WireMock](https://wiremock.org/)を使ってモックサーバを立ち上げます。

cf. https://wiremock.org/docs/stubbing/

## 設定

`mappings/xxx.json`ファイルに下記要領でリクエストおよびレスポンスを定義します。ファイルは再起的に探索されるので、`mappings`配下のディレクトリ構成は任意です:

```json
{
  "request": {
    "method": "GET",
    "url": "/greet"
  },

  "response": {
    "status": 200,
    "jsonBody": {
      "message": "Hello, WireMock!"
    }
  }
}
```

## 動作確認

起動後、<http://localhost:8080/__admin/mappings> で設定内容を確認できます。
