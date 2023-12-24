# react から API 呼び出し

React と SpringBoot とを連携させ、web 側から app 側の API 呼び出しを行います。

## 準備

### app

いつも通り VSCode などから SpringBoot プロジェクトを作成します。

### web

- react のプロジェクトを新規作成します。

```shell
npm init react-app sample-web
```

- `axios`をインストールします。

```shell
npm install axios
```

## 実装

### app

基本的にいつも通り REST API を実装すればよいですが、CORS エラーを回避するためのコンフィグクラスを作成します。`/sample/greet`を叩くと固定メッセージを返す API を作成します。

- サービスインターフェース

```java
package com.example.sampleapi.service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * サンプルのサービスインターフェースです。
 *
 */
@RestController
@RequestMapping(value = "/sample")
public interface SampleService {

    /**
     * サンプルのメソッドです。ログを出力し、固定メッセージを返却します。
     *
     * @return
     */
    @GetMapping(value = "/greet")
    String greet();
}
```

- サービス実装

```java
package com.example.sampleapi.service.impl;

import org.springframework.stereotype.Service;

import com.example.sampleapi.service.SampleService;

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

        // 固定メッセージを返却
        return "Hello, axios!";
    }
}
```

- コンフィグクラス

```java
package com.example.sampleapi.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORSエラーを回避するためのコンフィグクラスです。
 * CORS: Cross-Origin Resource Sharing
 * オリジンとは、ドメインにプロトコルやポート番号を含めたものです（例: http://localhost:8080）。
 * 何も設定をしないと、ReactアプリのオリジンとJavaアプリのオリジンとが異なるためにエラーが発生します。
 * そのため本クラスによって両アプリ間の通信を許可します。
 *
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // APIのエンドポイント 一部APIのみ許可する場合は "/sample/**" などとする
                        .allowedOrigins("http://localhost:3000") // Reactアプリのオリジン
                        .allowedMethods("GET", "POST", "PUT", "DELETE")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}
```

### web

`App.js`を編集し、API のレスポンスを画面表示する実装にします。

```js
import React, { useEffect, useState } from "react";
import axios from "axios";

// APIエンドポイントのベースURLを設定
const baseUrl = "http://localhost:8080";

function App() {
  // 返却値を格納する変数
  const [greet, setgreet] = useState("");

  // APIを呼び出す関数
  const callGreet = () => {
    // APIを呼び出し、レスポンスをstateにセット
    axios
      .get(`${baseUrl}/sample/greet`)
      .then((response) => {
        setgreet(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data: ", error); // Webコンソールにログ表示
        alert("Error fetching data"); // Web上にアラート表示
      });
  };

  // 実処理
  useEffect(() => {
    // API呼び出し
    callGreet();
  }, []); // 第二引数に空配列を与えることで、最初にページにアクセスした際だけ処理を行う

  return <div>{greet}</div>;
}

export default App;
```

## 動作確認

`npm start`して`localhost:3000`にアクセスすると、API からのレスポンスが画面に表示されます。
