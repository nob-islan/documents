# JpaRepository 実装例

`org.springframework.data.jpa.repository.JpaRepository`を使ったデータ層の実装例です。

## 事前準備

### pom.xml に依存関係を追加

```xml
		<!-- for lombok -->
		<dependency>
			<groupId>org.projectlombok</groupId>
			<artifactId>lombok</artifactId>
			<optional>true</optional>
		</dependency>

		<!-- for repository -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-data-jpa</artifactId>
		</dependency>
		<dependency>
			<groupId>org.mariadb.jdbc</groupId>
			<artifactId>mariadb-java-client</artifactId>
		</dependency>

		<!--  for testcontainers  -->
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>testcontainers</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>junit-jupiter</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>mariadb</artifactId>
			<version>1.18.3</version>
			<scope>test</scope>
		</dependency>
```

### テストデータ用意

単体テストで使う用に、`test/resources`配下に SQL ファイルを作成します:

```sql
-- テーブルが存在しなければ作成
CREATE TABLE IF NOT EXISTS users(
    user_id int PRIMARY KEY AUTO_INCREMENT
    , user_name VARCHAR(20) NOT NULL
    , age int NOT NULL
    , remarks TEXT
);

-- 古いデータ削除
TRUNCATE TABLE users;

-- データ投入
INSERT INTO users (
    user_name
    , age
    , remarks
) VALUES (
    "nob"
    , "13"
    , "for select UT"
);
```

## メソッド実装例
