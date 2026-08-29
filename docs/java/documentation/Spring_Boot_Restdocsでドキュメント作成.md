# Spring Boot Restdocsでドキュメント作成

Restdocsおよびasciidocsを使って、単体テストの結果からAPI設計書を自動作成します。

cf. https://spring.pleiades.io/guides/gs/testing-restdocs

## 各種ファイルサンプル

サンプルとして、簡単なGETメソッドおよびPOSTメソッドのAPI設計書を作成します。

### 依存関係の追加

`pom.xml`に下記を追加します:

```xml
		<!-- Source: https://mvnrepository.com/artifact/org.springframework.restdocs/spring-restdocs-mockmvc -->
		<dependency>
			<groupId>org.springframework.restdocs</groupId>
			<artifactId>spring-restdocs-mockmvc</artifactId>
			<scope>test</scope>
		</dependency>
		<!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-restdocs -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-restdocs</artifactId>
			<scope>compile</scope>
		</dependency>
```

```xml
			<plugin>
				<groupId>org.asciidoctor</groupId>
				<artifactId>asciidoctor-maven-plugin</artifactId>
				<version>1.5.8</version>
				<executions>
					<execution>
						<id>generate-docs</id>
						<phase>prepare-package</phase>
						<goals>
							<goal>process-asciidoc</goal>
						</goals>
						<configuration>
							<backend>html</backend>
							<doctype>book</doctype>
						</configuration>
					</execution>
				</executions>
				<dependencies>
					<dependency>
						<groupId>org.springframework.restdocs</groupId>
						<artifactId>spring-restdocs-asciidoctor</artifactId>
						<version>${spring-restdocs.version}</version>
					</dependency>
				</dependencies>
			</plugin>
```

### API実装

- コントローラ

```java
package nob.example.easyapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import nob.example.easyapp.controller.model.LoginRequest;
import nob.example.easyapp.controller.model.LoginResponse;
import nob.example.easyapp.controller.model.GetUserRequest;
import nob.example.easyapp.controller.model.GetUserResponse;
import nob.example.easyapp.service.AuthService;
import nob.example.easyapp.service.model.LoginInModel;
import nob.example.easyapp.service.model.GetUserInModel;
import nob.example.easyapp.service.model.GetUserOutModel;

/**
 * 認証コントローラーです。
 *
 * @author nob
 */
@RestController
@RequestMapping(value = "/api/v1")
@RequiredArgsConstructor
public class AuthController {

    @NonNull
    private final AuthService authService;

    /**
     * 認証処理を呼び出します。
     *
     * @param request 認証リクエスト
     * @return 認証結果
     */
    @PostMapping(value = "/login")
    LoginResponse login(@RequestBody LoginRequest request) {

        return new LoginResponse(authService.login(new LoginInModel(request.name(), request.password())).valid());
    }

    /**
     * ユーザ情報取得処理を呼び出します。
     *
     * @param request ユーザ情報取得リクエスト
     * @return ユーザ情報
     */
    @GetMapping(value = "/users")
    GetUserResponse getUser(GetUserRequest request) {

        GetUserOutModel getUserOutModel = authService.getUser(new GetUserInModel(request.name()));
        return new GetUserResponse(getUserOutModel.name(), getUserOutModel.age());
    }
}
```

- コントローラテスト

```java
package nob.example.easyapp.controller;

import static org.junit.jupiter.api.Assertions.fail;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessRequest;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessResponse;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.queryParameters;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.restdocs.test.autoconfigure.AutoConfigureRestDocs;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import nob.example.easyapp.controller.model.GetUserRequest;
import nob.example.easyapp.controller.model.LoginRequest;
import nob.example.easyapp.service.AuthService;
import nob.example.easyapp.service.model.GetUserInModel;
import nob.example.easyapp.service.model.GetUserOutModel;
import nob.example.easyapp.service.model.LoginInModel;
import nob.example.easyapp.service.model.LoginOutModel;
import tools.jackson.databind.ObjectMapper;

/**
 * AuthControllerのテストクラスです。
 *
 * @author nob
 */
@WebMvcTest(AuthController.class)
@AutoConfigureRestDocs(outputDir = "target/snippets")
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private AuthService authService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * loginのテスト 正常系
     */
    @Test
    void testLoginSuccess() {

        // リクエストの作成
        LoginRequest request = new LoginRequest("nob", "passwd");

        // serviceのモック化
        Mockito.when(authService.login(new LoginInModel(request.name(), request.password())))
                .thenReturn(new LoginOutModel(true));

        try {
            mockMvc.perform(post("/api/v1/login")
                    .content(objectMapper.writeValueAsString(request))
                    .contentType(MediaType.APPLICATION_JSON))
                    .andDo(document(
                            "asciidoc/api/v1/login",
                            preprocessRequest(prettyPrint()),
                            preprocessResponse(prettyPrint()),
                            requestFields(
                                    fieldWithPath("name").description("ユーザ名"),
                                    fieldWithPath("password").description("パスワード")),
                            responseFields(
                                    fieldWithPath("valid").description("認証可否"))));
        } catch (Exception e) {
            e.printStackTrace();
            fail();
        }
    }

    /**
     * getUserのテスト 正常系
     */
    @Test
    void testGetUserSuccess() {

        // リクエストの作成
        GetUserRequest request = new GetUserRequest("nob");

        // serviceのモック化
        Mockito.when(authService.getUser(new GetUserInModel(request.name())))
                .thenReturn(new GetUserOutModel("nob", 13));

        try {
            mockMvc.perform(get("/api/v1/users")
                    .queryParam("name", "nob")
                    .contentType(MediaType.APPLICATION_JSON))
                    .andDo(document("asciidoc/api/v1/users",
                            preprocessRequest(prettyPrint()),
                            preprocessResponse(prettyPrint()),
                            queryParameters(
                                    parameterWithName("name").description("ユーザ名")),
                            responseFields(
                                    fieldWithPath("name").description("ユーザ名"),
                                    fieldWithPath("age").description("年齢"))));
        } catch (Exception e) {
            e.printStackTrace();
            fail();
        }
    }
}
```

### asciidoc

`src/main/asciidoc`配下に下記`index.adoc`を追加します:

```adoc
:toc: left
:source-highlighter: highlightjs

= サンプルAPI仕様書

サンプルAPI群の仕様書です。

:base_path: ../../../target/snippets/asciidoc

== Auth

認証APIです。

:auth: {base_path}/api/v1

=== Login

認証処理を行います。

:login: {auth}/login

.request field
include::{login}/request-fields.adoc[]

.response field
include::{login}/response-fields.adoc[]

.example request
include::{login}/curl-request.adoc[]

.example response
include::{login}/response-body.adoc[]

=== Get User

ユーザ情報を取得します。

:users: {auth}/users

.query parameter
include::{users}/query-parameters.adoc[]

.response field
include::{users}/response-fields.adoc[]

.example request
include::{users}/curl-request.adoc[]

.example response
include::{users}/response-body.adoc[]
```

`:xxx:`で適宜変数を定め、`include::`で生成したスニペットを読み込んでいます。

## 設計書生成手順

- 単体テストを実行します。テストに成功すると、`target/snippets`配下に、`document`内で定めたパスに各種スニペットが出力されます。

```shell
./mvnw test
```

- パッケージをビルドします。`target/generated-docs`配下に設計書本体`index.html`が出力されます。

```shell
./mvnw package
```
