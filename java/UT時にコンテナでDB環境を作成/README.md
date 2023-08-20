# UT 時にコンテナで DB 環境を作成

UT 実行時にコンテナでデータベースを起動し、毎回綺麗な DB 環境を提供します。

## 実装

例として、`MariaDB`をテスト用 DB として使用します。

### 依存関係

`pom.xml`に下記を追記してください。

```xml
<!--  testcontainers  -->
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

### SQL

`test/resources`配下に、初期実行用の SQL ファイルを作成してください。今回はファイル名を`create_table.sql`と想定します。

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
);
```

### テスト作成

下記でテストクラスを作成してください。

```java
package com.example.utsample.dao;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MariaDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import com.example.utsample.entity.Account;

/**
 * SampleDaoImplのテストクラスです。
 *
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true) // docker環境が無い場合はテストがスキップされます。
public class SampleDaoTest {

    // データベースのコンテナイメージなど、DB構築に必要な設定値です。
    static final DockerImageName MARIA_DB_IMAGE_NAME = DockerImageName.parse("mariadb").withTag("10.5");
    static final String DATABASE_NAME = "nob";
    static final String USER_NAME = "root";
    static final String PASSWORD = "";

    // テスト用DBコンテナを作成します。
    @Container
    static final MariaDBContainer<?> mariaDbContainer = new MariaDBContainer<>(MARIA_DB_IMAGE_NAME)
            .withDatabaseName(DATABASE_NAME)
            .withUsername(USER_NAME)
            .withPassword(PASSWORD)
            .withInitScript("create_table.sql"); // ここで初期値投入用のSQLファイルを読み込んでいます。

    // 接続情報などの設定値を投入します。
    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mariaDbContainer::getJdbcUrl);
        registry.add("spring.datasource.username", mariaDbContainer::getUsername);
        registry.add("spring.datasource.password", mariaDbContainer::getPassword);
    }

    // テストクラスです。
    @Autowired
    private SampleDao sampleDao;

    /**
     * selectAllのテスト 正常系
     *
     */
    @Test
    public void testSelectAll() {

        List<Account> accountList = new ArrayList<>();
        try {
            accountList = sampleDao.selectAll();
        } catch (Exception e) {
            fail();
            e.printStackTrace();
        }

        assertEquals(3, accountList.size());
    }
}
```
