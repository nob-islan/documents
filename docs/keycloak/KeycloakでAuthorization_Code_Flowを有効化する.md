# KeycloakでAuthorization Code Flowを有効化する

## Keycloak

cf.

- https://www.keycloak.org/docs/latest/server_admin/index.html#assembly-managing-clients_server_administration_guide
- https://docs.spring.io/spring-security/reference/servlet/oauth2/login/core.html

### 設定

- Realmを作成します（例: easyapp）。
- Clientを作成します:
  - Client authenticationをONにします。
  - Authentication flowはStandard flowとします。
  - Valid Redirect URIsを`http://localhost:8081/login/oauth2/code/*`とします。
  - Valid post logout redirect URIsを`http://localhost:8081`とします。
  - Web originsを`http://localhost:8081`とします。
  - 保存後、CredentinalsタブにおいてClient Secretが取得できます。
- Userを作成し、パスワードの設定を行います:
  - ユーザ作成後、http://localhost:8080/realms/easyapp/account でユーザ管理ができます。

## 業務アプリ（Spring Boot）

cf.

- https://docs.spring.io/spring-security/reference/servlet/oauth2#oauth2-client-log-users-in
- https://docs.spring.io/spring-security/reference/servlet/oauth2/login/logout.html

### 実装

#### `application.properties`

```shell
server.port=8081

spring.security.oauth2.client.registration.keycloak.client-id=easyapp
spring.security.oauth2.client.registration.keycloak.client-secret=TODO_ADD_CLIENT_SECRET
spring.security.oauth2.client.registration.keycloak.scope=openid
spring.security.oauth2.client.registration.keycloak.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.keycloak.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.provider.keycloak.issuer-uri=http://localhost:8080/realms/easyapp
```

#### `pom.xml`

```xml
        <!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-thymeleaf -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
            <version>4.0.2</version>
            <scope>compile</scope>
        </dependency>
        <!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-oauth2-client -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-client</artifactId>
            <version>4.0.2</version>
            <scope>compile</scope>
        </dependency>
```

#### `config/SecurityConfig.java`

```java
package nob.example.easyapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;

/**
 * 認証向けのコンフィグクラスです。
 *
 * @author nob
 */
@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    @NonNull
    private ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().permitAll())
                .oauth2Login(oauth2 -> oauth2 // Authorization Code Flow / OAuth2 Login を有効化
                        .defaultSuccessUrl("/me", true)) // 認証完了後のリダイレクト先を指定
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))) // リダイレクト後のCORSエラーを防ぐため401を返す
                .logout((logout) -> logout
                        .logoutRequestMatcher(
                                new RegexRequestMatcher("/api/v1/revoke", "GET")) // logout APIを有効化
                        .logoutSuccessHandler(oidcLogoutSuccessHandler()));
        return http.build();
    }

    private LogoutSuccessHandler oidcLogoutSuccessHandler() {
        OidcClientInitiatedLogoutSuccessHandler oidcLogoutSuccessHandler = new OidcClientInitiatedLogoutSuccessHandler(
                this.clientRegistrationRepository);

        // Sets the location that the End-User's User Agent will be redirected to
        // after the logout has been performed at the Provider
        oidcLogoutSuccessHandler.setPostLogoutRedirectUri("{baseUrl}");

        return oidcLogoutSuccessHandler;
    }
}
```

#### `controller/UserController.java`

```java
package nob.example.easyapp.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nob.example.easyapp.controller.model.MeResponse;

/**
 * ユーザ情報APIのインターフェースです。
 *
 * @author nob
 */
@RestController
@RequestMapping(value = "/api/v1")
public class UserController {

    /**
     * ユーザ情報取得APIです。
     *
     * @return ユーザ情報
     */
    @GetMapping("/me")
    MeResponse me(@AuthenticationPrincipal OAuth2User user) {
        return new MeResponse(user.getAttribute("preferred_username"), 13);
    }
}
```

#### `controller/model/MeResponse.java`

```java
package nob.example.easyapp.controller.model;

/**
 * ユーザ情報確認APIのレスポンスモデルです。
 *
 * @param name ユーザ名
 * @param age  年齢
 *
 * @author nob
 */
public record MeResponse(String name, Integer age) {
}
```

#### `web/MePage.java`

```java
package nob.example.easyapp.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * ユーザ情報のページです。
 *
 * @author nob
 */
@Controller
public class MePage {

    /**
     * 初期画面を表示します。
     *
     * @return 初期画面コンテンツ
     */
    @GetMapping(value = "/")
    String top() {
        return "top";
    }

    /**
     * ユーザ情報確認画面を表示します。
     *
     * @return ユーザ情報確認コンテンツ
     */
    @GetMapping(value = "/me")
    String me() {
        return "me";
    }
}
```

#### `templates/top.html`

```html
<!doctype html>
<html xmlns:th="http://www.thymeleaf.org">
  <head>
    <title>easyapp</title>
  </head>
  <body>
    <button onclick="handleOnclickMeButton()">ユーザ情報を確認する</button>
  </body>

  <script src="top.js"></script>
</html>
```

#### `static/top.js`

```js
/**
 * ユーザ情報参照ボタン押下時の動作を定義します。
 *
 */
const handleOnclickMeButton = () => {
  window.location.href = "/me";
};
```

#### `templates/me.html`

```html
<!doctype html>
<html xmlns:th="http://www.thymeleaf.org">
  <head>
    <title>easyapp</title>
  </head>
  <body>
    <div id="me">
      <div id="name"><!-- ユーザ名 --></div>
      <div id="age"><!-- 年齢 --></div>
    </div>
    <button onclick="handleOnclickLogoutButton()">ログアウト</button>
  </body>

  <script src="me.js"></script>
</html>
```

#### `static/me.js`

```js
// 画面初期表示時にユーザ情報取得APIをコールして画面表示
fetch("/api/v1/me", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((res) => {
    if (res.status === 401) {
      window.location.href = "/oauth2/authorization/keycloak";
      return;
    }
    return res.json();
  })
  .then((data) => {
    const name = document.getElementById("name");
    name.textContent = data.name;
    const age = document.getElementById("age");
    age.textContent = data.age;
  })
  .catch((error) => {
    console.log(error);
  });

/**
 * ログアウトボタン押下時の挙動を定義します。
 */
const handleOnclickLogoutButton = () => {
  window.location.href = "/api/v1/revoke";
  // ログアウト処理後の画面遷移はSpring Securityに任せる
};
```

## API打鍵

- ブラウザ上で http://localhost:8081 にアクセスしてボタンを押下すると（未認証であれば）Keycloakの画面にリダイレクトし、認証後に業務アプリのコンテンツを取得できます。
- ログアウトボタンを押下するとセッションが破棄され、トップ画面に遷移します。
