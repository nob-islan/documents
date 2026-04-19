# Web画面を実装

[Thymeleaf](https://www.thymeleaf.org/doc/tutorials/3.0/usingthymeleaf.html)を使ってhtmlコンテンツを返却するJavaアプリを作成します。

## 事前準備

- プロジェクトを初期化します:

```shell
curl https://start.spring.io/starter.zip \
  -d javaVersion=25 \
  -d dependencies=web,lombok,thymeleaf \
  -d type=maven-project \
  -d language=java \
  -d name=easyweb \
  -d groupId=nob.example \
  -d artifactId=easyweb \
  -o easyweb.zip
```

- zipを解凍します:

```shell
unzip easyweb.zip && rm -rf easyweb.zip
```

## ディレクトリ構成

```shell
src
└── main
    ├── java/nob/example/easyweb
    │   ├── controller
    │   │   ├── AuthController.java
    │   │   ├── impl
    │   │   │   └── AuthControllerImpl.java
    │   │   └── model
    │   │       ├── LoginRequest.java
    │   │       └── LoginResponse.java
    │   └── web
    │       └── LoginPage.java
    └── resources
        ├── static
        │   ├── login.css
        │   └── login.js
        └── templates
            └── login.html
```

## サンプルコード

擬似的なログイン画面を実装します。

### 設計

- ログイン画面表示時に、ボタン名をjavaからhtmlに渡す
- ボタン入力時にjsからREST APIを呼び出す
- 結果をalert表示

### 実装

#### `templates/login.html`

```html
<!doctype html>
<html xmlns:th="http://www.thymeleaf.org">
  <head>
    <meta charset="UTF-8" />
    <link rel="stylesheet" href="login.css" type="text/css" />
    <link rel="icon" href="favicon.ico" />
    <title>First Java web</title>
  </head>

  <body>
    <div class="name-wrapper">
      <input
        class="name-textbox"
        type="text"
        placeholder="ユーザ名"
        id="name"
      />
    </div>
    <div class="password-wrapper">
      <input
        class="password-textbox"
        type="password"
        placeholder="パスワード"
        id="password"
      />
    </div>
    <div class="submit-button-wrapper">
      <button
        class="submit-button"
        onclick="handleOnclickButton()"
        th:text="${buttonText}"
      ></button>
    </div>

    <script src="login.js"></script>
  </body>
</html>
```

#### `static/login.js`

```js
function handleOnclickButton() {
  const name = document.getElementById("name").value;
  const password = document.getElementById("password").value;
  fetch("/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: name,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
    })
    .catch((error) => {
      console.log(error);
    });
}
```

#### `static/login.css`

```css
body {
  padding: 30px 60px 30px 60px;
  color: #d6d6d6;
  background-color: #000333;
  text-align: center;
}

.name-wrapper {
  padding: 30px 30px 5px 30px;
}

.name-textbox {
  width: 250px;
  height: 35px;
}

.password-wrapper {
  padding: 30px 30px 2px 30px;
}

.password-textbox {
  width: 250px;
  height: 35px;
}

.submit-button-wrapper {
  padding: 30px 30px 2px 30px;
}

.submit-button {
  width: 260px;
  height: 35px;
  background-color: orange;
}

.submit-button:hover {
  cursor: pointer;
}
```

#### `web/LoginPage.java`

```java
package nob.example.easyweb.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * ログインページを提供します。
 *
 * @author nob
 */
@Controller
public class LoginPage {

    /**
     * ログイン画面を返します。
     *
     * @return ログイン画面コンテンツ
     */
    @GetMapping(value = "/login")
    String login(Model model) {
        model.addAttribute("buttonText", "ログイン");
        return "login";
    }
}
```

#### `controller/AuthController.java`

```java
package nob.example.easyweb.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

import nob.example.easyweb.controller.model.LoginRequest;
import nob.example.easyweb.controller.model.LoginResponse;

/**
 * 認証機能のインターフェースです。
 *
 * @author nob
 */
@RequestMapping(value = "/api/v1")
public interface AuthController {

    /**
     * ログイン処理を呼び出します。
     *
     * @param request ログインリクエスト
     * @return ログインレスポンス
     */
    @PostMapping(value = "/login")
    LoginResponse login(@RequestBody LoginRequest request);
}
```

#### `controller/impl/AuthControllerImpl.java`

```java
package nob.example.easyweb.controller.impl;

import org.springframework.web.bind.annotation.RestController;

import nob.example.easyweb.controller.AuthController;
import nob.example.easyweb.controller.model.LoginRequest;
import nob.example.easyweb.controller.model.LoginResponse;

/**
 * AuthControllerの実装クラスです。
 *
 * @author nob
 */
@RestController
public class AuthControllerImpl implements AuthController {

    @Override
    public LoginResponse login(LoginRequest request) {

        if (request.name().isBlank() || request.password().isBlank()) {
            return new LoginResponse("Input your credentials");
        }
        return new LoginResponse("Hello, " + request.name() + "!");
    }
}
```

#### `controller/model/LoginRequest.java`

```java
package nob.example.easyweb.controller.model;

/**
 * ログインAPIのリクエストモデルです。
 *
 * @param name     ユーザ名
 * @param password パスワード
 *
 * @author nob
 */
public record LoginRequest(String name, String password) {
}
```

#### `controller/model/LoginResponse.java`

```java
package nob.example.easyweb.controller.model;

/**
 * ログインAPIのレスポンスモデルです。
 *
 * @param message メッセージ
 *
 * @author nob
 */
public record LoginResponse(String message) {
}
```

アプリ起動後、http://localhost:8080/login にアクセスするとログイン画面が表示されます。
