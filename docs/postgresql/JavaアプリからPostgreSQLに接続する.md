# JavaアプリからPostgreSQLに接続する

## 設定

- `pom.xml`

```xml
		<dependency>
			<groupId>org.postgresql</groupId>
			<artifactId>postgresql</artifactId>
		</dependency>
```

- `application.properties`

```ini
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.url=jdbc:postgresql://localhost:5432/eadb?currentSchema=eadb
spring.datasource.username=eadbuser
spring.datasource.password=eadbpass
```
