# Spring Batch で Prometheus 向けメトリクスを作成

Spring Batch フレームワークを使って Prometheus で扱えるメトリクスを作成します。

## 構築手順

### PushGateway

Spring Batch はエンドポイントを持たないため、java で作ったメトリクスを Prometheus がプルできるように別途エンドポイントを用意する必要があります。
下記`docker-compose.yaml`で PushGateway を起動すると、後述のバッチ処理で作られたメトリクスを取得する用のエンドポイントを提供してくれます:

```yaml
services:
  pushgateway:
    container_name: nob-pushgateway
    image: prom/pushgateway:latest
    ports:
      - 9091:9091
```

### Spring Batch

cf. https://prometheus.github.io/client_java/exporters/pushgateway/

`pom.xml`に PushGateway 向けの依存関係を追加します:

```xml
<!-- https://mvnrepository.com/artifact/io.prometheus/prometheus-metrics-core -->
<dependency>
    <groupId>io.prometheus</groupId>
    <artifactId>prometheus-metrics-core</artifactId>
    <version>1.3.4</version>
</dependency>

<dependency>
    <groupId>io.prometheus</groupId>
    <artifactId>prometheus-metrics-exporter-pushgateway</artifactId>
    <version>1.3.5</version>
</dependency>
```

`PushGateway`クラスを Bean として宣言するコンフィグクラスを作成します:

```java
@Configuration
public class PushGatewayConfig {

    /**
     * PushGatewayのアドレス
     */
    private static final String PUSH_GATEWAY_ADDRESS = "localhost:9091";

    @Bean
    PushGateway pushGateway() {
        return PushGateway.builder()
                .address(PUSH_GATEWAY_ADDRESS)
                .job("first-batch")
                .build();
    }
}
```

Writer クラスにてメトリクスの作成処理を実装します:

```java
public class SampleMetricsWriter implements ItemWriter<Long> {

    @Autowired
    private PushGateway pushGateway;

    private static Gauge gauge = Gauge.builder()
            .name("data_processed")
            .help("data processed in the last batch job run")
            .labelNames("test1", "test2") // ラベルのキー
            .register();

    @Override
    public void write(Chunk<? extends Long> chunk) throws Exception {

        try {
            gauge.labelValues("value1", "value2").set(Long.valueOf(chunk.getItems().get(0))); // ラベルの値およびメトリクスの値
        } finally {
            pushGateway.push();
        }
    }
}
```

## 動作確認手順

PushGateway を起動した上で Spring Batch を動かすと、上の例であれば`localhost:9091`で PushGateway のページが確認できます。
また、`localhost:9091/metrics`にてメトリクスが取得できます。
