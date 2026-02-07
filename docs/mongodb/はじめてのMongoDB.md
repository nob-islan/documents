# はじめてのMongoDB

[MongoDB](https://www.mongodb.com/)の使い方を記載します。

cf. https://www.mongodb.com/ja-jp/docs/manual/crud

## 認証

- ユーザ認証を行います:

```shell
# adminデータベースに認証情報が登録されている場合
mongosh -u {ユーザ名} -p --authenticationDatabase admin
```

## データベース管理

- データベース一覧表示:

```js
show dbs
```

- データベース切り替え:

```js
use {データベース名}
```

## データベース操作

`users`コレクションを例として記載します。

### insert

- データを追加:

```js
db.users.insertOne({
  name: "nob",
  age: 13,
});
```

- データを複数追加:

```js
db.users.insertMany([
  { name: "nob", age: 13 },
  { name: "snail", age: 706 },
]);
```

### select

- 全件取得:

```js
db.users.find();
```

- 条件付きで取得

```js
db.users.find({ age: { $gte: 25 } });
```

### update

- データ更新

```js
db.users.updateOne({ name: "nob" }, { $set: { age: 14 } });
```

### delete

- データ削除

```js
db.users.deleteOne({ name: "nob" });
```
