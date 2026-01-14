# Spring Batch プロジェクトセットアップ

Spring Boot で実装するバッチプロジェクトの初期セットアップ方法について記載します。

cf.

- https://spring.io/guides/gs/batch-processing
- https://docs.spring.io/spring-batch/reference/readers-and-writers/database.html

## プロジェクト作成

cf. https://docs.spring.io/initializr/docs/0.9.1/reference/html/#command-line

- [Spring initializer](https://start.spring.io/) を使ってプロジェクトを新規作成します。

```shell
curl https://start.spring.io/starter.zip \
  -d javaVersion=21 \
  -d dependencies=batch,lombok,mariadb,data-jpa \
  -d type=maven-project \
  -d language=java \
  -d name=easybatch \
  -d groupId=nob.example \
  -d artifactId=easybatch \
  -o easybatch.zip
```

- zip を解凍します。

```shell
unzip easybatch.zip && rm -rf easybatch.zip
```

## 実装

サンプルコードを掲載します。`sign_up` テーブルの `first_name`, `last_name` を結合して `customer` テーブルに `full_name` を登録するバッチジョブを実装します。

### 事前準備

データベースを docker で構築し、Java プロジェクト側に接続情報を記載します。

#### docker-compose.yaml

```yaml
services:
  eadb:
    image: mariadb:latest
    container_name: ebdb
    ports:
      - 3306:3306
    volumes:
      - ./volumes/initdb.d:/docker-entrypoint-initdb.d
    environment:
      - MYSQL_ROOT_PASSWORD=password
```

#### volumes/initdb.d/create-database.sql

```sql
CREATE DATABASE ebdb;
USE ebdb;

CREATE TABLE sign_up (
    last_name VARCHAR(24) NOT NULL
    , first_name VARCHAR(24) NOT NULL
    , age INT NOT NULL
);

CREATE TABLE customer (
    id INT PRIMARY KEY AUTO_INCREMENT
    , full_name VARCHAR(48) NOT NULL
    , age INT NOT NULL
);

INSERT INTO sign_up (
    last_name
    , first_name
    , age
) VALUES (
    'snail'
    , 'nob01'
    , 13
), (
    'snail'
    , 'nob02'
    , 13
);
```

#### src/main/resources/application.properties

```shell
# MariaDBのドライバ設定
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver
# 接続用URL
spring.datasource.url=jdbc:mariadb://localhost/ebdb
# ユーザ名
spring.datasource.username=root
# パスワード
spring.datasource.password=password
```

### ディレクトリ構成

作成が必要なもののみ記載しています。

```shell
.
├── config
│   └── BatchConfig.java                    # Batchに関するコンフィグを定義
├── entity                                  # データベースのテーブル定義に対応するエンティティ
│   ├── Customer.java
│   └── SignUp.java
└── job                                     # 各種ジョブ定義
    └── customerregist
        ├── CustomerRegistConfig.java       # ジョブ処理に用いる各種Beanの生成
        ├── CustomerRegistJobOperator.java  # ジョブの実行計画を定義
        ├── CustomerRegistListener.java     # ジョブの開始・終了時の処理を定義
        ├── CustomerRegistProcessor.java    # ジョブのビジネスロジックを実装
        ├── CustomerRegistReader.java       # ジョブに用いるデータの抽出
        └── CustomerRegistWriter.java       # ジョブの成果物を登録
```

### クラス一覧

#### config/BatchConfig.java

バッチ実行に関するコンフィグを定義します。

```java
package nob.example.easybatch.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * バッチ実行に関するコンフィグクラスです。
 *
 * @author nob
 */
@Configuration
@EnableScheduling // 定期実行可能であることを宣言
public class BatchConfig {
}
```

#### entity/SignUp.java

バッチ処理の入力値となる `sign_up` テーブルに対応するエンティティを定義します。

```java
package nob.example.easybatch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * sign_upテーブルのエンティティクラスです。
 *
 * @author nob
 */
@Table(name = "sign_up")
@Entity
@Data
public class SignUp {

    /** 管理ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "PRIMARY KEY", length = 11, nullable = false)
    private Integer id;

    /** 姓 */
    @Column(name = "last_name", length = 24, nullable = false)
    private String lastName;

    /** 名 */
    @Column(name = "first_name", length = 24, nullable = false)
    private String firstName;

    /** 年齢 */
    @Column(name = "age", length = 11, nullable = false)
    private Integer age;
}
```

#### entity/Customer.java

バッチ処理の出力となる `customer` テーブルに対応するエンティティを定義します。

```java
package nob.example.easybatch.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**
 * customerテーブルのエンティティクラスです。
 *
 * @author nob
 */
@Table(name = "customer")
@Entity
@Getter
@Setter
@AllArgsConstructor
public class Customer {

    /** 管理ID */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "PRIMARY KEY", length = 11, nullable = false)
    private Integer id;

    /** フルネーム */
    @Column(name = "full_name", length = 48, nullable = false)
    private String fullName;

    /** 年齢 */
    @Column(name = "age", length = 11, nullable = false)
    private Integer age;
}
```

#### job/customerregist/CustomerRegistJobOperator.java

ジョブの実行計画を定義します。

```java
package nob.example.easybatch.job.customerregist;

import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.parameters.JobParametersBuilder;
import org.springframework.batch.core.launch.JobOperator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 顧客登録ジョブの実行計画を定義するクラスです。
 *
 * @author nob
 */
@Component
public class CustomerRegistJobOperator {

    @Autowired
    private JobOperator jobOperator;

    @Autowired
    private Job customerRegist;

    @Scheduled(cron = "0 * * * * *")
    public void run() throws Exception {
        jobOperator.run(customerRegist, new JobParametersBuilder()
                .addLong("time", System.currentTimeMillis())
                .toJobParameters());
    }
}
```

#### job/customerregist/CustomerRegistListener.java

ジョブ開始時および終了時に行う処理を実装します。

```java
package nob.example.easybatch.job.customerregist;

import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.job.JobExecution;
import org.springframework.batch.core.listener.JobExecutionListener;

import lombok.extern.slf4j.Slf4j;

/**
 * 顧客登録ジョブの開始時、終了時の処理を実装するクラスです。
 *
 * @author nob
 */
@Slf4j
public class CustomerRegistListener implements JobExecutionListener {

    @Override
    public void beforeJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.STARTED) {
            log.info("!!! JOB STARTED");
        }
    }

    @Override
    public void afterJob(JobExecution jobExecution) {
        if (jobExecution.getStatus() == BatchStatus.COMPLETED) {
            log.info("!!! JOB FINISHED! Time to verify the results");
        }
    }
}
```

#### job/customerregist/CustomerRegistReader.java

入力元のテーブルからのデータ抽出処理を実装します。

```java
package nob.example.easybatch.job.customerregist;

import javax.sql.DataSource;

import org.springframework.batch.infrastructure.item.database.JdbcCursorItemReader;
import org.springframework.batch.infrastructure.item.database.builder.JdbcCursorItemReaderBuilder;
import org.springframework.jdbc.core.BeanPropertyRowMapper;

import nob.example.easybatch.entity.SignUp;

/**
 * インプット情報を抽出するクラスです。
 *
 * @author nob
 */
public class CustomerRegistReader {

    public static JdbcCursorItemReader<SignUp> create(DataSource dataSource) {

        // Readerの名称
        final String READER_NAME = "customerRegistReader";
        // 実行SQL
        final String SQL = "SELECT last_name, first_name, age FROM sign_up";

        return new JdbcCursorItemReaderBuilder<SignUp>()
                .dataSource(dataSource)
                .sql(SQL)
                .name(READER_NAME)
                .rowMapper(new BeanPropertyRowMapper<>(SignUp.class))
                .build();
    }
}
```

#### job/customerregist/CustomerRegistProcessor.java

ビジネスロジックを実装します。

```java
package nob.example.easybatch.job.customerregist;

import org.springframework.batch.infrastructure.item.ItemProcessor;

import nob.example.easybatch.entity.Customer;
import nob.example.easybatch.entity.SignUp;

/**
 * 顧客登録ジョブのビジネスロジックを実装するクラスです。
 *
 * @author nob
 */
public class CustomerRegistProcessor implements ItemProcessor<SignUp, Customer> {

    @Override
    public Customer process(SignUp signUp) throws Exception {

        // 登録情報の姓・名を結合して顧客情報を作成
        return new Customer(null, signUp.getLastName() + signUp.getFirstName(), signUp.getAge());
    }
}
```

#### job/customerregist/CustomerRegistWriter.java

業務処理による成果物の登録処理を実装します。

```java
package nob.example.easybatch.job.customerregist;

import javax.sql.DataSource;

import org.springframework.batch.infrastructure.item.database.JdbcBatchItemWriter;
import org.springframework.batch.infrastructure.item.database.builder.JdbcBatchItemWriterBuilder;

import nob.example.easybatch.entity.Customer;

/**
 * アウトプット情報を出力するクラスです。
 *
 * @author nob
 */
public class CustomerRegistWriter {

    /** 実行SQL */
    private static final String SQL = "INSERT INTO customer (full_name, age) VALUES (:fullName, :age)";

    public static JdbcBatchItemWriter<Customer> create(DataSource dataSource) {
        return new JdbcBatchItemWriterBuilder<Customer>()
                .sql(SQL)
                .dataSource(dataSource)
                .beanMapped()
                .build();
    }
}
```

#### job/customerregist/CustomerRegistConfig.java

各種インスタンスの Bean 登録などジョブのコンフィグを宣言します。

```java
package nob.example.easybatch.job.customerregist;

import javax.sql.DataSource;

import org.springframework.batch.core.configuration.annotation.EnableBatchProcessing;
import org.springframework.batch.core.job.Job;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.Step;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.infrastructure.item.database.JdbcBatchItemWriter;
import org.springframework.batch.infrastructure.item.database.JdbcCursorItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import nob.example.easybatch.entity.Customer;
import nob.example.easybatch.entity.SignUp;

/**
 * 顧客登録ジョブのコンフィグクラスです。
 *
 * @author nob
 */
@Configuration
@EnableBatchProcessing
public class CustomerRegistConfig {

    @Bean
    Job customerRegist(JobRepository jobRepository, CustomerRegistListener customerRegistListener,
            Step customerRegistStep) {
        return new JobBuilder("customerRegist", jobRepository)
                .listener(customerRegistListener)
                .start(customerRegistStep)
                .build();
    }

    @Bean
    Step customerRegistStep(JobRepository jobRepository, JdbcCursorItemReader<SignUp> customerRegistReader,
            CustomerRegistProcessor customerRegistProcessor, JdbcBatchItemWriter<Customer> customerRegistWriter) {
        return new StepBuilder("customerRegistStep", jobRepository)
                .<SignUp, Customer>chunk(3)
                .reader(customerRegistReader)
                .processor(customerRegistProcessor)
                .writer(customerRegistWriter)
                .build();
    }

    @Bean
    CustomerRegistListener customerRegistListener() {
        return new CustomerRegistListener();
    }

    @Bean
    JdbcCursorItemReader<SignUp> customerRegistReader(DataSource dataSource) {
        return CustomerRegistReader.create(dataSource);
    }

    @Bean
    CustomerRegistProcessor customerRegistProcessor() {
        return new CustomerRegistProcessor();
    }

    @Bean
    JdbcBatchItemWriter<Customer> customerRegistWriter(DataSource dataSource) {
        return CustomerRegistWriter.create(dataSource);
    }
}
```

## 起動

下記コマンドでアプリを起動します。

```shell
./mvnw spring-boot:run
```

下記コマンドで `customer` テーブルにデータが入っていることを確認できます。

```
$ docker exec -it ebdb mariadb -u root -p ebdb -e "SELECT * FROM customer;"
Enter password:
+----+------------+-----+
| id | full_name  | age |
+----+------------+-----+
|  1 | snailnob01 |  13 |
|  2 | snailnob02 |  13 |
+----+------------+-----+
```
