# Spring Bootでマルチモジュールアプリを作成

依存関係を持つ複数のプロジェクトを用いてアプリをビルドする手順です。  
cf. https://spring.pleiades.io/guides/gs/multi-module/

## プロジェクト構成

```
multi-module
  ├─app-project
  │   └─(Spring Bootプロジェクト)
  ├─web-project
  │   └─(Spring Bootプロジェクト)
  ├─.mvn
  ├─mvnw
  └─pom.xml
```

`web-project`が`app-project`に依存します。

## 実装

appおよびwebの実装方法を記載します。

### app-project

web側から呼ばれるモジュールです。

#### サービスインターフェース

ドキュメントとしてわかりやすいようにエンドポイントは設けませんが、こちらにも`@RequestMapping` などのアノテーションによってエンドポイントを付与できます。

```java
package com.example.appproject.service;

import org.springframework.stereotype.Service;

/**
 * サンプルのappインターフェースです。
 *
 */
@Service
public interface SampleAppService {

    /**
     * サンプルのappメソッドです。
     *
     * @return 固定メッセージ
     */
    String greeting();
}
```

#### サービス実装

固定メッセージを返却するだけの実装です。

```java
package com.example.appproject.service.impl;

import org.springframework.stereotype.Service;

import com.example.appproject.service.SampleAppService;

/**
 * サンプルappサービスの実装クラスです。
 *
 */
@Service
public class SampleAppServiceImpl implements SampleAppService {

    /**
     * {@inheritDoc}
     *
     */
    @Override
    public String greeting() {

        return "Hello, multi module!";
    }
}
```

#### pom.xml

実行可能jarをビルドしないようにするため、`<build>`ブロックを丸ごと消します。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.2.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>app-project</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>app-project</name>
	<description>Demo project for Spring Boot</description>
	<properties>
		<java.version>17</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>
	</dependencies>

	<!-- <build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build> -->
</project>
```

### web-project

`app-project`を呼び出すモジュールです。

#### メインクラス

依存関係に含まれる自作パッケージをスキャンする旨を追記します。

```java
package com.example.webproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = { "com.example" }) // 自身を含む、依存するパッケージを記載する
public class WebProjectApplication {

	public static void main(String[] args) {
		SpringApplication.run(WebProjectApplication.class, args);
	}
}
```

#### サービスインターフェース

エンドポイントを設けて公開API実装とします。

```java
package com.example.webproject.service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * サンプルのwebインターフェースです。
 *
 */
@RestController
@RequestMapping(value = "/web")
public interface SampleWebService {

    /**
     * サンプルのwebメソッドです。
     *
     * @return
     */
    @GetMapping(value = "/greet")
    String greeting();
}
```

#### サービス実装クラス

`@Autowired`でapp側のサービスをBean宣言して呼び出します。

```java
package com.example.webproject.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.appproject.service.SampleAppService;
import com.example.webproject.service.SampleWebService;

/**
 * サンプルwebサービスの実装クラスです。
 *
 */
@Service
public class SampleWebServiceImpl implements SampleWebService {

    // app serviceをBean宣言
    @Autowired
    private SampleAppService sampleAppService;

    /**
     * {@inheritDoc}
     *
     */
    @Override
    public String greeting() {

        // app service呼び出し
        return sampleAppService.greeting();
    }
}
```

#### pom.xml

app-projectを依存関係に追加：

```xml
<dependency>
    <groupId>com.example</groupId>
    <artifactId>app-project</artifactId>
    <version>0.0.1-SNAPSHOT</version>
</dependency>
```

する以外はデフォルトのままです。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<parent>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-parent</artifactId>
		<version>3.2.0</version>
		<relativePath/> <!-- lookup parent from repository -->
	</parent>
	<groupId>com.example</groupId>
	<artifactId>web-project</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<name>web-project</name>
	<description>Demo project for Spring Boot</description>
	<properties>
		<java.version>17</java.version>
	</properties>
	<dependencies>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-thymeleaf</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-validation</artifactId>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-web</artifactId>
		</dependency>

		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-test</artifactId>
			<scope>test</scope>
		</dependency>

        <!-- for app project -->
		<dependency>
			<groupId>com.example</groupId>
			<artifactId>app-project</artifactId>
			<version>0.0.1-SNAPSHOT</version>
		</dependency>
	</dependencies>

	<build>
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<excludes>
						<exclude>
							<groupId>org.projectlombok</groupId>
							<artifactId>lombok</artifactId>
						</exclude>
					</excludes>
				</configuration>
			</plugin>
		</plugins>
	</build>

</project>
```

### multi-module

親プロジェクトの設定です。

#### pom.xml

`packaging`タグを`pom`とし、`modules`タグにビルドするモジュールたちを記載します。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>org.springframework</groupId>
    <artifactId>gs-multi-module</artifactId>
    <version>0.1.0</version>
    <packaging>pom</packaging>

    <modules>
        <module>app-project</module>
        <module>web-project</module>
    </modules>

</project>
```

#### mvn関連

VSCodeの機能で自動生成したものをapp-project等からコピーしてくるのが楽です。

```sh
cp -r mvnw* .mvn ..
```

## ビルド

プロジェクトのルートディレクトリにて、下記コマンドで各モジュールがビルドされます。

```shell
./mvnw package
```

`web-project`のjarを起動してエンドポイントにアクセスすると、`app-project`モジュールを呼び出していることが確認できます。
