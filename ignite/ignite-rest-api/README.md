# Ignite の Rest API

Ignite に実装されている Rest API を叩く方法を記載します。  
cf: https://ignite.apache.org/docs/latest/quick-start/restapi

## 事前準備

### モジュールの準備

[公式サイト](https://ignite.apache.org/docs/latest/setup#enabling-modules)を参考に、`libs/optional`配下にある`ignite-rest-http`を`libs`に移動します。

```
sudo cp -r ignite-rest-http/ ..
```

Ignite 起動

```
sudo ./ignite.sh ../examples/config/example-ignite.xml
```

### API の呼び出し

キャッシュの作成

```
curl "http://localhost:8080/ignite?cmd=getorcreate&cacheName=myCache"
```

データをキャッシュに登録

```
curl "http://localhost:8080/ignite?cmd=put&key=1&val="Hello_World"&cacheName=myCache"
```

キーを指定してデータをキャッシュから取得

```
curl "http://localhost:8080/ignite?cmd=get&key=1&cacheName=myCache"
```
