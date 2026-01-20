# 他プロジェクトのパッケージをimport

GitHubや自前のGitLabなどで管理しているプロジェクトのパッケージをimportする方法を記載します。

## 前提

`nob-gitlab.local/nob/easygo`モジュールに、下記パッケージとその配下の関数が定義されているとします:

```go
package inspect

import "fmt"

// 名前を入力すると自己紹介します。
func Echo(name string) {

	r := fmt.Sprintf("I am %s", name)
	fmt.Println(r)
}
```

## 手順

- 必要に応じて下記環境変数を設定します:

```shell
# HTTP経由での通信を許可
export GOINSECURE=nob-gitlab.local

# プライベートモジュールとして認識
export GOPRIVATE=nob-gitlab.local
```

- モジュールを取得します:

```shell
go get nob-gitlab.local/nob/easygo
```

- 取得後、下記のようにパッケージ配下の関数などを利用できます:

```go
package main

import "nob-gitlab.local/nob/easygo/pkg/inspect"

func main() {

	// easygoモジュールのinspectパッケージを利用
	inspect.Echo("nob")
}
```
