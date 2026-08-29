# Spring Bootプロジェクトセットアップ

Kotlin + Spring Bootで実装するREST APIのプロジェクトの初期セットアップ方法について記載します。

cf. https://spring.io/guides/tutorials/spring-boot-kotlin

## プロジェクト作成

- [Spring initializer](https://start.spring.io/)を使ってプロジェクトを新規作成します。

```shell
curl https://start.spring.io/starter.zip \
  -d javaVersion=21 \
  -d dependencies=web,data-jpa,mariadb \
  -d type=maven-project \
  -d language=kotlin \
  -d name=easyapp \
  -d groupId=nob.example \
  -d artifactId=easyapp \
  -o easyapp.zip
```

- zipを解凍します。

```shell
unzip easyapp.zip && rm -rf easyapp.zip
```

- `pom.xml`の下記警告が出ている場合は下記設定を追加します:

> Plugin execution not covered by lifecycle configuration: org.jetbrains.kotlin:kotlin-maven-plugin:2.3.21:compile (execution: compile, phase: compile)

```xml
	<build>
		<pluginManagement>
			<plugins>
				<plugin>
					<groupId>org.eclipse.m2e</groupId>
					<artifactId>lifecycle-mapping</artifactId>
					<version>1.0.0</version>
					<configuration>
						<lifecycleMappingMetadata>
							<pluginExecutions>
								<pluginExecution>
									<pluginExecutionFilter>
										<groupId>org.jetbrains.kotlin</groupId>
										<artifactId>kotlin-maven-plugin</artifactId>
										<versionRange>[${kotlin.version},)</versionRange>
										<goals>
											<goal>compile</goal>
											<goal>test-compile</goal>
										</goals>
									</pluginExecutionFilter>
									<action>
										<ignore/>
									</action>
								</pluginExecution>
							</pluginExecutions>
						</lifecycleMappingMetadata>
					</configuration>
				</plugin>
			</plugins>
		</pluginManagement>
	</build>
```

## 実装

擬似的なログインAPIを実装します。

### 事前準備

データベースをdockerで構築し、Kotlinプロジェクト側に接続情報を記載します。

#### `docker-compose.yaml`

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

#### `volumes/initdb.d/create-database.sql`

```sql
CREATE DATABASE eadb;

CREATE TABLE eadb.users (
    name VARCHAR(8) PRIMARY KEY
    , password VARCHAR(32) NOT NULL
    , age INT NOT NULL
);

INSERT INTO eadb.users (
    name
    , password
    , age
) VALUES (
    'nob'
    , 'passwd'
    , 13
);

CREATE USER eadbuser;

GRANT ALL ON eadb.* TO eadbuser@'%' IDENTIFIED BY 'eadbpass';
```

#### `src/main/resources/application.properties`

```shell
spring.application.name=easyapp

# MariaDBのドライバ設定
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
# 接続用URL
spring.datasource.url=jdbc:mariadb://localhost/eadb
# ユーザ名
spring.datasource.username=eadbuser
# パスワード
spring.datasource.password=eadbpass
```

### クラス一覧

#### `domain/entity/Users.kt`

データベースのテーブル定義に対応するエンティティを定義します。

```kotlin
package nob.example.easyapp.domain.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table

@Table(name = "users")
@Entity
class Users(

    /**
     * ユーザ名
     */
    @Id
    @Column(name = "name", length = 8, nullable = false)
    val name: String,

    /**
     * パスワード
     */
    @Column(name = "password", length = 32, nullable = false)
    val password: String,

    /**
     * 年齢
     */
    @Column(name = "age", nullable = false)
    val age: Int
)
```

#### `repository/UsersRepository.kt`

データベースにアクセスするrepositoryインターフェースを定義します。JpaRepositoryによって実装が自動生成されます。

```kotlin
package nob.example.easyapp.repository

import nob.example.easyapp.domain.entity.Users
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

/**
 * usersテーブル向けrepositoryのインターフェースです。
 */
@Repository
interface UsersRepository : JpaRepository<Users, String> {

    /**
     * ユーザ情報を取得します。
     */
    fun findByName(name: String): Users?
}
```

#### `service/AuthService.kt`

業務処理を担うクラスのインターフェースを定義します。

```kotlin
package nob.example.easyapp.service

import nob.example.easyapp.service.model.LoginInModel
import nob.example.easyapp.service.model.LoginOutModel
import nob.example.easyapp.service.model.GetUserInModel
import nob.example.easyapp.service.model.GetUserOutModel

/**
 * 認証サービスのインターフェースです。
 */
interface AuthService {

    /**
     * 認証処理を行います。
     */
    fun login(inModel: LoginInModel): LoginOutModel

    /**
     * ユーザ情報を取得します。
     */
    fun getUser(inModel: GetUserInModel): GetUserOutModel
}
```

#### `service/impl/AuthServiceImpl.kt`

サービスを実装します。アプリの業務処理はこのクラスで行います。

```kotlin
package nob.example.easyapp.service.impl

import nob.example.easyapp.repository.UsersRepository
import nob.example.easyapp.service.AuthService
import nob.example.easyapp.service.model.LoginInModel
import nob.example.easyapp.service.model.LoginOutModel
import nob.example.easyapp.service.model.GetUserInModel
import nob.example.easyapp.service.model.GetUserOutModel
import org.springframework.stereotype.Service

/**
 * AuthServiceの実装です。
 */
@Service
class AuthServiceImpl(private val usersRepository: UsersRepository) : AuthService {

    override fun login(inModel: LoginInModel): LoginOutModel {

        val users = usersRepository.findByName(inModel.name) ?: return LoginOutModel(false)

        return LoginOutModel(users.password == inModel.password)
    }

    override fun getUser(inModel: GetUserInModel): GetUserOutModel {

        val users = usersRepository.findByName(inModel.name) ?: return GetUserOutModel("Unknown user", 0)

        return GetUserOutModel(users.name, users.age)
    }
}
```

#### `service/model/AuthModel.kt`

各種業務処理の入力・出力モデルを定義します。

```kotlin
package nob.example.easyapp.service.model

/**
 * 認証向けの入力モデルです。
 */
data class LoginInModel(

    /**
     * ユーザ名
     */
    val name: String,

    /**
     * パスワード
     */
    val password: String
)

/**
 * 認証向けの出力モデルです。
 */
data class LoginOutModel(

    /**
     * 認証可否
     */
    val valid: Boolean
)

/**
 * ユーザ情報取得向けの入力モデルです。
 */
data class GetUserInModel(

    /**
     * ユーザ名
     */
    val name: String
)

/**
 * ユーザ情報取得向けの出力モデルです。
 */
data class GetUserOutModel(

    /**
     * ユーザ名
     */
    val name: String,

    /**
     * 年齢
     */
    val age: Int
)
```

#### `controller/AuthController.kt`

APIとしての外部契約を定義します。

```kotlin
package nob.example.easyapp.controller

import nob.example.easyapp.controller.model.LoginRequest
import nob.example.easyapp.controller.model.LoginResponse
import nob.example.easyapp.controller.model.GetUserRequest
import nob.example.easyapp.controller.model.GetUserResponse
import nob.example.easyapp.service.AuthService
import nob.example.easyapp.service.model.LoginInModel
import nob.example.easyapp.service.model.GetUserInModel
import org.springframework.web.bind.annotation.*

/**
 * 認証コントローラーです。
 */
@RestController
@RequestMapping("/api/v1")
class AuthController(private val authService: AuthService) {

    /**
     * 認証処理を呼び出します。
     */
    @PostMapping("/login")
    fun login(@RequestBody req: LoginRequest): LoginResponse {
        return LoginResponse(authService.login(LoginInModel(req.name, req.password)).valid)
    }

    /**
     * ユーザ情報取得処理を呼び出します。
     */
    @GetMapping("/users")
    fun getUser(req: GetUserRequest): GetUserResponse {
        val out = authService.getUser(GetUserInModel(req.name))
        return GetUserResponse(out.name, out.age)
    }
}
```

#### `controller/model/AuthModel.kt`

各種APIのリクエスト・レスポンスモデルを定義します。

```kotlin
package nob.example.easyapp.controller.model

/**
 * 認証向けのリクエストモデルです。
 */
data class LoginRequest(

    /**
     * ユーザ名
     */
    val name: String,

    /**
     * パスワード
     */
    val password: String
)

/**
 * 認証向けのレスポンスモデルです。
 */
data class LoginResponse(

    /**
     * 認証可否
     */
    val valid: Boolean
)

/**
 * ユーザ情報取得向けのリクエストモデルです。
 */
data class GetUserRequest(

    /**
     * ユーザ名
     */
    val name: String
)

/**
 * ユーザ情報取得向けのレスポンスモデルです。
 */
data class GetUserResponse(

    /**
     * ユーザ名
     */
    val name: String,

    /**
     * 年齢
     */
    val age: Int
)
```

## 起動

下記コマンドでアプリを起動します。

```shell
./mvnw spring-boot:run
```

下記コマンドでAPIを打鍵できます。

```shell
# /login
curl -X POST -H 'Content-Type: application/json' -d '{"name": "nob", "password": "passwd"}' localhost:8080/api/v1/login
# /users
curl -X GET localhost:8080/api/v1/users?name=nob
```
