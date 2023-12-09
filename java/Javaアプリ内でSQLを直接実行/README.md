# Java アプリ内で SQL を直接実行

dao などではなく、SQL コマンドをベタ書きして実行します。

## 実装

- `pom.xml`に必要な依存関係を追加します。

```xml
<!-- DB -->
<dependency>
    <groupId>org.mariadb.jdbc</groupId>
    <artifactId>mariadb-java-client</artifactId>
</dependency>

<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.0</version>
</dependency>
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis-spring</artifactId>
    <version>1.3.2</version>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>

<!-- testcontainers -->
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

- データベース作成用の SQL を`test/resources/create_table.sql`として配置します。

```sql
-- テーブル作成
CREATE TABLE IF NOT EXISTS account (
    id INT AUTO_INCREMENT PRIMARY KEY
    , name VARCHAR(20) NOT NULL
    , inp_date TIMESTAMP
);

-- テストデータ挿入
INSERT INTO account (
    name
) VALUES (
    'first-nob'
), (
    'second-nob'
), (
    'third-nob'
)
;
```

テストクラス実装後、テストをデバッグで止めてコンテナ内を確認すると下記のようにデータが入ってることが見えます。

```
MariaDB [nobdb]> SELECT * FROM account;
+----+------------+---------------------+
| id | name       | inp_date            |
+----+------------+---------------------+
|  1 | first-nob  | 2023-12-09 03:20:03 |
|  2 | second-nob | 2023-12-09 03:20:03 |
|  3 | third-nob  | 2023-12-09 03:20:03 |
+----+------------+---------------------+
```

- 下記でサンプルのテストクラスを実装します。テストクラス実行時にテスト用のコンテナデータベースを起動し、そこに向けて SQL コマンドを発行します。

```java
package com.example.sqlinspection.dao;

import static org.junit.Assert.assertEquals;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MariaDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

/**
 * SQLを実行するサンプルテストクラスです。
 *
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = false)
public class SampleTest {

    // データベースのコンテナイメージなど、DB構築に必要な設定値
    static final DockerImageName MARIA_DB_IMAGE_NAME = DockerImageName.parse("mariadb").withTag("10.5");
    static final String DATABASE_NAME = "nobdb";
    static final String USER_NAME = "root";
    static final String PASSWORD = "";

    // テスト用DBコンテナを作成
    @Container
    static final MariaDBContainer<?> mariaDbContainer = new MariaDBContainer<>(MARIA_DB_IMAGE_NAME)
            .withDatabaseName(DATABASE_NAME)
            .withUsername(USER_NAME)
            .withPassword(PASSWORD)
            .withInitScript("create_table.sql");

    // 接続情報などの設定値を投入
    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mariaDbContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mariaDbContainer::getUsername);
        registry.add("spring.datasource.password", mariaDbContainer::getPassword);
    }

    /**
     * SQLを直接実行してDBのデータ内容を取得します。
     *
     * @throws ClassNotFoundException
     * @throws SQLException
     *
     */
    @Test
    public void testSql() throws ClassNotFoundException, SQLException {

        // 接続先の情報を初期化
        Connection connection = null;
        // 問い合わせ取得結果を初期化
        Statement statement = null;
        // 実行結果を格納する変数を初期化
        ResultSet resultSet = null;

        // JDBCドライバをロード
        Class.forName(mariaDbContainer.getDriverClassName());
        // 接続先の情報をインプット（URL、ユーザ、パスワード）
        connection = DriverManager.getConnection(mariaDbContainer.getJdbcUrl(), mariaDbContainer.getUsername(),
                mariaDbContainer.getPassword());

        // ステートメントを作成
        statement = connection.createStatement();
        // SQLコマンド
        String sql = "SELECT * FROM account ORDER BY id";
        // SQL実行、結果を格納
        resultSet = statement.executeQuery(sql);

        // assert用の期待値map key: id, value: name
        Map<String, String> idNameMap = new HashMap<String, String>();
        idNameMap.put("1", "first-nob");
        idNameMap.put("2", "second-nob");
        idNameMap.put("3", "third-nob");

        // 各IDについて、期待値であるidNamemap通りのnameが入っていることを確認
        Integer i = 1;
        while (resultSet.next()) {
            assertEquals(idNameMap.get(i.toString()), resultSet.getString("name"));
            i++;
        }
    }
}
```
