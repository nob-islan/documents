# Prometheus で Java アプリを監視する

Prometheus で Java アプリの API を監視できるようにするまでの構築手順。ついでに Grafana も導入する。

## 下準備

### サーバ

いずれも docker で動かす。[Docker インストール](../../docker/Docker%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB/)をしておく。

- アプリケーションサーバ

```
nob@java-app:~$ sudo docker --version
Docker version 23.0.2, build 569dd73
```

- Prometheus サーバ

## 手順

### アプリケーションサーバ

#### 構築

##### 検証用アプリ作成

固定メッセージを返すだけの検証用の API を作成し、API を`/sample/greet`としておく。

- インターフェース

```java
package com.example.prom.service;

import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * サンプルサービスのインターフェースです。
 *
 */
@Service
@RestController
@RequestMapping("/sample")
public interface SampleService {

    /**
     * 固定メッセージを返すメソッドです。
     *
     * @return
     */
    @GetMapping(value = "/greet")
    String greet();
}
```

- 実装

```java
package com.example.prom.service.impl;

import org.springframework.stereotype.Service;

import com.example.prom.service.SampleService;

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
    public String greet() {

        return "Hello, Prometheus!";
    }
}
```

##### 依存関係追加

メトリクス収集には`Micrometer`を使う。`pom.xml`に下記の依存関係を追記する。

```xml
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>io.micrometer</groupId>
        <artifactId>micrometer-registry-prometheus</artifactId>
    </dependency>
```

##### メトリクス収集用のエンドポイント作成

Prometheus がアプリからメトリクスを収集する用のエンドポインタを作成する。`src/main/resources/application.properties`に下記を追記する。

```properties
management.endpoints.web.exposure.include=prometheus
```

#### 起動

### Prometheus サーバ

#### 構築

#### 起動
