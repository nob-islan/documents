# Keycloak + Spring Securityで認証必須のAPIを実装する

[Spring Security](https://spring.io/projects/spring-security)を使って、アクセストークンを持っている場合のみ実行可能なAPIを実装します。認証基盤としてKeycloakを利用します。

## Keycloak

cf. https://www.keycloak.org/docs/25.0.6/securing_apps/index.html

### 設定

- Realmを作成します（例: easyapp）。
- Clientを作成します:
  - Valid Redirect URIsを `http://localhost:8081/*` のように指定します。
  - Client authenticationをONにします。
  - Direct access grantsにチェックを入れます:
    - Direct access grantsは本番では非推奨なので注意してください。
  - 保存後、CredentinalsタブにおいてClient Secretが取得できます。
- Roleを作成します。
- Userを作成し、パスワードの設定を行います:
  - ユーザ作成後、http://localhost:8080/realms/easyapp/account にログインしてパスワードの更新をしてください。

### 使用方法

下記コマンドでアクセストークンが取得できます:

```shell
curl -X POST http://localhost:8080/realms/easyapp/protocol/openid-connect/token \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=password" \
    -d "client_id=easyapp" \
    -d "username=nob" \
    -d "password=password" \
    -d "client_secret={Client Secret}"
```

## 業務アプリ（Spring Boot）

cf.

- https://docs.spring.io/spring-security/reference/servlet/oauth2/
- https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html

### 実装

- `pom.xml`に下記を追加します:

```xml
		<!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-security -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security</artifactId>
			<version>4.0.2</version>
			<scope>compile</scope>
		</dependency>
		<!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-oauth2-resource-server -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
			<version>4.0.2</version>
			<scope>compile</scope>
		</dependency>
```

- `SecurityConfig`を下記で作成します:

```java
package nob.example.easyapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/api/v1/public/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer((oauth2) -> oauth2.jwt(Customizer.withDefaults()));
        return http.build();
    }
}
```

- サンプルAPIを下記で作成します:

```java
package nob.example.easyapp.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * サンプルのAPIです。
 *
 * @author nob
 */
@RestController
@RequestMapping(value = "/api/v1")
public class SampleController {

    /**
     * 認証不要のAPIです。
     *
     * @return 挨拶メッセージ
     */
    @GetMapping(value = "/public/hello")
    String hello() {
        return "Hello, John doe!";
    }

    /**
     * 認証が必要なAPIです。
     *
     * @return 挨拶メッセージ
     */
    @GetMapping(value = "/resource/me")
    String me(@AuthenticationPrincipal Jwt jwt) {
        return "I am " + jwt.getClaimAsString("preferred_username");
    }
}
```

- `application.properties`に下記を追記します:

```shell
server.port=8081

spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/easyapp
```

## API打鍵

- `/api/v1/public`配下は認証不要です:

```
$ curl -X GET localhost:8081/api/v1/public/hello
Hello, John doe!
```

- それ以外はトークンをヘッダに付与してAPIを呼び出せます。

```
$ curl -X GET http://localhost:8081/api/v1/resource/me \
    -H "Authorization: Bearer {token}"
I am nob
```

```
$ curl -v -X GET http://localhost:8081/api/v1/resource/me
Note: Unnecessary use of -X or --request, GET is already inferred.
*   Trying 127.0.0.1:8081...
* Connected to localhost (127.0.0.1) port 8081 (#0)
> GET /api/v1/resource/me HTTP/1.1
> Host: localhost:8081
> User-Agent: curl/7.88.1
> Accept: */*
>
< HTTP/1.1 401
< Set-Cookie: JSESSIONID=1DCA5312A61B79EB1829011A6BCCFC5D; Path=/; HttpOnly
< WWW-Authenticate: Bearer resource_metadata="http://localhost:8081/.well-known/oauth-protected-resource"
< X-Content-Type-Options: nosniff
< X-XSS-Protection: 0
< Cache-Control: no-cache, no-store, max-age=0, must-revalidate
< Pragma: no-cache
< Expires: 0
< X-Frame-Options: DENY
< Content-Length: 0
< Date: Wed, 11 Feb 2026 07:18:31 GMT
<
* Connection #0 to host localhost left intact
```
