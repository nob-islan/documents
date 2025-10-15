# Spring Boot Restdocs でドキュメント作成

Restdocs および asciidocs を使って、単体テストの結果から API 設計書を自動作成します。

cf. https://spring.pleiades.io/guides/gs/testing-restdocs

## 各種ファイルサンプル

サンプルとして、簡単な GET メソッドおよび POST メソッドの API 設計書を作成します。

### 依存関係の追加

`pom.xml`に下記を追加します:

```xml
		<!-- https://mvnrepository.com/artifact/org.springframework.restdocs/spring-restdocs-mockmvc -->
		<dependency>
			<groupId>org.springframework.restdocs</groupId>
			<artifactId>spring-restdocs-mockmvc</artifactId>
			<scope>test</scope>
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

### API 実装

- コントローラインターフェース

```java
package nob.example.easyapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nob.example.easyapp.controller.model.SampleGetRequest;
import nob.example.easyapp.controller.model.SampleGetResponse;
import nob.example.easyapp.controller.model.SamplePostRequest;
import nob.example.easyapp.controller.model.SamplePostResponse;

/**
 * サンプルコントローラーのインターフェースです。
 *
 * @author nob
 */
@RestController
@RequestMapping(value = "/api/v1")
public interface SampleController {

    /**
     * 挨拶メッセージを返します。
     *
     * @param sampleGetRequest 名前
     * @return 挨拶メッセージ
     */
    @GetMapping(value = "/greet")
    SampleGetResponse greet(SampleGetRequest sampleGetRequest);

    /**
     * ユーザ情報の登録を行います。
     *
     * @param samplePostRequest 名前、年齢
     * @return 登録メッセージ
     */
    @PostMapping(value = "/user")
    SamplePostResponse regist(@RequestBody SamplePostRequest samplePostRequest);
}
```

- コントローラ実装

```java
package nob.example.easyapp.controller.impl;

import org.springframework.web.bind.annotation.RestController;

import lombok.NonNull;
import nob.example.easyapp.controller.SampleController;
import nob.example.easyapp.controller.model.SampleGetRequest;
import nob.example.easyapp.controller.model.SampleGetResponse;
import nob.example.easyapp.controller.model.SamplePostRequest;
import nob.example.easyapp.controller.model.SamplePostResponse;
import nob.example.easyapp.service.SampleService;
import nob.example.easyapp.service.model.SampleGetInModel;
import nob.example.easyapp.service.model.SamplePostInModel;

/**
 * SampleControllerの実装です。
 *
 * @author nob
 */
@RestController
public class SampleControllerImpl implements SampleController {

    @NonNull
    private SampleService sampleService;

    public SampleControllerImpl(SampleService sampleService) {
        this.sampleService = sampleService;
    }

    @Override
    public SampleGetResponse greet(SampleGetRequest sampleGetRequest) {

        return new SampleGetResponse(
                sampleService.greet(new SampleGetInModel(sampleGetRequest.getName())).getMessage());
    }

    @Override
    public SamplePostResponse regist(SamplePostRequest samplePostRequest) {

        return new SamplePostResponse(sampleService
                .regist(new SamplePostInModel(samplePostRequest.getName(), samplePostRequest.getAge())).getMessage());
    }
}
```

- コントローラテスト

```java
package nob.example.easyapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import nob.example.easyapp.controller.model.SamplePostRequest;
import nob.example.easyapp.service.SampleService;
import nob.example.easyapp.service.model.SampleGetInModel;
import nob.example.easyapp.service.model.SampleGetOutModel;
import nob.example.easyapp.service.model.SamplePostInModel;
import nob.example.easyapp.service.model.SamplePostOutModel;

import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath;
import static org.springframework.restdocs.payload.PayloadDocumentation.requestFields;
import static org.springframework.restdocs.payload.PayloadDocumentation.responseFields;
import static org.springframework.restdocs.request.RequestDocumentation.parameterWithName;
import static org.springframework.restdocs.request.RequestDocumentation.queryParameters;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.prettyPrint;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessRequest;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.preprocessResponse;

/**
 * SampleControllerImplのテストクラスです。
 *
 * @author nob
 */
@WebMvcTest(SampleController.class)
@AutoConfigureRestDocs(outputDir = "target/snippets")
public class SampleControllerImplTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SampleService sampleService;

    /**
     * greetのテスト 正常系
     *
     * @throws Exception
     */
    @Test
    void test_greet_success() throws Exception {

        Mockito.when(sampleService.greet(new SampleGetInModel("nob"))).thenReturn(new SampleGetOutModel("Hello, nob!"));

        this.mockMvc
                .perform(get("/api/v1/greet")
                        .queryParam("name", "nob")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(document("asciidoc/api/v1/greet",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        queryParameters(
                                parameterWithName("name").description("名前")),
                        responseFields(
                                fieldWithPath("message").description("Hello, nob!"))));
    }

    /**
     * registのテスト 正常系
     *
     * @throws Exception
     */
    @Test
    void test_regist_success() throws Exception {

        SamplePostRequest request = new SamplePostRequest("nob", 13);

        Mockito.when(sampleService.regist(new SamplePostInModel("nob", 13)))
                .thenReturn(new SamplePostOutModel("登録に成功しました。"));

        this.mockMvc
                .perform(post("/api/v1/user")
                        .content(objectMapper.writeValueAsString(request))
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(document("asciidoc/api/v1/user",
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestFields(
                                fieldWithPath("name").description("ユーザ名"),
                                fieldWithPath("age").description("年齢")),
                        responseFields(
                                fieldWithPath("message").description("登録に成功しました。"))));
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

:sample: {base_path}/api/v1

=== Greet

挨拶APIです。

:sample_greet: {sample}/greet

.query parameter
include::{sample_greet}/query-parameters.adoc[]

.response field
include::{sample_greet}/response-fields.adoc[]

.example request
include::{sample_greet}/curl-request.adoc[]

.example response
include::{sample_greet}/response-body.adoc[]

=== Regist

ユーザ情報登録APIです。

:sample_user: {sample}/user

.request field
include::{sample_user}/request-fields.adoc[]

.response field
include::{sample_user}/response-fields.adoc[]

.example request
include::{sample_user}/curl-request.adoc[]

.example response
include::{sample_user}/response-body.adoc[]
```

`:hogehoge:`で適宜変数を定め、`include::`で生成したスニペットを読み込んでいます。

## 設計書生成手順

- 単体テストを実行します。テストに成功すると、`target/snippets` 配下に、`document` 内で定めたパスに各種スニペットが出力されます。

```shell
./mvnw test
```

- パッケージをビルドします。`target/generated-docs` 配下に設計書本体 `index.html` が出力されます。

```shell
./mvnw package
```
