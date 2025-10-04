# バリデーションエラーのハンドリング

REST API のバリデーションエラーをハンドリングし、`curl`での打鍵および単体テストでの異常系チェックが行えるようにします。

## 実装

### 設定ファイル

- pom.xml

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

### 業務ロジック

- サービスインターフェース

```java
package com.example.uttest.service;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.uttest.dto.SampleInModel;

import jakarta.validation.Valid;

/**
 * サンプルサービスのインターフェースです。
 *
 */
@RestController
@RequestMapping(value = "/sample")
public interface SampleService {

    /**
     * サンプルのメソッドです。
     *
     * @param sampleDto
     * @return fixed message
     */
    @PostMapping(value = "/greet")
    String greet(@RequestBody @Valid SampleInModel sampleInModel); // @Validが付いているinModelについて検証を行います。
}
```

- サービス実装

```java
package com.example.uttest.service.impl;

import org.springframework.stereotype.Service;

import com.example.uttest.dto.SampleInModel;
import com.example.uttest.service.SampleService;

/**
 * サンプルサービスの実装クラスです。
 *
 */
@Service
public class SampleServiceImpl implements SampleService {

    /**
     * {@inheritDoc}
     *
     */
    @Override
    public String greet(SampleInModel sampleInModel) {

        System.out.println("名前: " + sampleInModel.getName());
        System.out.println("年齢: " + sampleInModel.getAge());
        System.out.println("職業: " + sampleInModel.getSampleDto().getJob());

        return "success";
    }
}
```

- 入力モデル

```java
package com.example.uttest.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

/**
 * サンプルのinModelです。
 *
 */
@Data
public class SampleInModel {

    // 名前
    @NotEmpty(message = "{sampleInModel.name.NotEmpty}")
    private String name;

    // 年齢
    @NotEmpty(message = "{sampleInModel.age.NotEmpty}")
    private String age;

    // サンプルのdto
    @Valid
    private SampleDto sampleDto;

    /**
     * サンプルのdtoです。
     *
     */
    @Data
    public class SampleDto {

        // 職業
        @NotEmpty(message = "{sampleInModel.sampleDto.job.NotEmpty}")
        private String job;
    }
}
```

### 共通ロジック

- バリデータ初期化のコンフィグクラス

```java
package com.example.uttest.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.stereotype.Service;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;
import org.springframework.validation.beanvalidation.MethodValidationPostProcessor;

import jakarta.validation.Validator;

/**
 * Validator初期化のコンフィグクラスです。
 *
 */
@Configuration
public class ValidatorConfig {

    /**
     * エラーメッセージの辞書をBean宣言します。
     *
     * @return messageSource
     */
    @Bean
    ResourceBundleMessageSource messageSource() {

        // 返却値を宣言
        ResourceBundleMessageSource messageSource = new ResourceBundleMessageSource();
        // エラーメッセージの辞書ファイルを指定
        messageSource.setBasename("validator-dictionary"); // validator-dictionary.propertiesをresources配下に作成します。
        messageSource.setDefaultEncoding("UTF-8");

        return messageSource;
    }

    /**
     * ValidatorをBean宣言します。
     *
     * @return validator
     */
    @Bean
    Validator validator() {

        // 返却値を宣言
        LocalValidatorFactoryBean localValidatorFactoryBean = new LocalValidatorFactoryBean();
        // メッセージソースを指定
        localValidatorFactoryBean.setValidationMessageSource(messageSource());

        return localValidatorFactoryBean;
    }

    /**
     * '@Service'アノテーションが付与されたクラスへの割り込みを行います。
     *
     * @param validator
     * @return processor
     */
    @Bean
    MethodValidationPostProcessor methodValidationPostProcessor(Validator validator) {

        // 返却値を宣言
        MethodValidationPostProcessor processor = new MethodValidationPostProcessor();
        // 検証するアノテーションの型を指定
        processor.setValidatedAnnotationType(Service.class);
        // バリデータをセット
        processor.setValidator(validator);

        return processor;
    }
}
```

- `validator-dictionary.properties`

```properties
# エラーメッセージの辞書ファイルです。

sampleInModel.name = 名前
sampleInModel.name.NotEmpty = {sampleInModel.name}が空白です。
sampleInModel.age = 年齢
sampleInModel.age.NotEmpty  = {sampleInModel.age}が空白です。
sampleInModel.sampleDto.job = 職業
sampleInModel.sampleDto.job.NotEmpty = {sampleInModel.sampleDto.job}が空白です。
```

- 例外ハンドラ

```java
package com.example.uttest.handler;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * サンプルの例外ハンドラです。
 *
 */
@RestControllerAdvice
public class SampleHandler {

    /**
     * バリデーションによる例外が投げられた際に呼ばれるメソッドです。
     *
     * @param e
     * @return
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<List<String>> validatorExceptionHandle(MethodArgumentNotValidException e) {

        // エラーメッセージをリストに詰め込む
        List<String> errorList = new ArrayList<String>();
        for (int i = 0; i < e.getAllErrors().size(); i++) {
            errorList.add(e.getAllErrors().get(i).getDefaultMessage());
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorList);
    }
}
```

- テストクラス

```java
package com.example.uttest.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import com.example.uttest.config.ValidatorConfig;
import com.example.uttest.dto.SampleInModel;
import com.example.uttest.dto.SampleInModel.SampleDto;
import com.example.uttest.service.impl.SampleServiceImpl;
import com.example.uttest.util.ValidatorTestUtil;
import com.example.uttest.util.ValidatorTestUtil.SampleErrorInfo;

import jakarta.validation.ConstraintViolationException;

/**
 * SampleServiceImplのテストクラスです。
 *
 */
@SpringBootTest
@SpringJUnitConfig(classes = { SampleServiceImplTest.TestConfig.class, ValidatorConfig.class }) // 必要なコンフィグクラスをロードします。
public class SampleServiceImplTest {

    /**
     * テスト設定を行います。
     *
     */
    @Configuration
    public static class TestConfig {

        /**
         * テスト対象のクラスをBean宣言します。
         *
         * @return sampleServiceImpl
         */
        @Bean
        SampleServiceImpl sampleServiceImpl() {
            return new SampleServiceImpl();
        }
    }

    @Autowired
    private SampleService sampleService;

    /**
     * 異常系 名前が空のケース
     *
     */
    @Test
    public void testGreet_name_empty() {

        // 入力値の設定
        SampleInModel sampleInModel = new SampleInModel();
        sampleInModel.setName("");
        sampleInModel.setAge("13");
        SampleDto sampleDto = sampleInModel.new SampleDto();
        sampleDto.setJob("なし");
        sampleInModel.setSampleDto(sampleDto);

        // テスト実行
        List<SampleErrorInfo> list = new ArrayList<SampleErrorInfo>();
        try {
            sampleService.greet(sampleInModel);
            fail();
        } catch (ConstraintViolationException e) {
            // 例外を独自のinfoクラスに詰め替え
            list = ValidatorTestUtil.convertToSampleErrorInfoList(e);
        }

        // 結果の検証
        assertEquals(1, list.size());
        assertEquals("名前が空白です。", list.get(0).getErrorMessage());
    }

    /**
     * 異常系 職業が空のケース
     *
     */
    @Test
    public void testGreet_job_empty() {

        // 入力値の設定
        SampleInModel sampleInModel = new SampleInModel();
        sampleInModel.setName("nob");
        sampleInModel.setAge("13");
        SampleDto sampleDto = sampleInModel.new SampleDto();
        sampleDto.setJob("");
        sampleInModel.setSampleDto(sampleDto);

        // テスト実行
        List<SampleErrorInfo> list = new ArrayList<SampleErrorInfo>();
        try {
            sampleService.greet(sampleInModel);
            fail();
        } catch (ConstraintViolationException e) {
            // 例外を独自のinfoクラスに詰め替え
            list = ValidatorTestUtil.convertToSampleErrorInfoList(e);
        }

        // 結果の検証
        assertEquals(1, list.size());
        assertEquals("職業が空白です。", list.get(0).getErrorMessage());
    }

    /**
     * 異常系 名前と年齢が空のケース
     *
     */
    @Test
    public void testGreet_name_age_empty() {

        // 入力値の設定
        SampleInModel sampleInModel = new SampleInModel();
        sampleInModel.setName("");
        sampleInModel.setAge("");
        SampleDto sampleDto = sampleInModel.new SampleDto();
        sampleDto.setJob("なし");
        sampleInModel.setSampleDto(sampleDto);

        // テスト実行
        List<SampleErrorInfo> list = new ArrayList<SampleErrorInfo>();
        try {
            sampleService.greet(sampleInModel);
            fail();
        } catch (ConstraintViolationException e) {
            // 例外を独自のinfoクラスに詰め替え
            list = ValidatorTestUtil.convertToSampleErrorInfoList(e);
        }

        // 結果の検証
        assertEquals(2, list.size());
        assertEquals("名前が空白です。", list.get(0).getErrorMessage());
        assertEquals("年齢が空白です。", list.get(1).getErrorMessage());
    }
}
```

- テスト向け補助クラス

```java
package com.example.uttest.util;

import java.util.ArrayList;
import java.util.List;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.Data;

/**
 * バリデーションに関する共通メソッドを定義するクラスです。
 *
 */
public class ValidatorTestUtil {

    /**
     * バリデーションエラーの情報を独自infoクラスに移し替えます。
     *
     * @param e
     * @return sampleErrorInfoList
     */
    public static List<SampleErrorInfo> convertToSampleErrorInfoList(ConstraintViolationException e) {

        // 返却地の宣言
        List<SampleErrorInfo> sampleErrorInfoList = new ArrayList<SampleErrorInfo>();

        // エラー情報をinfoクラスに詰め替えてリストを作成
        for (ConstraintViolation<?> constraintViolation : e.getConstraintViolations()) {
            SampleErrorInfo sampleErrorInfo = new SampleErrorInfo();
            sampleErrorInfo.setErrorMessage(constraintViolation.getMessage());
            sampleErrorInfoList.add(sampleErrorInfo);
        }

        return sampleErrorInfoList;
    }

    /**
     * サンプルのエラー情報を格納するクラスです。
     *
     */
    @Data
    public static class SampleErrorInfo {

        // エラーメッセージ
        private String errorMessage;
    }
}
```

## 動確

```
Nobs-MacBook-Air:~ nob$ curl -X POST -H "Content-Type: application/json" -d "{\"name\": \"nob\" , \"age\": \"13\", \"sampleDto\": {\"job\": \"\"}}" localhost:8080/sample/greet
["職業が空白です。"]

Nobs-MacBook-Air:~ nob$ curl -X POST -H "Content-Type: application/json" -d "{\"name\": \"\" , \"age\": \"\", \"sampleDto\": {\"job\": \"no\"}}" localhost:8080/sample/greet
["名前が空白です。","年齢が空白です。"]
```
