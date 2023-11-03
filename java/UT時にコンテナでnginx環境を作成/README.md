# UT 時にコンテナで nginx 環境を作成

UT 実行時にコンテナで nginx サーバを起動します。

## 実装

簡単な起動シェルを用いてサーバを立ち上げます。

### 実装

`pom.xml`に下記を追記します。

```xml
<!-- for testcontainers -->
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>testcontainers</artifactId>
    <version>1.16.3</version>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>junit-jupiter</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>nginx</artifactId>
    <version>1.19.1</version>
    <scope>test</scope>
</dependency>
```

### 起動シェル

`test/resources`配下に、起動用のシェルを作成します。今回はファイル名を`startup.sh`と想定します。

```shell
#!/bin/bash

# テストファイル作成
mkdir /usr/share/nginx/html/nob
echo "Hello, nginx!" > /usr/share/nginx/html/nob/test.html

# nginx起動
/docker-entrypoint.sh nginx -g 'daemon off;'
```

### テスト作成

```java
package com.example.nginxtest.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.testcontainers.containers.BindMode;
import org.testcontainers.containers.NginxContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * SampleServiceのテストクラスです。
 *
 */
@SpringBootTest
@Testcontainers
public class SampleServiceTest {

    static final DockerImageName NGINX_DOCKER_IMAGE_NAME = DockerImageName.parse("nginx").withTag("stable");

    @Container
    static final NginxContainer<?> nginxContainer = new NginxContainer<>(NGINX_DOCKER_IMAGE_NAME)
            .withClasspathResourceMapping("startup.sh", "/tmp/startup.sh", BindMode.READ_WRITE)
            .withCommand("bash /tmp/startup.sh");

    /**
     * テスト 正常系
     *
     */
    @Test
    public void test() {
        // UTを記載
    }
}
```

コンテナの 80 ポートにフォワードされるホスト側のポートは毎回変わります。`nginxContainer.getBaseUrl("http", 80)`で接続情報を取得できます。
