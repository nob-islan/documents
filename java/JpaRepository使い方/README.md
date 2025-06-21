# JpaRepository 使い方

`JpaRepository`を使うことで、インターフェースにメソッドを宣言するだけで SQL を実行する処理を実装できます。本ドキュメントで、JpaRepository の導入方法および実装例を解説します。

## 実装例

- `pom.xml`に下記を追記します:

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

see also; https://docs.spring.io/spring-data/jpa/reference/jpa/query-methods.html

- 下記で構築されるテーブルを想定して実装を進めます:

```sql
CREATE TABLE IF NOT EXISTS users(
    user_id int PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age int NOT NULL
    , address TEXT
);
```

- テーブル定義に対応するエンティティを用意します:

```java
package com.example.easyapp.repository.entity;

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
    @Column(name = "user_id", length = 11, nullable = false)
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

- 下記の要領で repository インターフェースを作成します:

```java
package com.example.easyapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.easyapp.repository.entity.Users;
import java.util.List;

/**
 * usersテーブル向けのrepositoryインターフェースです。
 */
@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {

    /**
     * SELECT * FROM users WHERE user_id = ?1
     */
    List<Users> findByUserId(Integer userId);

    /**
     * SELECT * FROM users WHERE address LIKE ?1
     *
     * address に対して LIKE %address% にあたる挙動をします。
     * 類似の検索として 前方一致: StartingWith, 後方一致: EndingWith をメソッド名に付与します。
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

H2DB を使ってテストします。

- h2db の依存関係を追記します:

```xml
        <!-- h2db導入 -->
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
			<scope>test</scope>
		</dependency>
```

- `src/test/resources/application-test.properties`を下記内容で作成します:

```properties
# エンティティクラスからスキーマを自動生成しない
spring.jpa.hibernate.ddl-auto=none
# h2db接続設定
spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
```

- 下記要領でテストクラスを作成します:

```java
package com.example.easyapp.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import com.example.easyapp.model.entity.Users;

/**
 * SampleRepositoryのテストクラスです。
 *
 * @author nob
 */
@DataJpaTest
@ActiveProfiles("test") // application-test.properties読み込み
@TestPropertySource(properties = {
        "spring.sql.init.schema-locations=classpath:/samplerepository/schema.sql", // テーブル作成SQLのパス
        "spring.sql.init.data-locations=classpath:/samplerepository/data.sql" // データ投入SQLのパス
})
public class SampleRepositoryTest {

    @Autowired
    private SampleRepository sampleRepository;

    /**
     * テスト
     */
    @Test
    void test() {

        // テストケース
    }
}
```

- `src/test/resources/schema.sql`および`src/test/resources/data.sql`は下記要領で作成します:

```sql
-- schema.sql
CREATE TABLE users(
    user_id INT PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age INT NOT NULL
    , address TEXT
);
```

```sql
-- data.sql
INSERT INTO users(
    user_name
    , age
    , remarks
) VALUES (
    'test_nob'
    , 13
    , 'test address01'
);
```
