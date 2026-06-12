# H2DBを使ってアプリを起動

[H2DB](https://www.h2database.com/html/main.html)を使ってインメモリデータベースをデータストアとするJavaアプリを起動します。

cf.

- https://www.baeldung.com/spring-boot-h2-database
- https://docs.spring.io/spring-boot/reference/data/sql.html

## 実装

### `application-h2.properties`

```shell
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.url=jdbc:h2:mem:eadb
spring.datasource.username=sa
spring.datasource.password=
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.defer-datasource-initialization=true
spring.sql.init.data-locations=classpath:h2db/data/*.sql
```

### `pom.xml`

```xml
		<!-- Source: https://mvnrepository.com/artifact/com.h2database/h2 -->
		<dependency>
			<groupId>com.h2database</groupId>
			<artifactId>h2</artifactId>
		</dependency>
		<!-- Source: https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-h2console -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-h2console</artifactId>
		</dependency>
```

### `domain/entity/Users.java`

[Jakarta Persistence](https://jakarta.ee/learn/docs/jakartaee-tutorial/current/persist/persistence-intro/persistence-intro.html)のアノテーションを付与することで、起動時に自動でDDLが発行されます。

```java
package nob.example.easyapp.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * usersテーブルのエンティティクラスです。
 *
 * @author nob
 */
@Table(name = "users")
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Users {

    /** ユーザ名 */
    @Id
    @Column(name = "name", length = 8, nullable = false)
    private String name;

    /** パスワード */
    @Column(name = "password", length = 32, nullable = false)
    private String password;

    /** 年齢 */
    @Column(name = "age", nullable = false)
    private Integer age;
}
```

### `resources/h2db/data/users.sql`

```sql
INSERT INTO users (
    name
    , password
    , age
) VALUES (
    'nob'
    , 'passwd'
    , 13
);
```

## 起動

```shell
# application-h2.propertiesを指定してアプリ起動
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=h2"
```

起動後、http://localhost:8080/h2-console からH2DBコンソールにログインできます。
