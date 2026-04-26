# MyBatisを使ってDBに接続

MyBatisを使ってJavaアプリからDBに接続する方法、および実装サンプルを記載します。

## 設定ファイル

### `pom.xml`

各種依存関係です。アプリ起動時にエラーが起きる場合はバージョンが古い可能性があります。

```xml
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
			<groupId>jakarta.persistence</groupId>
			<artifactId>jakarta.persistence-api</artifactId>
		</dependency>
```

### `application.properties`

DBへの接続情報です。

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

### `mybatis-config.xml`

`src/main/resources`配下に下記で作成します。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE configuration PUBLIC
        "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">

<configuration>
    <settings>
        <setting name="mapUnderscoreToCamelCase" value="true" />
    </settings>
</configuration>
```

### `MyBatisConfig.java`

```java
package nob.example.easyapp.config;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

/**
 * MyBatisの設定向けのコンフィグクラスです。
 *
 * @author nob
 */
@Configuration
@MapperScan(basePackages = "nob.example.easyapp.domain.mapper")
public class MyBatisConfig {

    @Bean
    SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        final SqlSessionFactoryBean sessionFactory = new SqlSessionFactoryBean();
        sessionFactory.setDataSource(dataSource);
        // コンフィグファイルの読み込み
        sessionFactory.setConfigLocation(new ClassPathResource("/mybatis-config.xml"));

        return sessionFactory.getObject();
    }
}
```

## 実装

例として、下記の`users`テーブル向けの実装を記載します。

| カラム名 | column_name | 型          | PK  | NULL |
| -------- | ----------- | ----------- | --- | ---- |
| ユーザID | user_id     | VARCHAR(11) | o   | x    |
| ユーザ名 | user_name   | VARCHAR(20) |     | x    |
| 年齢     | age         | INT         |     | x    |
| 住所     | address     | TEXT        |     | o    |

### エンティティ

デーブル定義と対応させるモデルクラスです。

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

### Mapperインターフェース

Mapperのインターフェースです。repositoryからこのインターフェースのメソッドを呼び出してデータ操作を実装します。

```java
package nob.example.easyapp.domain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import nob.example.easyapp.domain.entity.Users;

/**
 * usersテーブルのmapperインターフェースです。
 *
 * @author nob
 */
@Mapper
public interface UsersMapper {

    /**
     * ユーザ情報を更新します。
     *
     * @param users
     */
    void update(Users users);

    /**
     * ユーザ情報を登録します。
     *
     * @param users
     */
    void insert(Users users);

    /**
     * 検索条件からカラムを抽出します。
     *
     * @param userId
     * @return ユーザのリスト
     */
    List<Users> selectByKey(String userName);

    /**
     * ユーザ情報を削除します。
     *
     * @param userId
     */
    void delete(Integer userId);
}
```

また、静的なSQLであればアノテーションに付与することで自動的に実装されます:

```java
    /**
     * ユーザ情報を全権取得します。
     *
     * @return ユーザのリスト
     */
    @Select("SELECT user_id, user_name, age, address FROM users")
    List<Users> selectAll();
```

### Mapper xml

SQLの実体を記載するファイルです。`src/resources`配下に、mapperインターフェースと同じパッケージ構成で配置します。例として、mapperインターフェースが`src/main/java/nob/example/easyapp/domain/mapper`に配置されている場合、xmlファイルは`src/main/resources/nob/example/easyapp/domain/mapper`に配置します。

- mapperタグ
  - `namespace`: mapperが配置されているパッケージ
- update, insert, select, deleteタグ
  - `id`: インターフェース側のメソッド名
  - `resultType`: 戻りの型

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC
        "-//mybatis.org//DTD Mapper 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="nob.example.easyapp.domain.mapper.UsersMapper">
    <update id="update">
        UPDATE
            users
        SET
            user_name = #{userName}
            , age = #{age}
            , address = #{address}
        WHERE
            user_id = #{userId}
    </update>

    <insert id="insert">
        INSERT
            INTO users (
                user_name
                , age
                , address
            ) VALUES(
                #{userName}
                , #{age}
                , #{address}
            )
    </insert>

    <select id="selectByKey" resultType="nob.example.easyapp.domain.entity.Users">
        <bind name="userNameLike" value="'%' + userName + '%'"/>
        SELECT
            user_id
            , user_name
            , age
            , address
        FROM
            users
        <where>
            <if test="userName != ''">
                AND user_name LIKE #{userNameLike}
            </if>
        </where>
    </select>

    <delete id="delete">
        DELETE
        FROM
            users
        WHERE
            user_id = #{userId}
    </delete>
</mapper>
```
