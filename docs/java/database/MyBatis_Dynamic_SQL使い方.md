# MyBatis Dynamic SQL使い方

[MyBatis Dynamic SQL](https://mybatis.org/mybatis-dynamic-sql/docs/introduction.html)を使って動的にSQLを発行します。

## 前提

下記DDLで作成されるテーブルにアクセスします:

```sql
-- テーブル作成
CREATE TABLE users(
    user_id int PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age int NOT NULL
    , address TEXT
);

-- テストデータ
INSERT INTO users(
    user_name
    , age
    , address
) VALUES (
    'nob'
    , 13
    , 'This is a test address'
);
```

## 事前準備

- `application.properties`に接続情報を記載します:

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

- 依存関係を`pom.xml`に記載します:

```xml
		<!-- https://mvnrepository.com/artifact/org.mybatis.dynamic-sql/mybatis-dynamic-sql -->
		<dependency>
			<groupId>org.mybatis.dynamic-sql</groupId>
			<artifactId>mybatis-dynamic-sql</artifactId>
			<version>1.5.2</version>
		</dependency>
		<dependency>
			<groupId>org.mybatis</groupId>
			<artifactId>mybatis</artifactId>
			<version>3.5.19</version>
		</dependency>
		<dependency>
			<groupId>org.mybatis</groupId>
			<artifactId>mybatis-spring</artifactId>
			<version>4.0.0</version>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-jdbc</artifactId>
		</dependency>
		<dependency>
			<groupId>org.mariadb.jdbc</groupId>
			<artifactId>mariadb-java-client</artifactId>
		</dependency>
```

- MyBatisのコンフィグクラスを作成します:

```java
package nob.example.easyapp.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis関連のコンフィグクラスです。
 *
 * @author nob
 */
@Configuration
@MapperScan(basePackages = "nob.example.easyapp.domain.mapper") // mapperパッケージ配下をスキャン
public class MyBatisConfig {

    @Bean
    SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        final SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);

        return sessionFactory.getObject();
    }
}
```

## 実装例

- テーブル定義に対応するエンティティクラスを作成します:

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

- mapperパッケージに、`sqlSupport`クラスおよび`mapper`クラスを作成します:

```java
package nob.example.easyapp.domain.mapper;

import java.sql.JDBCType;

import org.mybatis.dynamic.sql.SqlColumn;
import org.mybatis.dynamic.sql.SqlTable;

/**
 * usersテーブルのsqlSupportクラスです。
 *
 * @author nob
 */
public class UsersDynamicSqlSupport {

    public static final Users users = new Users();

    public static final SqlColumn<Integer> userId = users.userId;
    public static final SqlColumn<String> userName = users.userName;
    public static final SqlColumn<String> age = users.age;
    public static final SqlColumn<String> address = users.address;

    public static final class Users extends SqlTable {

        public final SqlColumn<Integer> userId = column("user_id", JDBCType.INTEGER);
        public final SqlColumn<String> userName = column("user_name", JDBCType.VARCHAR);
        public final SqlColumn<String> age = column("age", JDBCType.VARCHAR);
        public final SqlColumn<String> address = column("address", JDBCType.VARCHAR);

        public Users() {
            super("users");
        }
    }
}
```

```java
package nob.example.easyapp.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.InsertProvider;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.mybatis.dynamic.sql.insert.render.InsertStatementProvider;
import org.mybatis.dynamic.sql.select.render.SelectStatementProvider;
import org.mybatis.dynamic.sql.util.SqlProviderAdapter;

import nob.example.easyapp.domain.entity.Users;

/**
 * usersテーブルのmapperクラスです。
 *
 * @author nob
 */
@Mapper
public interface UsersMapper {

    /**
     * select
     *
     * @param selectStatement
     * @return
     */
    @SelectProvider(type = SqlProviderAdapter.class, method = "select")
    @Results(id = "usersResult", value = {
            @Result(column = "user_id", property = "userId"),
            @Result(column = "user_name", property = "userName"),
            @Result(column = "age", property = "age"),
            @Result(column = "address", property = "address"),
    })
    List<Users> select(SelectStatementProvider selectStatement);

    /**
     * insert
     *
     * @param insertStatement
     * @return
     */
    @InsertProvider(type = SqlProviderAdapter.class, method = "insert")
    int insert(InsertStatementProvider<Users> insertStatement);
}
```

- repositoryインターフェースおよび実装を作成します:

```java
package nob.example.easyapp.repository;

import java.util.List;

import nob.example.easyapp.domain.entity.Users;

/**
 * usersテーブルのrepositoryクラスです。
 *
 * @author nob
 */
public interface UsersRepository {

    /**
     * ユーザを検索します。
     *
     * @param condition
     * @return 検索結果
     */
    public List<Users> selectByCondition(Integer userId, String userName);

    /**
     * ユーザを登録します。
     *
     * @param users
     */
    public void insert(Users users);
}
```

```java
package nob.example.easyapp.repository.impl;

import java.util.List;

import org.mybatis.dynamic.sql.SqlBuilder;
import org.mybatis.dynamic.sql.insert.render.InsertStatementProvider;
import org.mybatis.dynamic.sql.render.RenderingStrategies;
import org.mybatis.dynamic.sql.select.render.SelectStatementProvider;
import org.springframework.stereotype.Repository;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import nob.example.easyapp.domain.entity.Users;
import nob.example.easyapp.domain.mapper.UsersDynamicSqlSupport;
import nob.example.easyapp.domain.mapper.UsersMapper;
import nob.example.easyapp.repository.UsersRepository;

/**
 * UsersRepositoryの実装です。
 *
 * @author nob
 */
@Repository
@RequiredArgsConstructor
public class UsersRepositoryImpl implements UsersRepository {

    @NonNull
    private UsersMapper usersMapper;

    @Override
    public List<Users> selectByCondition(Integer userId, String userName) {

        SelectStatementProvider selectStatement = SqlBuilder.select(UsersDynamicSqlSupport.users.allColumns())
                .from(UsersDynamicSqlSupport.users)
                .where(UsersDynamicSqlSupport.users.userName, SqlBuilder.isEqualToWhenPresent(userName))
                .and(UsersDynamicSqlSupport.users.userId, SqlBuilder.isEqualToWhenPresent(userId))
                .build()
                .render(RenderingStrategies.MYBATIS3);

        return usersMapper.select(selectStatement);
    }

    @Override
    public void insert(Users users) {

        InsertStatementProvider<Users> insertStatement = SqlBuilder.insert(users)
                .into(UsersDynamicSqlSupport.users)
                .map(UsersDynamicSqlSupport.userId).toProperty("userId")
                .map(UsersDynamicSqlSupport.userName).toProperty("userName")
                .map(UsersDynamicSqlSupport.age).toProperty("age")
                .map(UsersDynamicSqlSupport.address).toProperty("address")
                .build()
                .render(RenderingStrategies.MYBATIS3);

        usersMapper.insert(insertStatement);
    }
}
```

## テスト例

H2DBを使ってテストします。

- h2dbの依存関係を追記します:

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

- `src/test/resources/application-test.properties`を下記内容で作成します:

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

- `src/test/resources/users/schema.sql`および`src/test/resources/users/data.sql`を下記要領で作成します:

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

- 下記要領でテストクラスを作成します:

```java
package nob.example.easyapp.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import nob.example.easyapp.domain.entity.Users;

/**
 * UsersRepositoryのテストクラスです。
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
    private UsersRepository usersRepository;

    /**
     * テスト
     */
    @Test
    void test_findByUserId() {

        try {
            List<Users> u = usersRepository.selectByCondition(1, "test_nob");
            assertEquals(1, u.size());
            assertEquals(1, u.get(0).getUserId());
            assertEquals("test_nob", u.get(0).getUserName());
            assertEquals(13, u.get(0).getAge());
            assertEquals("test address01", u.get(0).getAddress());
        } catch (Exception e) {
            e.printStackTrace();
            fail();
        }
    }
}
```
