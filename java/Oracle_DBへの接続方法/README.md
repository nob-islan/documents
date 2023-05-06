# Oracle DB への接続方法

Oracle DB との連携方法を記載します。

cf.  
https://intellectual-curiosity.tokyo/2019/04/30/spring-bootでoracle-データベースに接続する方法/  
https://ts0818.hatenablog.com/entry/2022/11/25/124143

## 実装手順

- JDBC jar ファイルのダウンロード

[公式サイト](https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html)から JDBC ドライバの jar ファイルをダウンロードして、java プロジェクトのルートディレクトリ配下に`lib`を切って配置します。

- 依存関係の追加

`pom.xml`に下記を追記します。

```xml
    <!-- for oracle DB -->
    <dependency>
        <groupId>com.oracle</groupId>
        <artifactId>ojdbc11</artifactId>
        <version>21</version>
        <scope>system</scope>
        <systemPath>${basedir}/lib/ojdbc11.jar</systemPath>
    </dependency>
    <dependency>
        <groupId>com.zaxxer</groupId>
        <artifactId>HikariCP</artifactId>
    </dependency>
```

- 接続情報の記載

`application.properties`に下記を記載します。

```
spring.datasource.url=jdbc:oracle:thin:${username}/${password}@//${hostname}:1521/${PDBname}
spring.datasource.driverClassName=oracle.jdbc.driver.OracleDriver
```
