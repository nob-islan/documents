# Spring Boot Restdocs でドキュメント作成

Restdocs および asciidocs を使って、単体テストの結果から API 設計書を自動作成します。

cf. https://spring.pleiades.io/guides/gs/testing-restdocs

## 各種ファイルサンプル

サンプルとして、簡単な GET メソッドおよび POST メソッドの API 設計書を作成します。

### 依存関係の追加

`pom.xml`に下記を追加します:

```xml
<!-- for restdocs -->
<dependency>
    <groupId>org.springframework.restdocs</groupId>
    <artifactId>spring-restdocs-mockmvc</artifactId>
    <scope>test</scope>
</dependency>
```

```xml
<!-- for asciidocs -->
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

### API 実装

- コントローラインターフェース

  ```java
  package com.example.easyapp.controller;

  import org.springframework.web.bind.annotation.GetMapping;
  import org.springframework.web.bind.annotation.PostMapping;
  import org.springframework.web.bind.annotation.RequestBody;
  import org.springframework.web.bind.annotation.RequestMapping;
  import org.springframework.web.bind.annotation.RestController;

  import com.example.easyapp.controller.reqres.SampleGetRequest;
  import com.example.easyapp.controller.reqres.SampleGetResponse;
  import com.example.easyapp.controller.reqres.SamplePostRequest;
  import com.example.easyapp.controller.reqres.SamplePostResponse;

  /**
   * サンプルのコントローラインターフェースです。
   *
   */
  @RestController
  @RequestMapping(value = "/api/sample")
  public interface SampleController {

      /**
       * サンプルのGETメソッドです。
       *
       * @param sampleGetRequest 名前
       * @return メッセージ
       */
      @GetMapping(value = "/get")
      SampleGetResponse sampleGet(SampleGetRequest sampleGetRequest);

      /**
       * サンプルのPOSTメソッドです。
       *
       * @param samplePostRequest 名前、年齢
       * @return メッセージ
       */
      @PostMapping(value = "/post")
      SamplePostResponse samplePost(@RequestBody SamplePostRequest samplePostRequest);
  }
  ```

- コントローラ実装

  ```java
  package com.example.easyapp.controller.impl;

  import org.springframework.web.bind.annotation.RestController;

  import com.example.easyapp.controller.SampleController;
  import com.example.easyapp.controller.reqres.SampleGetRequest;
  import com.example.easyapp.controller.reqres.SampleGetResponse;
  import com.example.easyapp.controller.reqres.SamplePostRequest;
  import com.example.easyapp.controller.reqres.SamplePostResponse;

  /**
   * サンプルのコントローラ実装クラスです。
   *
   */
  @RestController
  public class SampleControllerImpl implements SampleController {

      @Override
      public SampleGetResponse sampleGet(SampleGetRequest sampleGetRequest) {

          String message = "Hello, " + sampleGetRequest.getName() + "!";
          SampleGetResponse sampleGetResponse = new SampleGetResponse();
          sampleGetResponse.setMessage(message);

          return sampleGetResponse;
      }

      @Override
      public SamplePostResponse samplePost(SamplePostRequest samplePostRequest) {

          String message = "Hello, " + samplePostRequest.getName() + "(" + samplePostRequest.getAge() + ")!";
          SamplePostResponse samplePostResponse = new SamplePostResponse();
          samplePostResponse.setMessage(message);

          return samplePostResponse;
      }
  }
  ```

- コントローラテスト

  ```java
  package com.example.easyapp.controller;

  import org.springframework.beans.factory.annotation.Autowired;
  import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
  import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
  import org.springframework.http.MediaType;
  import org.springframework.test.web.servlet.MockMvc;

  import com.example.easyapp.controller.reqres.SamplePostRequest;
  import com.fasterxml.jackson.databind.ObjectMapper;

  import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
  import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get;
  import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post;
  import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
  import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
  import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
  import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
  import static org.springframework.restdocs.request.RequestDocumentation.queryParameters;
  import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

  import org.junit.jupiter.api.Test;

  /**
   * SampleControllerImplのテストクラスです。
   *
   */
  @WebMvcTest(SampleController.class)
  @AutoConfigureRestDocs(outputDir = "target/snippets")
  public class SampleControllerImplTest {

      @Autowired
      private MockMvc mockMvc;

      @Autowired
      private ObjectMapper objectMapper;

      /**
       * sampleGetのテスト 正常系
       *
       * @throws Exception
       */
      @Test
      public void test_sampleGet_success() throws Exception {

          this.mockMvc
                  .perform(get("/api/sample/get")
                          .param("name", "nob")
                          .accept(MediaType.APPLICATION_JSON))
                  .andExpect(status().isOk())
                  .andDo(document("asciidoc/sample/get",
                          queryParameters(
                                  parameterWithName("name").description("名前")),
                          responseFields(
                                  fieldWithPath("message").description("挨拶メッセージ"))));
      }

      /**
       * samplePostのテスト 正常系
       *
       * @throws Exception
       */
      @Test
      public void test_samplePost_success() throws Exception {

          SamplePostRequest samplePostRequest = new SamplePostRequest();
          samplePostRequest.setName("nob");
          samplePostRequest.setAge(13);

          this.mockMvc
                  .perform(post("/api/sample/post")
                          .content(objectMapper.writeValueAsString(samplePostRequest))
                          .contentType(MediaType.APPLICATION_JSON)
                          .accept(MediaType.APPLICATION_JSON))
                  .andExpect(status().isOk())
                  .andDo(document("asciidoc/sample/post",
                          requestFields(
                                  fieldWithPath("name").description("名前"),
                                  fieldWithPath("age").description("年齢")),
                          responseFields(
                                  fieldWithPath("message").description("挨拶メッセージ"))));
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

== Sample

サンプルAPIです。

:sample: {base_path}/sample

=== Sample get

サンプルのGET APIです。

:sample_get: {sample}/get

.query parameter
include::{sample_get}/query-parameters.adoc[]

.response field
include::{sample_get}/response-fields.adoc[]

.example request
include::{sample_get}/curl-request.adoc[]

.example response
include::{sample_get}/response-body.adoc[]

=== Sample post

サンプルのPOST APIです。

:sample_post: {sample}/post

.request field
include::{sample_post}/request-fields.adoc[]

.response field
include::{sample_post}/response-fields.adoc[]

.example request
include::{sample_post}/curl-request.adoc[]

.example response
include::{sample_post}/response-body.adoc[]
```

`:hogehoge:`で適宜変数を定め、`include::`で生成したスニペットを読み込んでいます。

## 設計書生成手順

- 単体テストを実行します。上記の場合テストに成功すると`target/snippets`配下に、`document`内で定めたパスに各種スニペットが出力されます。
- `./mvnw package`でパッケージをビルドします。`target/generated-docs`配下に設計書本体`index.html`が出力されます。
