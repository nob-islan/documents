# Spring Bootでマルチモジュールアプリを作成

複数のプロジェクトを含んだSpring Bootアプリを作成します。

cf. https://spring.io/guides/gs/multi-module

## プロジェクト構成

```shell
easyproject
├── easyapp
│   └── （API側実装）
├── easyweb
│   └── （web側実装）
├── mvnw
├── mvnw.cmd
└── pom.xml
```

## 実装

### easyapp

web側から呼ばれるAPIを実装します。

#### `pom.xml`

`<build>`内をコメントアウトします。

#### `controller/UserController.java`

```java
package nob.example.easyapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ユーザ情報向けコントローラークラスです。
 *
 * @author nob
 */
@RestController
@RequestMapping(value = "/api/v1")
public class UserController {

    /**
     * 挨拶メッセージを返します。
     *
     * @return 固定メッセージ
     */
    @GetMapping(value = "/message")
    public String message() {
        return "Hello, nob!";
    }
}
```

### easyweb

easyappを呼び出し、その結果を表示する画面を提供します。

#### `pom.xml`

easyappを依存関係に追加します:

```xml
		<dependency>
			<groupId>nob.example</groupId>
			<artifactId>easyapp</artifactId>
			<version>0.0.1-SNAPSHOT</version>
		</dependency>
```

#### `EasywebApplication.java`

スキャンするパッケージを指定し、easyappを認識できるようにします:

```java
package nob.example.easyweb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = { "nob.example" }) // スキャンするパッケージを明示的に指定
public class EasywebApplication {

    public static void main(String[] args) {
        SpringApplication.run(EasywebApplication.class, args);
    }
}
```

#### `web/UserPage.java`

```java
package nob.example.easyweb.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import lombok.NonNull;
import nob.example.easyapp.controller.UserController;

/**
 * ユーザ向けページクラスです。
 *
 * @author nob
 */
@Controller
public class UserPage {

    @NonNull
    private UserController userController;

    public UserPage(UserController userController) {
        this.userController = userController;
    }

    /**
     * ユーザ向けメッセージを表示するページを返します。
     *
     * @return ユーザ向けメッセージ表示コンテンツ
     */
    @GetMapping(value = "/message")
    String message(Model model) {

        model.addAttribute("message", userController.message());
        return "message";
    }
}
```

### easyproject

app, webを統括します。mvn関連のファイルを下記コマンドでプロジェクトのルートディレクトリ直下にコピーしてください:

```shell
cp mvnw* .mvn ..
```

#### `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>nob.example</groupId>
    <artifactId>easyproject</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <packaging>pom</packaging>

    <modules>
        <module>easyweb</module>
        <module>easyapp</module>
    </modules>
</project>
```

## 起動

プロジェクトのルートディレクトリで下記を実行することでアプリが起動します:

```shell
# appを参照するeasywebを起動
./mvnw install && ./mvnw spring-boot:run -pl easyweb
```
