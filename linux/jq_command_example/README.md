# jq コマンド例

`jq`コマンドの tips です。cf https://www.wakuwakubank.com/posts/676-linux-jq/

## サンプル json

```json
{
  "total_count": 3,
  "items": [
    {
      "id": 111,
      "name": "aaa",
      "owner": {
        "id": 1111111,
        "type": "Organization"
      },
      "size": 10
    },
    {
      "id": 222,
      "name": "bbb",
      "owner": {
        "id": 2222222,
        "type": "User"
      },
      "size": 30
    },
    {
      "id": 333,
      "name": "ccc",
      "owner": {
        "id": 3333333,
        "type": "Organization"
      },
      "size": 25
    }
  ]
}
```

ワンライナーにしたやつ

```
{"total_count":3,"items":[{"id":111,"name":"aaa","owner":{"id":1111111,"type":"Organization"},"size":10},{"id":222,"name":"bbb","owner":{"id":2222222,"type":"User"},"size":30},{"id":333,"name":"ccc","owner":{"id":3333333,"type":"Organization"},"size":25}]}
```

## コマンド例

- 複数の要素を列挙

```shell
# -cオプションでワンライナー表示
$ cat sample.json | jq  -c '.items[] | [.id, .name]'
[111,"aaa"]
[222,"bbb"]
[333,"ccc"]
```

- 新しい json として出力

```shell
$ cat sample.json | jq  '.items[] | {id: .id, owner: .owner}'
{
  "id": 111,
  "owner": {
    "id": 1111111,
    "type": "Organization"
  }
}
{
  "id": 222,
  "owner": {
    "id": 2222222,
    "type": "User"
  }
}
{
  "id": 333,
  "owner": {
    "id": 3333333,
    "type": "Organization"
  }
}
```

- 配列化、ワンライナー

```shell
$ cat sample.json | jq  -c '[.items[] | {id: .id, owner: .owner}]'
[{"id":111,"owner":{"id":1111111,"type":"Organization"}},{"id":222,"owner":{"id":2222222,"type":"User"}},{"id":333,"owner":{"id":3333333,"type":"Organization"}}]
```
