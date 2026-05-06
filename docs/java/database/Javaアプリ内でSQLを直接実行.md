# Javaアプリ内でSQLを直接実行

repositoryなどではなく、SQLコマンドをベタ書きして実行します。

## 実装

### `pom.xml`

```xml
        <!-- h2db導入 -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>
```

### `domain/entity/Users.java`

```java
package nob.example.easyapp.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * usersテーブルのentityクラスです。
 *
 * @author nob
 */
@Getter
@AllArgsConstructor
public class Users {

    /** ユーザID */
    private Integer userId;

    /** ユーザ名 */
    private String userName;

    /** 年齢 */
    private Integer age;

    /** 住所 */
    private String address;
}
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
    'test_nob01'
    , 13
    , 'test address01'
), (
    'test_nob02'
    , 14
    , 'test address02'
), (
    'test_nob03'
    , 15
    , 'test address03'
);
```

## テスト

### `repository/impl/UsersRepositoryImplTest.java`

```java
package nob.example.easyapp.repository.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import nob.example.easyapp.domain.entity.Users;

/**
 * SQLを実行するサンプルテストクラスです。
 *
 * @author nob
 */
@SpringBootTest
@ActiveProfiles("test") // application-test.properties読み込み
@TestPropertySource(properties = {
        "spring.sql.init.schema-locations=classpath:/users/schema.sql", // テーブル作成SQLのパス
        "spring.sql.init.data-locations=classpath:/users/data.sql" // データ投入SQLのパス
})
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD) // テストごとにDBをリセット
public class UsersRepositoryImplTest {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void test() throws Exception {

        String query = "SELECT user_id, user_name, age, address FROM users";

        List<Users> u = jdbcTemplate.query(query, (rs, rowNum) -> {
            return new Users(
                    rs.getInt("user_id"),
                    rs.getString("user_name"),
                    rs.getInt("age"),
                    rs.getString("address"));
        });

        assertThat(u)
                .hasSize(3)
                .usingRecursiveFieldByFieldElementComparator()
                .containsExactly(
                        new Users(1, "test_nob01", 13, "test address01"),
                        new Users(2, "test_nob02", 14, "test address02"),
                        new Users(3, "test_nob03", 15, "test address03"));
    }
}
```
