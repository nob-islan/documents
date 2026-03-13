# Igniteにアクセスするメソッドを実装

[MyBatis Dynamic SQL](https://mybatis.org/mybatis-dynamic-sql/docs/introduction.html)を使ってIgniteにアクセスするメソッドを実装します。

cf.

- https://ignite.apache.org/docs/ignite2/latest/SQL/JDBC/jdbc-driver

## 事前準備

- 下記SQLでIgnite上にテーブルを作成します:

```sql
CREATE TABLE IF NOT EXISTS Users (
    name varchar PRIMARY KEY
    , password varchar
    , age int
);
```

## 実装

### `pom.xml`

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
```

### `application.properties`

接続先のURLおよびドライバを指定します。

```shell
spring.datasource.url=jdbc:ignite:thin://192.168.151.10
spring.datasource.driver-class-name=org.apache.ignite.IgniteJdbcThinDriver
```

### `config/MyBatisConfig.java`

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

### `domain/entity/Users.java`

```java
package nob.example.easyapp.domain.entity;

import lombok.Value;

/**
 * usersテーブルのエンティティクラスです。
 *
 * @author nob
 */
@Value
public class Users {

    /** ユーザ名 */
    private String name;

    /** パスワード */
    private String password;

    /** 年齢 */
    private Integer age;
}
```

### `domain/mapper/UsersDynamicSqlSupport.java`

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

    public static final SqlColumn<String> name = users.name;
    public static final SqlColumn<String> password = users.password;
    public static final SqlColumn<Integer> age = users.age;

    public static final class Users extends SqlTable {

        protected Users() {
            super("Users"); // Ignite上のテーブル名
        }

        public final SqlColumn<String> name = column("name", JDBCType.VARCHAR);
        public final SqlColumn<String> password = column("password", JDBCType.VARCHAR);
        public final SqlColumn<Integer> age = column("age", JDBCType.INTEGER);
    }
}
```

### `domain/mapper/UsersMapper.java`

```java
package nob.example.easyapp.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.InsertProvider;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.SelectProvider;
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
     * データ全件検索
     *
     * @param selectStatement
     * @return ユーザ情報リスト
     */
    @SelectProvider(type = SqlProviderAdapter.class, method = "select")
    List<Users> selectAll(SelectStatementProvider selectStatement);

    /**
     * データ登録
     *
     * @param insertStatement
     */
    @InsertProvider(type = SqlProviderAdapter.class, method = "insert")
    void insert(InsertStatementProvider<Users> insertStatement);
}
```

### `repository/UsersRepository.java`

```java
package nob.example.easyapp.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import nob.example.easyapp.domain.entity.Users;

/**
 * usersテーブルのrepositoryインターフェースです。
 *
 * @author nob
 */
@Repository
public interface UsersRepository {

    /**
     * ユーザ情報を全件取得します。
     *
     * @return ユーザ情報リスト
     */
    List<Users> selectAll();

    /**
     * ユーザ情報を登録します。
     *
     * @param users ユーザ情報
     */
    void insert(Users users);
}
```

### `repository/impl/UsersRepositoryImpl.java`

```java
package nob.example.easyapp.repository.impl;

import java.util.List;

import org.mybatis.dynamic.sql.SqlBuilder;
import org.mybatis.dynamic.sql.insert.render.InsertStatementProvider;
import org.mybatis.dynamic.sql.render.RenderingStrategies;
import org.mybatis.dynamic.sql.select.render.SelectStatementProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import nob.example.easyapp.domain.entity.Users;
import nob.example.easyapp.domain.mapper.UsersDynamicSqlSupport;
import nob.example.easyapp.domain.mapper.UsersMapper;
import nob.example.easyapp.repository.UsersRepository;

/**
 * UsersRepositoryの実装クラスです。
 *
 * @author nob
 */
@Repository
public class UsersRepositoryImpl implements UsersRepository {

    @Autowired
    private UsersMapper usersMapper;

    @Override
    public List<Users> selectAll() {

        SelectStatementProvider selectStatement = SqlBuilder.select(UsersDynamicSqlSupport.users.allColumns())
                .from(UsersDynamicSqlSupport.users)
                .build()
                .render(RenderingStrategies.MYBATIS3);

        return usersMapper.selectAll(selectStatement);
    }

    @Override
    public void insert(Users users) {

        InsertStatementProvider<Users> insertStatement = SqlBuilder.insert(users)
                .into(UsersDynamicSqlSupport.users)
                .map(UsersDynamicSqlSupport.name).toProperty("name")
                .map(UsersDynamicSqlSupport.password).toProperty("password")
                .map(UsersDynamicSqlSupport.age).toProperty("age")
                .build()
                .render(RenderingStrategies.MYBATIS3);

        usersMapper.insert(insertStatement);
    }
}
```

### `EasyappApplication.java`

```java
package nob.example.easyapp;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import nob.example.easyapp.domain.entity.Users;
import nob.example.easyapp.repository.UsersRepository;

@SpringBootApplication
public class EasyappApplication {

    public static void main(String[] args) {
        SpringApplication.run(EasyappApplication.class, args);
    }

    @Bean
    CommandLineRunner run(UsersRepository repository) {
        return args -> {
            repository.insert(new Users("nobbb", "passwd", 13)); // データ登録
            System.out.println(repository.selectAll()); // データ検索
        };
    }
}
```

## 動作確認

`./mvnw spring-boot:run`でアプリ起動後、Ignite上へのデータ登録および全件取得が実行されます。
