# JpaRepository使い方

`JpaRepository`を使うことで、インターフェースにメソッドを宣言するだけでSQLを実行する処理を実装できます。本ドキュメントで、JpaRepositoryの導入方法および実装例を解説します。

cf. https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html

## 事前準備

下記で構築されるテーブルを想定して実装を進めます:

```sql
CREATE TABLE IF NOT EXISTS users(
    user_id int PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age int NOT NULL
    , address TEXT
);
```

### `application.properties`

```shell
spring.application.name=easyapp

#MariaDBのドライバ設定
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
#接続用URL
spring.datasource.url=jdbc:mariadb://localhost/eadb
#ユーザ名
spring.datasource.username=root
#パスワード
spring.datasource.password=password
```

### `pom.xml`

```xml
        <!-- JpaRepository導入 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <!-- MariaDB接続 -->
        <dependency>
            <groupId>org.mariadb.jdbc</groupId>
            <artifactId>mariadb-java-client</artifactId>
        </dependency>
```

## 実装

### `domain/entity/Users.java`

```java
package nob.example.easyapp.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * usersテーブルのentityクラスです。
 *
 * @author nob
 */
@Table(name = "users")
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Users {

    /** ユーザID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    /** ユーザ名 */
    @Column(name = "user_name", length = 20, nullable = false)
    private String userName;

    /** 年齢 */
    @Column(name = "age", nullable = false)
    private Integer age;

    /** 住所 */
    @Column(name = "address", nullable = true)
    private String address;
}
```

### `repository/UsersRepository.java`

```java
package nob.example.easyapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import nob.example.easyapp.domain.entity.Users;
import java.util.List;

/**
 * usersテーブル向けのrepositoryインターフェースです。
 *
 * @author nob
 */
public interface UsersRepository extends JpaRepository<Users, Integer> {

    /**
     * SELECT * FROM users WHERE user_id = ?1
     */
    List<Users> findByUserId(Integer userId);

    /**
     * SELECT * FROM users WHERE address LIKE ?1
     *
     * addressに対してLIKE %address% にあたる挙動をします。
     * 類似の検索として 前方一致: StartingWith, 後方一致: EndingWithをメソッド名に付与します。
     * 前方、後方、部分一致を使い分けたい場合はLikeを使ってください。
     */
    List<Users> findByAddressContaining(String address);

    /**
     * SELECT * FROM users WHERE user_name LIKE ?1 AND address LIKE ?2
     *
     * 例えばaddressを空文字とすることでuser_nameのみをキーとして検索することができます。
     */
    List<Users> findByUserNameContainingAndAddressContaining(String userName, String address);
}
```

## テスト例

H2DBを使ってテストします。

### `pom.xml`

```xml
        <!-- h2db導入 -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
		<!-- Jpa Test導入 -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-data-jpa-test</artifactId>
			<scope>compile</scope>
		</dependency>
```

### `test/resources/application-test.properties`

```shell
# エンティティクラスからスキーマを自動生成しない
spring.jpa.hibernate.ddl-auto=none
# h2db接続設定
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

### `test/resources/users/schema.sql`

```sql
-- schema.sql
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users(
    user_id int PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age int NOT NULL
    , address TEXT
);
```

### `test/resources/users/data.sql`

```sql
-- data.sql
INSERT INTO users(
    user_name
    , age
    , address
) VALUES (
    'test_nob'
    , 13
    , 'test address01'
);
```

### `repository/UsersRepositoryTest.java`

```java
package nob.example.easyapp.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import nob.example.easyapp.domain.entity.Users;

/**
 * UsersRepositoryのテストクラスです。
 *
 * @author nob
 */
@DataJpaTest
@ActiveProfiles("test") // application-test.properties読み込み
@TestPropertySource(properties = {
        "spring.sql.init.schema-locations=classpath:/users/schema.sql", // テーブル作成SQLのパス
        "spring.sql.init.data-locations=classpath:/users/data.sql" // データ投入SQLのパス
})
public class UsersRepositoryTest {

    @Autowired
    private UsersRepository usersRepository;

    /**
     * テスト
     */
    @Test
    void testFindByUserId() {

        List<Users> u = usersRepository.findByUserId(1);
        assertThat(u).hasSize(1).usingRecursiveFieldByFieldElementComparator()
                .containsExactly(new Users(1, "test_nob", 13, "test address01"));
    }
}
```
