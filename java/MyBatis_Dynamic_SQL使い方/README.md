# MyBatis Dynamic SQL 使い方

**MyBatis Dynamic SQL**を使って動的に SQL を発行します。

## 前提

下記 DDL で作成されるテーブルにアクセスします:

```sql
-- テーブル作成
CREATE TABLE users(
    user_id int PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age int NOT NULL
    , remarks TEXT
);

-- テストデータ
INSERT INTO users(
    user_name
    , age
    , remarks
) VALUES (
    'nob'
    , 13
    , 'This is a test data'
);
```

## 事前準備

- `application.properties`に接続情報を記載します:

```properties
#MariaDBのドライバ設定
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
#接続用URL
spring.datasource.url=jdbc:mariadb://localhost/snaildb
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
			<version>3.5.16</version>
		</dependency>
		<dependency>
			<groupId>org.mybatis</groupId>
			<artifactId>mybatis-spring</artifactId>
			<version>3.0.3</version>
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

- MyBatis のコンフィグクラスを作成します:

```java
package com.example.easyapp.config;

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
@MapperScan(basePackages = "com.example.easyapp.mapper") // mapperパッケージ配下をスキャン
public class MyBatisConfig {

    // MyBatisの設定
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
package com.example.easyapp.entity;

import lombok.Value;

/**
 * usersテーブルのentityクラスです。
 *
 * @author nob
 */
@Value
public class Users {

    /** ユーザID */
    private Integer userId;

    /** ユーザ名 */
    private String userName;

    /** 年齢 */
    private Integer age;

    /** 備考 */
    private String remarks;
}
```

- mapper パッケージに、`sqlSupport`クラスおよび`mapper`クラスを作成します:

```java
package com.example.easyapp.mapper;

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
    public static final SqlColumn<String> remarks = users.remarks;

    public static final class Users extends SqlTable {

        public final SqlColumn<Integer> userId = column("user_id", JDBCType.INTEGER);
        public final SqlColumn<String> userName = column("user_name", JDBCType.VARCHAR);
        public final SqlColumn<String> age = column("age", JDBCType.VARCHAR);
        public final SqlColumn<String> remarks = column("remarks", JDBCType.VARCHAR);

        public Users() {
            super("users");
        }
    }
}
```

```java
package com.example.easyapp.mapper;

import java.util.List;

import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Result;
import org.apache.ibatis.annotations.Results;
import org.mybatis.dynamic.sql.select.render.SelectStatementProvider;
import org.mybatis.dynamic.sql.util.SqlProviderAdapter;

import com.example.easyapp.entity.Users;

/**
 * usersテーブルのmapperクラスです。
 *
 * @author nob
 */
@Mapper
public interface UsersMapper {

    @SelectProvider(type = SqlProviderAdapter.class, method = "select")
    @Results(id = "usersResult", value = {
            @Result(column = "user_id", property = "userId"),
            @Result(column = "user_name", property = "userName"),
            @Result(column = "age", property = "age"),
            @Result(column = "remarks", property = "remarks"),
    })
    List<Users> select(SelectStatementProvider selectStatement);
}
```

- repository クラスを作成します:

```java
package com.example.easyapp.repository;

import java.util.List;

import org.mybatis.dynamic.sql.SqlBuilder;
import org.mybatis.dynamic.sql.render.RenderingStrategies;
import org.mybatis.dynamic.sql.select.render.SelectStatementProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.example.easyapp.entity.Users;
import com.example.easyapp.mapper.UsersDynamicSqlSupport;
import com.example.easyapp.mapper.UsersMapper;

/**
 * usersテーブルのrepositoryクラスです。
 *
 * @author nob
 */
@Repository
public class UsersRepository {

    @Autowired
    private UsersMapper usersMapper;

    /**
     * ユーザを検索します。
     *
     * @return ヒットしたユーザのリスト
     */
    public List<Users> select() {

        SelectStatementProvider selectStatement = SqlBuilder.select(UsersDynamicSqlSupport.users.allColumns())
                .from(UsersDynamicSqlSupport.users).build().render(RenderingStrategies.MYBATIS3);

        return usersMapper.select(selectStatement);
    }
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
@SpringBootTest
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
    user_id int PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age int NOT NULL
    , remarks TEXT
);
```

```sql
-- data.sql
INSERT INTO users(
    user_name
    , age
    , remarks
) VALUES (
    'nob'
    , 13
    , 'This is a test data'
);
```
