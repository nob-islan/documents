# Spring Boot プロジェクトセットアップ

Spring Boot で実装する REST API のプロジェクトの初期セットアップ方法について記載します。

## プロジェクト作成

cf. https://docs.spring.io/initializr/docs/0.9.1/reference/html/#command-line

- [Spring initializer](https://start.spring.io/) を使ってプロジェクトを新規作成します。

```shell
curl https://start.spring.io/starter.zip \
  -d javaVersion=21 \
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
  eadb:
    image: mariadb:latest
    container_name: eadb
    ports:
      - 3306:3306
    volumes:
      - ./volumes/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

#### volumes/initdb.d/create-database.sql

```sql
CREATE DATABASE eadb;
USE eadb;

CREATE TABLE users (
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32)
    , age INT
);

INSERT INTO users (
    name
    , password
    , age
) VALUES (
    'nob'
    , 'passwd'
    , 13
);
```

#### src/main/resources/application.properties

```shell
#MariaDBのドライバ設定
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
#接続用URL
spring.datasource.url=jdbc:mariadb://localhost/eadb
#ユーザ名
spring.datasource.username=root
#パスワード
spring.datasource.password=password
```

### ディレクトリ構成

作成が必要なもののみ記載しています。

```shell
.
├── controller                       # APIとしてのインターフェース
│   ├── AuthController.java
│   ├── impl                         # APIの実装
│   │   └── AuthControllerImpl.java
│   └── model                        # APIのリクエスト・レスポンスモデル
│       ├── LoginRequest.java
│       ├── LoginResponse.java
│       ├── MeRequest.java
│       └── MeResponse.java
├── repository                       # データベース操作のインターフェース
│   ├── entity                       # データベースのテーブル定義に対応するエンティティ
│   │   └── Users.java
│   └── UsersRepository.java
└── service                          # 業務処理のインターフェース
    ├── AuthService.java
    ├── impl                         # 業務処理の実装
    │   └── AuthServiceImpl.java
    └── model                        # 業務処理の入力・出力モデル
        ├── LoginInModel.java
        ├── LoginOutModel.java
        ├── MeInModel.java
        └── MeOutModel.java
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

    /** 年齢 */
    @Column(name = "age", nullable = false)
    private Integer age;
}
```

#### service/AuthService.java

業務処理を担うクラスのインターフェースを定義します。

```java
package nob.example.easyapp.service;

import org.springframework.stereotype.Service;

import nob.example.easyapp.service.model.LoginInModel;
import nob.example.easyapp.service.model.LoginOutModel;
import nob.example.easyapp.service.model.MeInModel;
import nob.example.easyapp.service.model.MeOutModel;

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
    LoginOutModel login(LoginInModel inModel);

    /**
     * ユーザ情報を取得します。
     *
     * @param inModel ユーザ情報検索条件
     * @return ユーザ情報
     */
    MeOutModel me(MeInModel inModel);
}
```

#### service/impl/AuthServiceImpl.java

サービスを実装します。アプリの業務処理はこのクラスで行います。

```java
package nob.example.easyapp.service.impl;

import org.springframework.stereotype.Service;

import lombok.NonNull;
import nob.example.easyapp.repository.UsersRepository;
import nob.example.easyapp.repository.entity.Users;
import nob.example.easyapp.service.AuthService;
import nob.example.easyapp.service.model.LoginInModel;
import nob.example.easyapp.service.model.LoginOutModel;
import nob.example.easyapp.service.model.MeInModel;
import nob.example.easyapp.service.model.MeOutModel;

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
    public LoginOutModel login(LoginInModel inModel) {

        return new LoginOutModel(
                usersRepository.findByName(inModel.getName()).getPassword().equals(inModel.getPassword()));
    }

    @Override
    public MeOutModel me(MeInModel inModel) {

        Users users = usersRepository.findByName("nob");
        return new MeOutModel(users.getName(), users.getAge());
    }
}
```

#### service/model/LoginInModel.java

業務処理を担うクラスの入力モデルを定義します。

```java
package nob.example.easyapp.service.model;

import lombok.Value;

/**
 * 認証向けの入力モデルです。
 *
 * @author nob
 */
@Value
public class LoginInModel {

    /** ユーザ名 */
    private String name;

    /** パスワード */
    private String password;
}
```

#### service/model/LoginOutModel.java

業務処理を担うクラスの出力モデルを定義します。

```java
package nob.example.easyapp.service.model;

import lombok.Value;

/**
 * 認証向けの出力モデルです。
 *
 * @author nob
 */
@Value
public class LoginOutModel {

    /** 認証可否 */
    private boolean valid;
}
```

#### service/model/MeInModel.java

```java
package nob.example.easyapp.service.model;

import lombok.Value;

/**
 * ユーザ情報取得向けの入力モデルです。
 *
 * @author nob
 */
@Value
public class MeInModel {

    /** ユーザ名 */
    private String name;
}
```

#### service/model/MeOutModel.java

```java
package nob.example.easyapp.service.model;

import lombok.Value;

/**
 * ユーザ情報取得向けの出力モデルです。
 *
 * @author nob
 */
@Value
public class MeOutModel {

    /** ユーザ名 */
    private String name;

    /** 年齢 */
    private Integer age;
}
```

#### controller/AuthController.java

API のインターフェースを定義します。

```java
package nob.example.easyapp.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nob.example.easyapp.controller.model.LoginRequest;
import nob.example.easyapp.controller.model.LoginResponse;
import nob.example.easyapp.controller.model.MeRequest;
import nob.example.easyapp.controller.model.MeResponse;

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
    LoginResponse login(@RequestBody LoginRequest request);

    /**
     * ユーザ情報取得処理を呼び出します。
     *
     * @param request ユーザ情報取得リクエスト
     * @return ユーザ情報
     */
    @GetMapping(value = "/me")
    MeResponse me(MeRequest request);
}
```

#### controller/impl/AuthControllerImpl.java

コントローラーを実装します。ここでは業務処理を実装せず、サービスを呼び出すことに専念します。

```java
package nob.example.easyapp.controller.impl;

import org.springframework.web.bind.annotation.RestController;

import lombok.NonNull;
import nob.example.easyapp.controller.AuthController;
import nob.example.easyapp.controller.model.LoginRequest;
import nob.example.easyapp.controller.model.LoginResponse;
import nob.example.easyapp.controller.model.MeRequest;
import nob.example.easyapp.controller.model.MeResponse;
import nob.example.easyapp.service.AuthService;
import nob.example.easyapp.service.model.LoginInModel;
import nob.example.easyapp.service.model.MeInModel;
import nob.example.easyapp.service.model.MeOutModel;

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
    public LoginResponse login(LoginRequest request) {

        return new LoginResponse(
                authService.login(new LoginInModel(request.getName(), request.getPassword())).isValid());
    }

    @Override
    public MeResponse me(MeRequest request) {

        MeOutModel meOutModel = authService.me(new MeInModel(request.getName()));
        return new MeResponse(meOutModel.getName(), meOutModel.getAge());
    }
}
```

#### controller/model/LoginRequest.java

コントローラーのリクエストモデルを定義します。

```java
package nob.example.easyapp.controller.model;

import lombok.Value;

/**
 * 認証向けのリクエストモデルです。
 *
 * @author nob
 */
@Value
public class LoginRequest {

    /** ユーザ名 */
    private String name;

    /** パスワード */
    private String password;
}
```

#### controller/model/LoginResponse.java

コントローラーのレスポンスモデルを定義します。

```java
package nob.example.easyapp.controller.model;

import lombok.Value;

/**
 * 認証向けのレスポンスモデルです。
 *
 * @author nob
 */
@Value
public class LoginResponse {

    /** 認証可否 */
    private boolean valid;
}
```

#### controller/model/MeRequest.java

```java
package nob.example.easyapp.controller.model;

import lombok.Value;

/**
 * ユーザ情報取得向けのリクエストモデルです。
 *
 * @author nob
 */
@Value
public class MeRequest {

    /** ユーザ名 */
    private String name;
}
```

#### controller/model/MeResponse.java

```java
package nob.example.easyapp.controller.model;

import lombok.Value;

/**
 * ユーザ情報取得向けのレスポンスモデルです。
 *
 * @author nob
 */
@Value
public class MeResponse {

    /** ユーザ名 */
    private String name;

    /** 年齢 */
    private Integer age;
}
```

## 起動

下記コマンドでアプリを起動します。

```shell
./mvnw spring-boot:run
```

下記コマンドで API を打鍵できます。

```shell
# /login
curl -X POST -H 'Content-Type: application/json' -d '{"name": "nob", "password": "passwd"}' localhost:8080/api/v1/login
# /me
curl -X GET localhost:8080/api/v1/me?name=nob
```
