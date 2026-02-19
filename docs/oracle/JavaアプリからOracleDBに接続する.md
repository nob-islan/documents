# JavaアプリからOracleDBに接続する

Oracleドライバを使ってOracleDBに接続する設定です。

cf. https://medium.com/oracledevs/spring-data-jdbc-with-the-oracle-database-23c-for-java-developers-getting-started-guide-1c4640fc8d27

## 設定

- `pom.xml`

```xml
		<dependency>
			<groupId>com.oracle.database.jdbc</groupId>
			<artifactId>ojdbc11</artifactId>
			<scope>runtime</scope>
		</dependency>
```

- `application.properties`

```shell
spring.datasource.driver-class-name=oracle.jdbc.OracleDriver
spring.datasource.url=jdbc:oracle:thin:@//localhost:1521/nobpdb
spring.datasource.username=eadb
spring.datasource.password=eadbpass
```
