# springdocでAPIドキュメント作成

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

```ini
# swagger出力用ymlファイルのエンドポイント
springdoc.api-docs.path=/api-docs
# swaggerドキュメント閲覧用エンドポイント
springdoc.swagger-ui.path=/swagger-ui.html
```

### `EasyappApplication.kt`

```kotlin
package nob.example.easyapp

import io.swagger.v3.oas.annotations.OpenAPIDefinition
import io.swagger.v3.oas.annotations.info.Info
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
@OpenAPIDefinition(info = Info(title = "Easy App", version = "1.0.0", description = "サンプルのREST APIです。"))
class EasyappApplication

fun main(args: Array<String>) {
    runApplication<EasyappApplication>(*args)
}
```

### `AuthController.kt`

```kotlin
package nob.example.easyapp.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import nob.example.easyapp.controller.model.LoginRequest
import nob.example.easyapp.controller.model.LoginResponse
import nob.example.easyapp.controller.model.UserRequest
import nob.example.easyapp.controller.model.UserResponse
import nob.example.easyapp.handler.SampleExceptionHandler
import nob.example.easyapp.service.AuthService
import nob.example.easyapp.service.model.LoginInModel
import nob.example.easyapp.service.model.UserInModel
import org.springdoc.core.annotations.ParameterObject
import org.springframework.web.bind.annotation.*

/**
 * 認証コントローラーです。
 */
@RestController
@RequestMapping("/api/v1")
@Tag(name = "Auth", description = "認証APIです。")
class AuthController(private val authService: AuthService) {

    /**
     * 認証処理を呼び出します。
     */
    @PostMapping("/login")
    @Operation(
        summary = "認証",
        description = "認証処理を行います。リクエストに不備があった場合はエラーレスポンスを返します。"
    )
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "正常に処理された場合"),
            ApiResponse(
                responseCode = "422",
                description = "エラーが発生した場合",
                content = [Content(schema = Schema(implementation = SampleExceptionHandler.SampleExceptionResponse::class))]
            )
        ]
    )
    fun login(@RequestBody req: LoginRequest): LoginResponse {
        return LoginResponse(authService.login(LoginInModel(req.name, req.password)).valid)
    }

    /**
     * ユーザ情報取得処理を呼び出します。
     */
    @GetMapping("/users")
    @Operation(summary = "ユーザ情報取得", description = "ユーザ情報を取得します。")
    @ApiResponses(
        value = [
            ApiResponse(responseCode = "200", description = "正常に処理された場合")
        ]
    )
    fun user(@ParameterObject req: UserRequest): UserResponse {
        val out = authService.user(UserInModel(req.name))
        return UserResponse(out.name, out.age)
    }
}
```

### `AuthModel.kt`

```kotlin
package nob.example.easyapp.controller.model

import io.swagger.v3.oas.annotations.media.Schema

/**
 * 認証向けのリクエストモデルです。
 */
data class LoginRequest(

    /**
     * ユーザ名
     */
    @Schema(description = "ユーザ名", type = "string", example = "nob")
    val name: String,

    /**
     * パスワード
     */
    @Schema(description = "パスワード", type = "string", example = "passwd")
    val password: String
)

/**
 * 認証向けのレスポンスモデルです。
 */
data class LoginResponse(

    /**
     * 認証可否
     */
    @Schema(description = "認証可否", type = "boolean", example = "true")
    val valid: Boolean
)

/**
 * ユーザ情報取得向けのリクエストモデルです。
 */
data class UserRequest(

    /**
     * ユーザ名
     */
    @Schema(description = "ユーザ名", type = "string", example = "nob")
    val name: String
)

/**
 * ユーザ情報取得向けのレスポンスモデルです。
 */
data class UserResponse(

    /**
     * ユーザ名
     */
    @Schema(description = "ユーザ名", type = "string", example = "nob")
    val name: String,

    /**
     * 年齢
     */
    @Schema(description = "年齢", type = "integer", example = "13")
    val age: Int
)
```

### `SampleExceptionHandler.kt`

```kotlin
package nob.example.easyapp.handler

import io.swagger.v3.oas.annotations.media.Schema
import nob.example.easyapp.exception.SampleException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice


/**
 * SampleExceptionのハンドラです。
 */
@RestControllerAdvice
class SampleExceptionHandler {

    @ExceptionHandler(SampleException::class)
    fun handleSampleException(e: SampleException): ResponseEntity<SampleExceptionResponse> {
        return ResponseEntity(SampleExceptionResponse(e.message), HttpStatus.UNPROCESSABLE_CONTENT)
    }

    /**
     * SampleException発生時のレスポンスボディです。
     */
    @Schema(description = "サンプルエラーのレスポンス", type = "object")
    data class SampleExceptionResponse(

        /**
         * エラーメッセージ
         */
        val message: String
    )
}
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
