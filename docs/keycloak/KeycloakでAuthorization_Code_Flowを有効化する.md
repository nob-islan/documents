# KeycloakでAuthorization Code Flowを有効化する

## Keycloak

cf. https://www.keycloak.org/docs/latest/server_admin/index.html#assembly-managing-clients_server_administration_guide

### 設定

- Realmを作成します（例: easyapp）。
- Clientを作成します:
  - Client authenticationをONにします。
  - Authentication flowはStandard flowとします。
  - Valid Redirect URIsを`http://localhost:8081/login/oauth2/code/*`とします。
  - Valid post logout redirect URIsを`http://localhost:8081/api/v1/top`とします。
  - Web originsを`http://localhost:8081`とします。
  - 保存後、CredentinalsタブにおいてClient Secretが取得できます。
- Userを作成し、パスワードの設定を行います:
  - ユーザ作成後、http://localhost:8080/realms/easyapp/account でユーザ管理ができます。

## 業務アプリ（Spring Boot）

cf.

- https://docs.spring.io/spring-security/reference/servlet/oauth2#oauth2-client-log-users-in
- https://docs.spring.io/spring-security/reference/servlet/oauth2/login/logout.html

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
        <!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-oauth2-client -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-client</artifactId>
            <version>4.0.2</version>
            <scope>compile</scope>
        </dependency>
```

- `SecurityConfig.java`を下記で作成します:

```java
package nob.example.easyapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .authorizeHttpRequests((authorize) -> authorize
                        .requestMatchers("/api/v1/top").permitAll()
                        .anyRequest().authenticated())
                .oauth2Login(Customizer.withDefaults()) // Authorization Code Flow / OAuth2 Login を有効化
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
        oidcLogoutSuccessHandler.setPostLogoutRedirectUri("{baseUrl}/api/v1/top");

        return oidcLogoutSuccessHandler;
    }
}
```

- サンプルAPIを下記で作成します:

```java
package nob.example.easyapp.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
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
     * 認証が必要なAPIです。
     *
     * @return 挨拶メッセージ
     */
    @GetMapping("/me")
    String me(@AuthenticationPrincipal OAuth2User user) {
        return "Hello " + user.getAttribute("preferred_username");
    }

    /**
     * ログアウト時にリダイレクトされるAPIです。
     *
     * @return ログアウトメッセージ
     */
    @GetMapping("/top")
    String top() {
        return "Logout success";
    }
}
```

- `application.properties`に下記を追記します:

```shell
server.port=8081

spring.security.oauth2.client.registration.keycloak.client-id=easyapp
spring.security.oauth2.client.registration.keycloak.client-secret=TODO_ADD_CLIENT_SECRET
spring.security.oauth2.client.registration.keycloak.scope=openid
spring.security.oauth2.client.registration.keycloak.authorization-grant-type=authorization_code
spring.security.oauth2.client.registration.keycloak.redirect-uri={baseUrl}/login/oauth2/code/{registrationId}
spring.security.oauth2.client.provider.keycloak.issuer-uri=http://localhost:8080/realms/easyapp
```

## API打鍵

- ブラウザ上で http://localhost:8081/api/v1/me にアクセスすると（未認証であれば）Keycloakの画面にリダイレクトし、認証後に業務アプリのコンテンツを取得できます。
- http://localhost:8081/api/v1/revoke にアクセスするとログアウト処理が走り、`/api/v1/top`に遷移します。
