# Ignite上のデータをDBに永続化

Ignite上にキャッシュされたデータをDB上に永続化するための設定です。

cf. https://ignite.apache.org/docs/ignite2/latest/persistence/external-storage

## 事前準備

下記SQLによって構築されるデータベースに向けてデータを永続化することを想定します:

```sql
CREATE DATABASE eadb;
USE eadb;

CREATE TABLE IF NOT EXISTS users (
    id bigint PRIMARY KEY
    , name varchar(8)
    , password varchar(32)
    , age int
);
```

## 設定

### エンティティ提供モジュール

エンティティを提供するモジュールはIgniteおよび業務アプリケーションの両方から参照されるため、独立したモジュールとして用意します。下記要領でエンティティクラスを実装します:

```java
package nob.example.domain.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * usersテーブル向けのエンティティクラスです。
 *
 * @author nob
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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

実装後、`mvn clean install`コマンドでjarファイルを用意してください。

### Ignite

#### 依存モジュールの準備

先に作成したエンティティ提供モジュールおよび[mysql-connector-j](https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/)について、`libs/nob/`配下に配置し、下記環境変数でこれらのモジュールをIgniteが認識できるようにします:

```shell
export USER_LIBS=${IGNITE_HOME}/libs/nob
```

#### 設定ファイル作成

キャッシュの永続化について記載した下記設定ファイルについて、`config/nob-config.xml`として配置します:

```xml
<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans" xmlns:util="http://www.springframework.org/schema/util" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="         http://www.springframework.org/schema/beans              http://www.springframework.org/schema/beans/spring-beans.xsd              http://www.springframework.org/schema/util              http://www.springframework.org/schema/util/spring-util.xsd">
    <!-- データベース接続先設定 -->
    <bean class="com.mysql.cj.jdbc.MysqlDataSource" id="mysqlDataSource">
        <property name="URL" value="jdbc:mysql://localhost:3306/eadb"/>
        <property name="user" value="root"/>
        <property name="password" value="password"/>
    </bean>
    <bean class="org.apache.ignite.configuration.IgniteConfiguration">
        <property name="cacheConfiguration">
            <list>
                <bean class="org.apache.ignite.configuration.CacheConfiguration">
                    <property name="name" value="UsersCache"/>
                    <property name="cacheMode" value="PARTITIONED"/>
                    <property name="atomicityMode" value="ATOMIC"/>
                    <property name="cacheStoreFactory">
                        <bean class="org.apache.ignite.cache.store.jdbc.CacheJdbcPojoStoreFactory">
                            <property name="dataSourceBean" value="mysqlDataSource"/>
                            <property name="dialect">
                                <bean class="org.apache.ignite.cache.store.jdbc.dialect.MySQLDialect"/>
                            </property>
                            <property name="types">
                                <list>
                                    <!-- usersテーブル向けキャッシュ設定 -->
                                    <bean class="org.apache.ignite.cache.store.jdbc.JdbcType">
                                        <property name="cacheName" value="UsersCache"/>
                                        <property name="keyType" value="java.lang.Long"/>
                                        <property name="valueType" value="nob.example.domain.entity.Users"/>
                                        <property name="databaseTable" value="users"/>
                                        <property name="keyFields">
                                            <list>
                                                <bean class="org.apache.ignite.cache.store.jdbc.JdbcTypeField">
                                                    <constructor-arg>
                                                        <util:constant static-field="java.sql.Types.BIGINT"/>
                                                    </constructor-arg>
                                                    <constructor-arg value="id"/>
                                                    <constructor-arg value="java.lang.Long"/>
                                                    <constructor-arg value="id"/>
                                                </bean>
                                            </list>
                                        </property>
                                        <property name="valueFields">
                                            <list>
                                                <bean class="org.apache.ignite.cache.store.jdbc.JdbcTypeField">
                                                    <constructor-arg>
                                                        <util:constant static-field="java.sql.Types.VARCHAR"/>
                                                    </constructor-arg>
                                                    <constructor-arg value="name"/>
                                                    <constructor-arg value="java.lang.String"/>
                                                    <constructor-arg value="name"/>
                                                </bean>
                                                <bean class="org.apache.ignite.cache.store.jdbc.JdbcTypeField">
                                                    <constructor-arg>
                                                        <util:constant static-field="java.sql.Types.VARCHAR"/>
                                                    </constructor-arg>
                                                    <constructor-arg value="password"/>
                                                    <constructor-arg value="java.lang.String"/>
                                                    <constructor-arg value="password"/>
                                                </bean>
                                                <bean class="org.apache.ignite.cache.store.jdbc.JdbcTypeField">
                                                    <constructor-arg>
                                                        <util:constant static-field="java.sql.Types.INTEGER"/>
                                                    </constructor-arg>
                                                    <constructor-arg value="age"/>
                                                    <constructor-arg value="java.lang.Integer"/>
                                                    <constructor-arg value="age"/>
                                                </bean>
                                            </list>
                                        </property>
                                    </bean>
                                </list>
                            </property>
                        </bean>
                    </property>
                    <!-- see; https://www.javadoc.io/doc/org.apache.ignite/ignite-core/2.17.0/org/apache/ignite/configuration/CacheConfiguration.html -->
                    <property name="readThrough" value="true"/>
                    <property name="writeThrough" value="true"/>
                    <property name="writeBehindEnabled" value="true"/>
                    <property name="writeBehindFlushFrequency" value="5000"/>
                    <!-- Ignite上でSQLクエリを有効化する -->
                    <property name="queryEntities">
                        <list>
                            <bean class="org.apache.ignite.cache.QueryEntity">
                                <property name="keyType" value="java.lang.Long"/>
                                <property name="valueType" value="nob.example.domain.entity.Users"/>
                                <property name="keyFieldName" value="id"/>
                                <property name="keyFields">
                                    <list>
                                        <value>id</value>
                                    </list>
                                </property>
                                <property name="fields">
                                    <map>
                                        <entry key="id" value="java.lang.Long"/>
                                        <entry key="name" value="java.lang.String"/>
                                        <entry key="password" value="java.lang.String"/>
                                        <entry key="age" value="java.lang.Integer"/>
                                    </map>
                                </property>
                            </bean>
                        </list>
                    </property>
                </bean>
            </list>
        </property>
    </bean>
</beans>
```

#### 起動

下記コマンドでIgniteを起動します:

```shell
./bin/ignite.sh config/nob-config.xml
```

### 業務アプリケーションモジュール

#### 依存関係追加

下記を`pom.xml`に追加します:

```xml
        <!-- Source: https://mvnrepository.com/artifact/org.apache.ignite/ignite-core -->
        <dependency>
            <groupId>org.apache.ignite</groupId>
            <artifactId>ignite-core</artifactId>
            <version>2.17.0</version>
            <scope>compile</scope>
        </dependency>

        <dependency>
            <groupId>nob.example</groupId>
            <artifactId>sharedapp</artifactId>
            <version>1.0-SNAPSHOT</version>
        </dependency>
```

#### データ登録処理実装

```java
package nob.example;

import org.apache.ignite.Ignite;
import org.apache.ignite.IgniteCache;
import org.apache.ignite.Ignition;
import org.apache.ignite.configuration.IgniteConfiguration;

import nob.example.domain.entity.Users;

public class App {
    public static void main(String[] args) {

        IgniteConfiguration cfg = new IgniteConfiguration();
        cfg.setClientMode(true);

        try (Ignite ignite = Ignition.start(cfg)) {

            IgniteCache<Long, Users> cache = ignite.cache("UsersCache");

            Users users = new Users(1L, "nob", "passwd", 13);
            cache.put(users.getId(), users);
        }
    }
}
```

### 動作確認

```sql
-- キャッシュ上のデータ確認
SELECT * FROM "UsersCache"."USERS";
```

```sql
-- DB上のデータ確認
SELECT * FROM users;
```
