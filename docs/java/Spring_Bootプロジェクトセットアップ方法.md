# Spring Boot プロジェクトセットアップ方法

Spring Boot で実装する REST API のプロジェクトの初期セットアップ方法について記載します。

## プロジェクト作成

cf. https://docs.spring.io/initializr/docs/0.9.1/reference/html/#command-line

- [Spring initializer](https://start.spring.io/) を使ってプロジェクトを新規作成します。

```shell
curl https://start.spring.io/starter.zip \
  -d dependencies=web,lombok,data-jpa,mariadb \
  -d type=maven-project \
  -d language=java \
  -d name=easyapp \
  -d groupId=nob.example \
  -d artifactId=easyapp \
  -o easyapp.zip
```

- zip を解凍します。

```shell
unzip easyapp.zip && rm -rf easyapp.zip
```

## 実装

サンプルコードを掲載します。ここでは擬似的なログイン画面を実装します。

### 事前準備

データベースを docker で構築し、Java プロジェクト側に接続情報を記載します。

#### docker-compose.yaml

```yaml
services:
  easyappdb:
    image: mariadb:latest
    container_name: easyappdb
    ports:
      - 3306:3306
    volumes:
      - ./volumes/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

#### volumes/initdb.d/create-database.sql

```sql
CREATE DATABASE easyappdb;
USE easyappdb;

CREATE TABLE users (
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32)
);

INSERT INTO users VALUES (
    'nob'
    , 'passwd'
);
```

#### src/main/resources/application.properties

```shell
#MariaDBのドライバ設定
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
#接続用URL
spring.datasource.url=jdbc:mariadb://localhost/easyappdb
#ユーザ名
spring.datasource.username=root
#パスワード
spring.datasource.password=password
```

### ディレクトリ構成

作成が必要なもののみ記載しています。

```shell
.
├── controller
│   ├── impl
│   │   └── AuthControllerImpl.java  # APIインターフェースの実装
│   ├── AuthController.java          # APIとしてのインターフェース
│   └── model
│       ├── AuthRequest.java         # APIのリクエストモデル
│       └── AuthResponse.java        # APIのレスポンスモデル
├── repository
│   ├── entity
│   │   └── Users.java                # データベースのテーブル定義に対応するエンティティ
│   └── UsersRepository.java          # データベース操作のインターフェース
└── service
    ├── impl
    │   └── AuthServiceImpl.java     # 業務処理の実装
    ├── AuthService.java             # 業務処理のインターフェース
    └── model
        ├── AuthInModel.java         # 業務処理の入力モデル
        └── AuthOutModel.java        # 業務処理の出力モデル
```

### クラス一覧

#### repository/UsersRepository.java

データベースにアクセスする repository インターフェースを定義します。JpaRepository によって実装が自動生成されます。

```java
package nob.example.easyapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import nob.example.easyapp.repository.entity.Users;

/**
 * usersテーブル向けrepositoryのインターフェースです。
 *
 * @author nob
 */
@Repository
public interface UsersRepository extends JpaRepository<Users, String> {

    /**
     * ユーザ情報を取得します。
     *
     * @param name 検索キーのユーザ名
     * @return ユーザ情報
     */
    Users findByName(String name);
}
```

#### repository/entity/Users.java

データベースのテーブル定義に対応するエンティティを定義します。

```java
package nob.example.easyapp.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * usersテーブルのエンティティクラスです。
 *
 * @author nob
 */
@Table(name = "users")
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Users {

    /** ユーザ名 */
    @Id
    @Column(name = "name", length = 8, nullable = false)
    private String name;

    /** パスワード */
    @Column(name = "password", length = 32, nullable = false)
    private String password;
}
```

#### service/AuthService.java

業務処理を担うクラスのインターフェースを定義します。

```java
package nob.example.easyapp.service;

import org.springframework.stereotype.Service;

import nob.example.easyapp.service.model.AuthInModel;
import nob.example.easyapp.service.model.AuthOutModel;

/**
 * 認証サービスのインターフェースです。
 *
 * @author nob
 */
@Service
public interface AuthService {

    /**
     * 認証処理を行います。
     *
     * @param inModel 認証情報
     * @return 認証結果
     */
    AuthOutModel login(AuthInModel inModel);
}
```

#### service/impl/AuthServiceImpl.java

サービスを実装します。アプリの業務処理はこのクラスで行います。

```java
package nob.example.easyapp.service.impl;

import org.springframework.stereotype.Service;

import lombok.NonNull;
import nob.example.easyapp.repository.UsersRepository;
import nob.example.easyapp.service.AuthService;
import nob.example.easyapp.service.model.AuthInModel;
import nob.example.easyapp.service.model.AuthOutModel;

/**
 * AuthServiceの実装クラスです。
 *
 * @author nob
 */
@Service
public class AuthServiceImpl implements AuthService {

    @NonNull
    private UsersRepository usersRepository;

    public AuthServiceImpl(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Override
    public AuthOutModel login(AuthInModel inModel) {

        return new AuthOutModel(
                usersRepository.findByName(inModel.getName()).getPassword().equals(inModel.getPassword()));
    }
}
```

#### service/model/

業務処理を担うクラスの入力モデル・出力モデルを定義します。

```java
package nob.example.easyapp.service.model;

import lombok.Value;

/**
 * 認証向けの入力モデルです。
 *
 * @author nob
 */
@Value
public class AuthInModel {

    /** ユーザ名 */
    private String name;

    /** パスワード */
    private String password;
}
```

```java
package nob.example.easyapp.service.model;

import lombok.Value;

/**
 * 認証向けの出力モデルです。
 *
 * @author nob
 */
@Value
public class AuthOutModel {

    /** 認証可否 */
    private boolean valid;
}
```

#### controller/AuthController.java

API のインターフェースを定義します。

```java
package nob.example.easyapp.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nob.example.easyapp.controller.model.AuthRequest;
import nob.example.easyapp.controller.model.AuthResponse;

/**
 * 認証コントローラーのインターフェースです。
 *
 * @author nob
 */
@RestController
@RequestMapping(value = "/api/v1")
public interface AuthController {

    /**
     * 認証処理を呼び出します。
     *
     * @param request 認証リクエスト
     * @return 認証結果
     */
    @PostMapping(value = "/login")
    AuthResponse login(@RequestBody AuthRequest request);
}
```

#### controller/impl/AuthControllerImpl.java

コントローラーを実装します。ここでは業務処理を実装せず、サービスを呼び出すことに専念します。

```java
package nob.example.easyapp.controller.impl;

import org.springframework.web.bind.annotation.RestController;

import lombok.NonNull;
import nob.example.easyapp.controller.AuthController;
import nob.example.easyapp.controller.model.AuthRequest;
import nob.example.easyapp.controller.model.AuthResponse;
import nob.example.easyapp.service.AuthService;
import nob.example.easyapp.service.model.AuthInModel;
import nob.example.easyapp.service.model.AuthOutModel;

/**
 * AuthControllerの実装クラスです。
 *
 * @author nob
 */
@RestController
public class AuthControllerImpl implements AuthController {

    @NonNull
    private AuthService authService;

    public AuthControllerImpl(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public AuthResponse login(AuthRequest request) {

        AuthOutModel outModel = authService.login(new AuthInModel(request.getName(), request.getPassword()));

        return new AuthResponse(outModel.isValid());
    }
}
```

#### controller/model/

コントローラーのリクエストモデル・レスポンスモデルを定義します。

```java
package nob.example.easyapp.controller.model;

import lombok.Value;

/**
 * 認証向けのリクエストモデルです。
 *
 * @author nob
 */
@Value
public class AuthRequest {

    /** ユーザ名 */
    private String name;

    /** パスワード */
    private String password;
}
```

```java
package nob.example.easyapp.controller.model;

import lombok.Value;

/**
 * 認証向けのレスポンスモデルです。
 *
 * @author nob
 */
@Value
public class AuthResponse {

    /** 認証可否 */
    private boolean valid;
}
```

## 起動

VSCode の **Run Java** などからアプリを起動します。下記コマンドで API を打鍵できます。

```shell
curl -X POST -H 'Content-Type: application/json' -d '{"name": "nob", "password": "passwd"}' localhost:8080/api/v1/login
```
