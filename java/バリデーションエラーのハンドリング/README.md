# バリデーションエラーのハンドリング

REST API のバリデーションエラーをハンドリングし、`curl`での打鍵および単体テストでの異常系チェックが行えるようにします。

## 実装

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
        messageSource.setBasename("validatorDictionary"); // validatorDictionary.propertiesをresources配下に作成します。
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

```properties
# エラーメッセージの辞書ファイルです。

sampleInModel.name = 名前
sampleInModel.name.NotEmpty = {sampleInModel.name}が空白です。
sampleInModel.age = 年齢
sampleInModel.age.NotEmpty  = {sampleInModel.age}が空白です。
sampleInModel.sampleDto.job = 職業
sampleInModel.sampleDto.job.NotEmpty = {sampleInModel.sampleDto.job}が空白です。
```
