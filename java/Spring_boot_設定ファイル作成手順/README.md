# Spring boot 環境構築

プロジェクト構成、依存関係などの Spring boot での環境構築方法のメモです。

## 使用環境

- Java: jdk-17.0.2
- エディター: VSCode  
  下記の拡張機能をインストール
  - Debugger for Java
  - Extension Pack for Java
  - GitLens
  - Japanese Language Pack for Visual Studio Code
  - Java extension pack
  - Java Language Support
  - Language Support for Java
  - Lombok Annotations Support for VS Code
  - Maven for Java
  - Project Manager for Java
  - Spring Boot Dashboard
  - Spring Boot Extension Pack
  - Spring Boot Tools
  - Spring Initializr Java Support
  - Start git-bash
  - Test Runner for Java
  - Visual Studio IntelliCodeß

## プロジェクト構成

### 依存関係

- Spring Web
- Validation
- Thymeleaf
- Lombok

### パッケージ構成（自動生成される部分などは省略）

```
projectName
　├─src
　│　├─main
　│　│　├─java/com/example/projectName
　│　│　│　├─controller
　│　│　│　│　└─XXXController.java
　│　│　│　├─dao
　│　│　│　│　├─impl
　│　│　│　│　│　└─XXXDaoImpl.java
　│　│　│　│　└─XXXDao.java #各テーブルに対応したdao
　│　│　│　├─dto
　│　│　│　│　└─XXXDto.java
　│　│　│　├─entity
　│　│　│　│　└─XXXEntity.java #各テーブルに対応したentity
　│　│　│　├─logic
　│　│　│　│　├─impl
　│　│　│　│　│　└─XXXLogicImpl.java
　│　│　│　│　└─XXXLogic.java
　│　│　│　├─mapper
　│　│　│　│　├─XXXMapper.java
　│　│　│　│　└─XXXMapper.xml
　│　│　│　├─service
　│　│　│　│　├─impl
　│　│　│　│　│　└─XXXServiceImpl.java
　│　│　│　│　└─XXXService.java
　│　│　│　└─ProjectNameApplication.java
　│　│　└─resources
　│　│　　 └─templates
　│　│　　　　└─XXX #ページクラス.htmlを格納
　│　└─test
　│　　　└─java/com/example/projectName
　└─sqls
　　　├─create_table.sql #テーブル作成用のSQL文
　　　├─initial_data.sql #イニシャルデータ用のSQL文
　　　└─sample_data.sql #サンプルデータ用のSQL文
```

`test/java/com/example/projectName`配下は`src/java/com/example/projectName`配下と同一の構成にしてください。

### DB 関連の設定

#### pom.xml の追加設定

以下を追記：

```xml
<dependency>
    <groupId>org.mariadb.jdbc</groupId>
    <artifactId>mariadb-java-client</artifactId>
</dependency>

<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.0</version>
</dependency>
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>1.3.2</version>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
```

#### application.properties の追加設定

以下を追記：

```sh
#MariaDBのドライバ設定
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
#接続用URL
spring.datasource.url=jdbc:mariadb://localhost/DBName
#ユーザ名
spring.datasource.username=root
#パスワード
spring.datasource.password=
```

#### mybatis-config.xml の追加設定

`projectName/src/main/resources`配下に`mybatis-config.xml`を以下の内容で作成します：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration PUBLIC
        "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">

<configuration>
    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true" />
    </settings>
</configuration>
```

#### ProjectNameApplication.java の追加設定

ProjectNameApplication.java を以下のように変更します：

```java
package com.example.projectName;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;

@SpringBootApplication
@MapperScan(basePackages = "com.example.projectName.mapper")
public class ProjectNameApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjectNameApplication.class, args);
	}

	// MyBatisの設定
	@Bean
	public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
		final SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
		sessionFactory.setDataSource(dataSource);
		// コンフィグファイルの読み込み
		sessionFactory.setConfigLocation(new ClassPathResource("/mybatis-config.xml"));

		return sessionFactory.getObject();
	}
}
```
