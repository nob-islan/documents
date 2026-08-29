# springdocでAPIドキュメント作成

API設計書の作成方法について説明します。springdoc-openapiによってswaggerを自動生成するようにしています。

cf. https://springdoc.org/

## 実装

### `pom.xml`

下記の依存関係を追加します:

```xml
		<!-- https://mvnrepository.com/artifact/org.springdoc/springdoc-openapi-starter-webmvc-ui -->
		<dependency>
			<groupId>org.springdoc</groupId>
			<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
			<version>2.8.13</version>
		</dependency>
```

### `application.properties`

下記設定を追記します:

```shell
# swagger出力用ymlファイルのエンドポイント
springdoc.api-docs.path=/api-docs
# swaggerドキュメント閲覧用エンドポイント
springdoc.swagger-ui.path=/swagger-ui.html
# application-swagger.ymlを読み込ませる
spring.profiles.active=swagger
```

### `EasyappApplication.java`

APIの概要を記載します:

```java
package nob.example.easyapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "Easy App", version = "1.0.0", description = "サンプルのREST APIです。"))
public class EasyappApplication {

    public static void main(String[] args) {
        SpringApplication.run(EasyappApplication.class, args);
    }
}
```

### `AuthController.java`

各APIのインターフェース仕様を記載します:

```java
package nob.example.easyapp.controller;

import org.springdoc.core.annotations.ParameterObject;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import nob.example.easyapp.controller.model.LoginRequest;
import nob.example.easyapp.controller.model.LoginResponse;
import nob.example.easyapp.controller.model.GetUserRequest;
import nob.example.easyapp.controller.model.GetUserResponse;
import nob.example.easyapp.handler.SampleExceptionHandler.SampleExceptionResponse;
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
@Tag(name = "Auth", description = "認証APIです。")
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
    @Operation(summary = "認証", description = "${easyappdoc.describe.api.v1.login:説明文}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "正常に処理された場合"),
            @ApiResponse(responseCode = "422", description = "エラーが発生した場合", content = @Content(schema = @Schema(implementation = SampleExceptionResponse.class)))
    })
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
    @Operation(summary = "ユーザ情報取得", description = "${easyappdoc.describe.api.v1.user:説明文}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "正常に処理された場合")
    })
    GetUserResponse getUser(@ParameterObject GetUserRequest request) {

        GetUserOutModel getUserOutModel = authService.user(new GetUserInModel(request.name()));
        return new GetUserResponse(getUserOutModel.name(), getUserOutModel.age());
    }
}
```

### `model`

各モデルクラスのスキーマ定義を記載します:

#### `LoginRequest.java`

```java
package nob.example.easyapp.controller.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 認証向けのリクエストモデルです。
 *
 * @param name     ユーザ名
 * @param password パスワード
 *
 * @author nob
 */
@Schema(description = "認証向けのリクエストモデル", type = "object")
public record LoginRequest(
        @Schema(description = "ユーザ名", type = "string", example = "nob") String name,
        @Schema(description = "パスワード", type = "string", example = "passwd") String password) {
}
```

#### `LoginResponse.java`

```java
package nob.example.easyapp.controller.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 認証向けのレスポンスモデルです。
 *
 * @param valid 認証可否
 *
 * @author nob
 */
@Schema(description = "認証向けのレスポンスモデル", type = "object")
public record LoginResponse(
        @Schema(description = "認証可否", type = "boolean", example = "true") Boolean valid) {
}
```

#### `GetUserRequest.java`

```java
package nob.example.easyapp.controller.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * ユーザ情報取得向けのリクエストモデルです。
 *
 * @param name ユーザ名
 *
 * @author nob
 */
@Schema(description = "ユーザ情報取得向けのリクエストモデル", type = "object")
public record GetUserRequest(
        @Schema(description = "ユーザ名", type = "string", example = "nob") String name) {
}
```

#### `GetUserResponse.java`

```java
package nob.example.easyapp.controller.model;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * ユーザ情報取得向けのレスポンスモデルです。
 *
 * @param name ユーザ名
 * @param age  年齢
 *
 * @author nob
 */
@Schema(description = "ユーザ情報取得向けのレスポンスモデル", type = "object")
public record GetUserResponse(
        @Schema(description = "ユーザ名", type = "string", example = "nob") String name,
        @Schema(description = "年齢", type = "integer", example = "13") Integer age) {
}
```

### `SampleExceptionHandler.java`

例外発生時レスポンスモデルのスキーマ定義を記載します:

```java
package nob.example.easyapp.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.swagger.v3.oas.annotations.media.Schema;
import nob.example.easyapp.exception.SampleException;

/**
 * サンプル例外のハンドラです。
 *
 * @author nob
 */
@RestControllerAdvice
public class SampleExceptionHandler {

    /**
     * サンプル例外が投げられた際のハンドリングを行います。
     *
     * @param e
     * @return 例外メッセージ
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
    @ExceptionHandler(SampleException.class) // SampleExceptionが投げられた際に動く
    public ResponseEntity<SampleExceptionResponse> handleSampleException(SampleException e) {

        return new ResponseEntity(new SampleExceptionResponse(e.getMessage()), HttpStatus.UNPROCESSABLE_CONTENT);
    }

    /**
     * サンプル例外発生時のレスポンスボディです。
     *
     * @param message エラーメッセージ
     */
    @Schema(description = "サンプルエラーのレスポンス", type = "object")
    public record SampleExceptionResponse(
            @Schema(description = "エラーメッセージ", type = "string", example = "業務エラーが発生しました。") String message) {
    }
}
```

### `resources/application-swagger.yaml`

APIのdescriptionについて記載します:

```yaml
#====================
# Easy App documents
#====================
easyappdoc:
  describe:
    api:
      v1:
        login: |
          認証処理を行います。リクエストに不備があった場合はエラーレスポンスを返します。
        user: |
          ユーザ情報を取得します。
```

## 動作確認

アプリ起動後、http://localhost:8080/swagger-ui/index.html でswaggerドキュメントを確認できます。

## Tips

cf. https://springdoc.org/properties.html

### Try it outボタンを無効化したい場合

`application.properties`に下記を追加すればボタンが非表示になります:

```properties
springdoc.swagger-ui.supported-submit-methods=[]
```

### `ModelAndView`をswaggerドキュメントに反映したい場合

`springdoc.model-and-view-allowed`パラメータを変更すれば表示されます。

```properties
springdoc.model-and-view-allowed=true
```
