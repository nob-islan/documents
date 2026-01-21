# カスタムItemReader, ItemWriterを作成

SQL発行に限らず、汎用的な処理を実装するためのItemReader, ItemWriterの作成方法を記載します。

## サンプルコード

### ItemReader

#### `ItemReader.java``

```java
package nob.example.easybatch.job.customerregist;

import org.springframework.batch.infrastructure.item.ItemReader;
import org.springframework.batch.infrastructure.item.NonTransientResourceException;
import org.springframework.batch.infrastructure.item.ParseException;
import org.springframework.batch.infrastructure.item.UnexpectedInputException;

/**
 * インプット情報を抽出するクラスです。
 *
 * @author nob
 */
public class NobItemReader implements ItemReader<Integer> {

    /** データがすでに提供されたかどうかを管理するフラグ */
    private boolean dataProvided = false;

    @Override
    public Integer read() throws Exception, UnexpectedInputException, ParseException, NonTransientResourceException {
        if (dataProvided) {
            return null; // 終了を通知してループを防ぐ
        }

        // ここに処理実装

        dataProvided = true;
        return 0;
    }
}
```

#### `Config.java``

```java
    @Bean
    @StepScope // ジョブ実行ごとにインスタンスがリセットされるようにする
    NobItemReader nobItemReader() {
        return new NobItemReader();
    }
```

### ItemWriter

#### `IterWriter.java``

```java
package nob.example.easybatch.job.customerregist;

import org.springframework.batch.infrastructure.item.Chunk;
import org.springframework.batch.infrastructure.item.ItemWriter;

import nob.example.easybatch.entity.Customer;

/**
 * アウトプット情報を出力するクラスです。
 *
 * @author nob
 */
public class NobItemWriter implements ItemWriter<Customer> {

    @Override
    public void write(Chunk<? extends Customer> chunk) throws Exception {
        // ここに処理実装
    }
}
```

#### `Config.java`

```java
    @Bean
    NobItemWriter nobItemWriter() {
        return new NobItemWriter();
    }
```
