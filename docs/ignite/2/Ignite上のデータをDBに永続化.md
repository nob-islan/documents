# Ignite上のデータをDBに永続化

cf. https://ignite.apache.org/docs/ignite2/latest/persistence/external-storage

## 前提

下記SQLおよびエンティティによってキャッシュ上にテーブルが定義されているとします:

```sql
CREATE TABLE IF NOT EXISTS users (
    id bigint PRIMARY KEY
    , name varchar
    , password varchar
    , age int
);
```

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

    /** 管理ID */
    private Long id;

    /** ユーザ名 */
    private String name;

    /** パスワード */
    private String password;

    /** 年齢 */
    private Integer age;
}
```

## 実装

### `config/MariaDbConfig.java`

データベースへの接続情報を記載します:

```java
package nob.example.easyapp.config;

import javax.sql.DataSource;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

/**
 * MariaDB関連のコンフィグクラスです。
 *
 * @author nob
 */
@Configuration
public class MariaDbConfig {

    @Bean
    DataSource mariaDbDataSource() {
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.mariadb.jdbc.Driver");
        ds.setUrl("jdbc:mariadb://localhost:3306/eadb");
        ds.setUsername("root");
        ds.setPassword("password");
        return ds;
    }
}
```

### `ignite/UsersCacheConfig.java`

キャッシュの永続化に関する設定を定義します:

```java
package nob.example.easyapp.ignite;

import java.sql.Types;

import javax.sql.DataSource;

import org.apache.ignite.cache.store.jdbc.CacheJdbcPojoStoreFactory;
import org.apache.ignite.cache.store.jdbc.JdbcType;
import org.apache.ignite.cache.store.jdbc.JdbcTypeField;
import org.apache.ignite.cache.store.jdbc.dialect.MySQLDialect;
import org.apache.ignite.configuration.CacheConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * usersテーブル向けのキャッシュコンフィグクラスです。
 *
 * @author nob
 */
@Configuration
public class UsersCacheConfig {

    @Autowired
    private DataSource mariaDbDataSource;

    @Bean
    CacheConfiguration<Long, Object> usersCache() {

        CacheConfiguration<Long, Object> cfg = new CacheConfiguration<>("users");

        CacheJdbcPojoStoreFactory<Long, Object> factory = new CacheJdbcPojoStoreFactory<>();
        factory.setDataSourceFactory(() -> mariaDbDataSource);
        factory.setDialect(new MySQLDialect());

        JdbcType jdbcType = new JdbcType();
        jdbcType.setKeyType(Long.class);
        jdbcType.setValueType(Object.class);
        jdbcType.setCacheName("users");
        jdbcType.setDatabaseTable("users");
        jdbcType.setKeyFields(new JdbcTypeField[] {
                new JdbcTypeField(Types.BIGINT, "id", Long.class, "id")
        });
        jdbcType.setValueFields(new JdbcTypeField[] {
                new JdbcTypeField(Types.VARCHAR, "name", String.class, "name"),
                new JdbcTypeField(Types.VARCHAR, "password", String.class, "password"),
                new JdbcTypeField(Types.INTEGER, "age", Integer.class, "age")
        });

        factory.setTypes(jdbcType);

        cfg.setCacheStoreFactory(factory);
        cfg.setReadThrough(true);
        cfg.setWriteThrough(true);
        cfg.setWriteBehindEnabled(true);
        cfg.setWriteBehindFlushFrequency(3000);

        return cfg;
    }
}
```
