# CORS設定

Reactなど、別オリジンからAPIを呼び出す際の設定例です。

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
