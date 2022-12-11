# CSVファイルからのテストデータ挿入手順
UTに使うテストデータをcsvファイルから投入できるようにする。現状テーブルはあらかじめ作成しておく必要があるので注意。

## 前提
- Spring Bootプロジェクトを用意
- MyBatis等を使ってDBに接続できている

## 手順

### 依存関係
下記を`pom.xml`に追記する。
```xml
<!-- テストデータ作成用 -->
<dependency>
    <groupId>org.dbunit</groupId>
    <artifactId>dbunit</artifactId>
    <version>2.6.0</version>
</dependency>
```

### ディレクトリ構成
```
${component} #dao, logicなど
  ├─dbdata
  │  ├─testClass1
  │  │  ├─table1.csv
  │  │  └─table-ordering.txt
  │  └─testClass2
  │     ├─table2.csv
  │     └─table-ordering.txt
  ├─TestClass1.java
  └─TestClass2.java
```
`table-ordering.txt`には、挿入するテーブル名を列挙する。

### ソースコード
各テストクラスに下記メソッドを追加
```java
    @BeforeEach
    private void testConfig() throws Exception {

        // テストデータ作成
        TestConfig.testDataSetup(Component.Dao, "usersDaoImplTest");  
    }
```
`Component`は`Dao`, `Logic`などを定義した定数。

`TestConfig#testDataSetup`は下記で実装する。
```java
    public static void testDataSetup(Component component, String testDataDir) throws Exception {

        // データベース名
        final String DATABASE_NAME = "snaildb";
        // プロジェクト名
        final String PROJECT_NAME = "firstrestapi";

        // テスト用csvデータのファイルパス
        final String TESTDATA_BASIC_PATH = "src/test/java/com/example/" + PROJECT_NAME + "/" + component + "/dbdata/";
        // DBの接続情報
        final String DATABASE_URL = "jdbc:mariadb://localhost:3306/" + DATABASE_NAME;
        final String DATABASE_USER_NAME = "root";
        final String DATABASE_PASSWORD = "password";

        // DBコネクション取得
        Connection connection = DriverManager.getConnection(DATABASE_URL, DATABASE_USER_NAME,
                DATABASE_PASSWORD);
        IDatabaseConnection databaseConnection = new MySqlConnection(connection, DATABASE_NAME);

        // csv用データセット作成
        IDataSet dataset = new CsvDataSet(new File(TESTDATA_BASIC_PATH + testDataDir));

        // データの削除、挿入
        DatabaseOperation.CLEAN_INSERT.execute(databaseConnection, dataset);
    }
```
データベース名、プロジェクト名、DBのユーザ名、パスワードはプロジェクトによって変える。

### テストデータ
CSVは下記の要領で作成する。
```csv
user_id,user_name,age,remarks
1,nob,29,test data
2,snail,31,test data2
```
