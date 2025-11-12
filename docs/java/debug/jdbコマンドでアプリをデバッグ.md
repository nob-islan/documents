# jdb コマンドでアプリをデバッグ

cf. https://docs.oracle.com/javase/jp/6/technotes/tools/windows/jdb.html

## 事前準備

簡単なアプリを作成してコンテナで動かします。

### アプリ実装

デバッグに直接関係のあるクラスのみ記載します。

#### SampleServiceImpl.java

```java
package nob.example.easyapp.service.impl;

import org.springframework.stereotype.Service;

import nob.example.easyapp.service.SampleService;
import nob.example.easyapp.service.model.SampleInModel;

/**
 * SampleServiceの実装クラスです。
 *
 * @author nob
 */
@Service
public class SampleServiceImpl implements SampleService {

    @Override
    public String greeting(SampleInModel sampleInModel) {

        String name = sampleInModel.getName();
        if (name == "") {
            name = complementName();
        }
        String message = "Hello, " + name + "!";

        return message;
    }

    /**
     * 名前が未入力の場合に補完します。
     *
     * @return
     */
    private String complementName() {

        String retName = "John doe";

        return retName;
    }
}
```

### docker-compose

- ローカルでビルドした jar ファイルをコンテナから見えるようにしています。
- ports および entrypoint でデバッグポートを空け、デバッグモードに入れるようにしています。

```java
services:
  easyapp:
    container_name: easyapp
    image: eclipse-temurin:17
    ports:
      - 8080:8080
      - 8484:8484
    volumes:
      - ./easyapp/target/easyapp-0.0.1-SNAPSHOT.jar:/easyapp-0.0.1-SNAPSHOT.jar
    entrypoint: ["sh", "-c", "java -Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=*:8484 -jar /easyapp-0.0.1-SNAPSHOT.jar"]
```

## jdb コマンド使い方

### 開始

デバッグポートを指定して対話モードに入ります:

```shell
jdb -attach 8484
```

### ブレークポイント設定

- `stop in {method.name}` でメソッド冒頭にブレークポイントを置きます:

```
> stop in nob.example.easyapp.service.impl.SampleServiceImpl.greet
Set breakpoint nob.example.easyapp.service.impl.SampleServiceImpl.greet
```

- `stop at {class.name}:{line}` で特定の行にブレークポイントを置きます:

```
> stop at nob.example.easyapp.service.impl.SampleServiceImpl:23
Set breakpoint nob.example.easyapp.service.impl.SampleServiceImpl:23
```

### ブレークポイント確認・除去

- `clear` でブレークポイント一覧を確認できます:

```
> clear
Breakpoints set:
        breakpoint nob.example.easyapp.service.impl.SampleServiceImpl.greet
        breakpoint nob.example.easyapp.service.impl.SampleServiceImpl:23
```

- `clear {breakpoint}` でブレークポイントを除去できます:

```
> clear nob.example.easyapp.service.impl.SampleServiceImpl.greet
Removed: breakpoint nob.example.easyapp.service.impl.SampleServiceImpl.greet
```

### ブレーク時の操作

- `locals` で変数一覧を確認できます:

```
Breakpoint hit: "thread=http-nio-8080-exec-3", nob.example.easyapp.service.impl.SampleServiceImpl.greeting(), line=23 bci=16

http-nio-8080-exec-3[1] locals
Method arguments:
sampleInModel = instance of nob.example.easyapp.service.model.SampleInModel(id=6426)
Local variables:
name = "nob"
```

- `print` および `dump` で変数の中身を確認できます。前者はプリミティブ型向け、後者はオブジェクト向けです:

```
http-nio-8080-exec-3[1] print sampleInModel
 sampleInModel = "SampleInModel(name=nob)"
```

```
http-nio-8080-exec-3[1] dump sampleInModel
 sampleInModel = {
    name: "nob"
}
```

- `set` で変数を書き換えることができます。ただし、`final` フィールドについては変更不可能です:

```
http-nio-8080-exec-7[1] locals
Method arguments:
sampleInModel = instance of nob.example.easyapp.service.model.SampleInModel(id=6429)
Local variables:
name = "nob"

http-nio-8080-exec-7[1] set name = "snail"
 name = "snail" = "snail"

http-nio-8080-exec-7[1] locals
Method arguments:
sampleInModel = instance of nob.example.easyapp.service.model.SampleInModel(id=6429)
Local variables:
name = "snail"
```

- `next` および `step` で処理を進めます。下記 (1) にブレークポイントを置いた場合、前者は (2), 後者は (3) に進みます:

```java
    @Override
    public String greeting(SampleInModel sampleInModel) {

        String name = sampleInModel.getName();
        if (name == "") {
            name = complementName();             // (1)
        }
        String message = "Hello, " + name + "!"; // (2)

        return message;
    }

    /**
     * 名前が未入力の場合に補完します。
     *
     * @return
     */
    private String complementName() {

        String retName = "John doe";             // (3)

        return retName;
    }
```

- `cont` で次のブレークポイントまで処理を進めます:

```
http-nio-8080-exec-2[1] cont
>
```

### クラス・メソッド一覧確認

- `classes` で jar に含まれているクラス一覧を確認できます:

```
# echo "classes" | jdb -attach 8484 | grep nob
nob.example.easyapp.service.model.SampleInModel
nob.example.easyapp.service.impl.SampleServiceImpl
nob.example.easyapp.service.SampleService
nob.example.easyapp.controller.impl.SampleControllerImpl
nob.example.easyapp.controller.SampleController
nob.example.easyapp.EasyappApplication
```

- `methods {class.name}}` でクラス内のメソッド一覧を確認できます。

```
> methods nob.example.easyapp.service.impl.SampleServiceImpl
** methods list **
nob.example.easyapp.service.impl.SampleServiceImpl <init>()
nob.example.easyapp.service.impl.SampleServiceImpl greeting(nob.example.easyapp.service.model.SampleInModel)
nob.example.easyapp.service.impl.SampleServiceImpl complementName()
java.lang.Object <init>()
java.lang.Object getClass()
java.lang.Object hashCode()
java.lang.Object equals(java.lang.Object)
java.lang.Object clone()
java.lang.Object toString()
java.lang.Object notify()
java.lang.Object notifyAll()
java.lang.Object wait()
java.lang.Object wait(long)
java.lang.Object wait(long, int)
java.lang.Object finalize()
nob.example.easyapp.service.SampleService greeting(nob.example.easyapp.service.model.SampleInModel)
```
