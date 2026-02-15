# MyBatisを使ってDBに接続

MyBatisを使ってJavaアプリからDBに接続する方法、および実装サンプルを記載します。

## 設定ファイル

### `pom.xml`

各種依存関係です。アプリ起動時にエラーが起きる場合はバージョンが古い可能性があります。

```xml
<dependency>
    <groupId>org.mariadb.jdbc</groupId>
    <artifactId>mariadb-java-client</artifactId>
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
    <groupId>jakarta.persistence</groupId>
    <artifactId>jakarta.persistence-api</artifactId>
    <version>3.2.0</version>
</dependency>

```

### `application.properties`

DBへの接続情報です。

```properties
#MariaDBのドライバ設定
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
#接続用URL
spring.datasource.url=jdbc:mariadb://localhost/DBName
#ユーザ名
spring.datasource.username=root
#パスワード
spring.datasource.password=
```

### `mybatis-config.xml`

`projectname/src/main/resources`配下に下記で作成します。

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

### `ProjectNameApplication.java`

アプリ起動時にMyBatisの設定を読み込みます。

```java
package com.example.projectname;

import javax.sql.DataSource;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.ClassPathResource;

@SpringBootApplication
@MapperScan(basePackages = "com.example.projectname.mapper")
public class ProjectNameApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjectNameApplication.class, args);
	}

	// MyBatisの設定
	@Bean
	public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
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
| 備考     | remarks     | TEXT        |     | o    |

### エンティティ

デーブル定義と対応させるモデルクラスです。

```java
package nob.example.firstrestapi.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * usersテーブルのentityクラスです。
 *
 * @author nob
 */
@Data
@Entity
@Table(name = "users")
public class Users {

    /** ユーザID */
    @Id
    @Column(name = "user_id", columnDefinition = "PRIMARY KEY", length = 11, nullable = false)
    private String userId;

    /** ユーザ名 */
    @Column(name = "user_name", length = 20, nullable = false)
    private String userName;

    /** 年齢 */
    @Column(name = "age", length = 11, nullable = false)
    private Integer age;

    /** 備考 */
    @Column(name = "remarks", nullable = true)
    private String remarks;
}
```

### Mapperインターフェース

Mapperのインターフェースです。業務処理側からはこのクラスのメソッドを呼び出します。

```java
package nob.example.firstrestapi.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import nob.example.firstrestapi.domain.entity.Users;
import nob.example.firstrestapi.repository.key.UsersDeleteKey;
import nob.example.firstrestapi.repository.key.UsersSelectKey;

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
     * @param usersSelectKey
     * @return ユーザのリスト
     */
    List<Users> selectByKey(UsersSelectKey usersSelectKey);

    /**
     * ユーザ情報を削除します。
     *
     * @param usersDeleteKey
     */
    void delete(UsersDeleteKey usersDeleteKey);
}
```

### Mapper xml

SQLの実体を記載するファイルです。`src/resources`配下に、mapperインターフェースと同じパッケージ構成で配置します。例として、mapperインターフェースが`src/main/java/nob/example/firstrestapi/mapper`に配置されている場合、xmlファイルは`src/main/resources/nob/example/firstrestapi/mapper`に配置します。

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

<mapper namespace="nob.example.firstrestapi.mapper.UsersMapper">
    <update id="update">
        UPDATE
            users
        SET
            user_name = #{userName}
            , age = #{age}
            , remarks = #{remarks}
        WHERE
            user_id = #{userId}
    </update>

    <insert id="insert">
        INSERT
            INTO users (
                user_name
                , age
                , remarks
            ) VALUES(
                #{userName}
                , #{age}
                , #{remarks}
            )
    </insert>

    <select id="selectByKey" resultType="nob.example.firstrestapi.domain.entity.Users">
        <bind name="userNameLike" value="'%' + userName + '%'"/>
        SELECT
            user_id
            , user_name
            , age
            , remarks
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
