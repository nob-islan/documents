# Swagger 書き方

各種アノテーションを使って swager ドキュメントを記載します。

## 下準備

### pom.xml

下記の依存関係を追加します。

```xml
<!-- for swagger -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

### application.proerties

ドキュメント閲覧用のエンドポイントなどを設定します。

```properties
# swagger用設定

# swagger出力用ymlファイルのエンドポイント
springdoc.api-docs.path=/api-docs
# swaggerドキュメント閲覧用エンドポイント
springdoc.swagger-ui.path=/swagger-ui.html
# application-swagger.ymlを読み込ませる
spring.profiles.active=swagger
```

### application-swagger.yml

Java アプリ内から下記ファイルを読み込んでドキュメントに反映させます。

```yml
########################
### Sample API documents
########################
sampleapidoc:
  describe:
    sample:
      greet: |
        固定の挨拶メッセージを返却します。
```

## 実装

### メインクラス

```java
package nob.example.easyapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@OpenAPIDefinition(info = @Info(title = "Sample API", version = "1.0.0", description = "サンプルのAPIです。")) // アプリケーションの説明です。
public class EasyAppApplication {

	public static void main(String[] args) {
		SpringApplication.run(EasyAppApplication.class, args);
	}
}
```

### サービスインターフェース

```java
package nob.example.easyapp.service;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import nob.example.easyapp.dto.SampleInModel;
import nob.example.easyapp.dto.SampleOutModel;

/**
 * サンプルサービスのインターフェースです。
 *
 */
@RestController
@RequestMapping(value = "/sample")
@Tag(name = "Sampler service", description = "サンプルのAPIです。") // サービスへのタグ付けおよびその説明です。
public interface SampleService {

    /**
     * サンプルメソッドです。固定メッセージを返します。
     *
     * @return 挨拶メッセージ
     */
    @PostMapping(value = "/greet")
    @Operation(summary = "サンプルメソッド", description = "${sampleapidoc.describe.sample.greet:説明文}") // APIの説明です。
    SampleOutModel greet(@RequestBody SampleInModel sampleInModel);
}
```

### inModel

```java
package nob.example.easyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * サンプルのinModelです。
 *
 */
@Data
@Schema(description = "サンプルのinModel", type = "object") // inModelの説明です。
public class SampleInModel {

    // 入力メッセージ
    @Schema(description = "入力メッセージ", type = "string", example = "テスト入力メッセージ") // 各種パラメータの説明です。
    private String inputMessage;

    // サンプル入力dto
    @Schema(description = "サンプル入力dto", type = "object")
    private SampleInputDto sampleInputDto;
}
```

```java
package nob.example.easyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * サンプルの入れ子dtoです。
 *
 */
@Data
@Schema(description = "サンプルの入れ子dto")
public class SampleInputDto {

    // ID
    @Schema(description = "ユーザID", type = "string", example = "706")
    private String id;

    // 名前
    @Schema(description = "ユーザ名", type = "string", example = "nob")
    private String name;
}
```

### outModel

```java
package nob.example.easyapp.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * サンプルのoutModelです。
 *
 */
@Data
@Schema(description = "サンプルのoutModel", type = "object")
public class SampleOutModel {

    // 挨拶メッセージ
    @Schema(description = "挨拶メッセージ", type = "string", example = "テスト出力メッセージ")
    private String greetMessage;
}
```

### ドキュメント確認方法

アプリ起動後、http://localhost:8080/swagger-ui/index.html にアクセスします。
