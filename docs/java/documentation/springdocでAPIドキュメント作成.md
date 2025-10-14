# springdoc で API ドキュメント作成

API 設計書の作成方法について説明します。springdoc-openapi によって swagger を自動生成するようにしています。

cf. https://springdoc.org/

## 実装

### pom.xml

下記の依存関係を追加します:

```xml
		<!-- https://mvnrepository.com/artifact/org.springdoc/springdoc-openapi-starter-webmvc-ui -->
		<dependency>
			<groupId>org.springdoc</groupId>
			<artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
			<version>2.8.13</version>
		</dependency>
```

### application.properties

下記設定を追記します:

```properties
# swagger出力用ymlファイルのエンドポイント
springdoc.api-docs.path=/api-docs
# swaggerドキュメント閲覧用エンドポイント
springdoc.swagger-ui.path=/swagger-ui.html
# application-swagger.ymlを読み込ませる
spring.profiles.active=swagger
```

### EasyappApplication.java

下記アノテーションを追記し、API の概要を記載します:

```diff
  package nob.example.easyapp;

  import org.springframework.boot.SpringApplication;
  import org.springframework.boot.autoconfigure.SpringBootApplication;

  import io.swagger.v3.oas.annotations.OpenAPIDefinition;
  import io.swagger.v3.oas.annotations.info.Info;

  @SpringBootApplication
+ @OpenAPIDefinition(info = @Info(title = "Easy App", version = "1.0.0", description = "サンプルのREST APIです。"))
  public class EasyappApplication {

      public static void main(String[] args) {
          SpringApplication.run(EasyappApplication.class, args);
      }
  }
```

### SampleController.java

下記アノテーションを追記し、各 API のインターフェース仕様を記載します:

```diff
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
  import nob.example.easyapp.controller.model.GreetRequest;
  import nob.example.easyapp.controller.model.GreetResponse;
  import nob.example.easyapp.controller.model.RegistRequest;
  import nob.example.easyapp.controller.model.RegistResponse;
  import nob.example.easyapp.exception.SampleException;
  import nob.example.easyapp.handler.SampleExceptionHandler.SampleExceptionResponseBody;

  /**
   * サンプルコントローラーのインターフェースです。
   *
   * @author nob
   */
  @RestController
  @RequestMapping(value = "/api/v1")
+ @Tag(name = "Sample", description = "サンプルのAPIです。")
  public interface SampleController {

      /**
       * 挨拶メッセージを返します。
       *
       * @param greetRequest 挨拶リクエスト
       * @return 挨拶メッセージ
       */
      @GetMapping(value = "/greet")
+     @Operation(summary = "挨拶メッセージ取得", description = "${easyappdoc.describe.api.v1.greet:説明文}")
+     @ApiResponses(value = {
+             @ApiResponse(responseCode = "200", description = "正常に処理された場合")
+     })
-     GreetResponse greet(GreetRequest greetRequest);
+     GreetResponse greet(@ParameterObject GreetRequest greetRequest);

      /**
       * ユーザ登録処理を行います。
       *
       * @param registRequest 登録リクエスト
       * @return 登録完了メッセージ
       * @throws SampleException 登録失敗時の例外
       */
      @PostMapping(value = "/user")
+     @Operation(summary = "ユーザ情報登録", description = "${easyappdoc.describe.api.v1.user:説明文}")
+     @ApiResponses(value = {
+             @ApiResponse(responseCode = "200", description = "正常に処理された場合"),
+             @ApiResponse(responseCode = "422", description = "エラーが発生した場合", content = @Content(schema = @Schema(implementation = SampleExceptionResponseBody.class)))
+     })
      RegistResponse regist(@RequestBody RegistRequest registRequest) throws SampleException;
  }
```

### model

各モデルクラスのスキーマ定義を記載します:

#### GreetRequest.java

```diff
  package nob.example.easyapp.controller.model;

  import io.swagger.v3.oas.annotations.media.Schema;
  import lombok.Value;

  /**
   * 挨拶APIのリクエストモデルです。
   *
   * @author nob
   */
  @Value
+ @Schema(description = "挨拶APIのリクエストモデル", type = "object")
  public class GreetRequest {

    /** ユーザ名 */
+     @Schema(description = "ユーザ名", type = "string", example = "nob")
      private String name;
  }
```

#### GreetResponse.java

```diff
  package nob.example.easyapp.controller.model;

  import io.swagger.v3.oas.annotations.media.Schema;
  import lombok.Value;

  /**
   * 挨拶APIのレスポンスモデルです。
   *
   * @author nob
   */
  @Value
+ @Schema(description = "挨拶APIのレスポンスモデル", type = "object")
  public class GreetResponse {

      /** 挨拶メッセージ */
+     @Schema(description = "挨拶メッセージ", type = "string", example = "Hello, nob!")
      private String message;
  }
```

#### RegistRequest.java

```diff
  package nob.example.easyapp.controller.model;

  import io.swagger.v3.oas.annotations.media.Schema;
  import lombok.Value;

  /**
  * 登録APIのリクエストモデルです。
  *
  * @author nob
  */
  @Value
+ @Schema(description = "登録APIのリクエストモデル", type = "object")
  public class RegistRequest {

      /** ユーザ名 */
+     @Schema(description = "ユーザ名", type = "string", example = "nob")
      private String name;

      /** 年齢 */
+     @Schema(description = "年齢", type = "integer", example = "13")
      private Integer age;
  }
```

#### RegistResponse.java

```diff
  package nob.example.easyapp.controller.model;

  import io.swagger.v3.oas.annotations.media.Schema;
  import lombok.Value;

  /**
  * 登録APIのレスポンスモデルです。
  *
  * @author nob
  */
  @Value
+ @Schema(description = "登録APIのレスポンスモデル", type = "object")
  public class RegistResponse {

      /** 登録メッセージ */
+     @Schema(description = "登録メッセージ", type = "string", example = "登録が完了しました。")
      private String message;
  }
```

### SampleExceptionHandler.java

例外発生時レスポンスモデルのスキーマ定義を記載します:

```diff
package nob.example.easyapp.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Value;
import nob.example.easyapp.exception.SampleException;

  /**
   * サンプル例外のハンドラです。
   *
   * @author nob
   */
  @RestControllerAdvice
  public class SampleExceptionHandler {

      /**
       * サンプル例外が投げられた際に呼ばれるメソッドです。
       *
       * @param e
       * @return 例外メッセージ
       */
      @SuppressWarnings({ "unchecked", "rawtypes" })
      @ExceptionHandler(SampleException.class)
      public ResponseEntity<SampleExceptionResponseBody> handleSampleException(SampleException e) {

          return new ResponseEntity(new SampleExceptionResponseBody(e.getMessage()), HttpStatus.UNPROCESSABLE_ENTITY);
      }

      /**
       * サンプル例外発生時のレスポンスボディです。
       */
      @Value
+     @Schema(description = "サンプルエラーのレスポンス", type = "object")
      public class SampleExceptionResponseBody {

          /** エラーメッセージ */
+         @Schema(description = "エラーメッセージ", type = "string", example = "業務エラーが発生しました。")
          private String message;
      }
  }
```

### resources/application-swagger.yaml

API の description について記載します:

```yaml
########################
### Easy App documents
########################
easyappdoc:
  describe:
    api:
      v1:
        greet: |
          入力されたユーザ名に対して挨拶メッセージを返します。
        user: |
          ユーザ登録処理を行います。登録に成功した場合のみ正常レスポンスを返し、それ以外はエラーレスポンスを返します。
```

## 動作確認

アプリ起動後、http://localhost:8080/swagger-ui/index.html で swagger ドキュメントを確認できます。

## Tips

### Try it out ボタンを無効化したい場合

application.properties に下記を追加すればボタンが非表示になります:

```properties
springdoc.swagger-ui.supported-submit-methods=[]
```
