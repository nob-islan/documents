# Java から Prometheus 向けのメトリクス作成

Java アプリ内でメトリクスを作成して Prometheus で収集します。

## ソース

- `pom.xml`に下記を追加します。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

- Prometheus 向けエンドポイントの作成例です：

```java
/**
 * prometheusのメトリクスを定義するクラスです。
 *
 */
@RestController
@RequestMapping("/metrics")
public class SampleMetrics {

    @Autowired
    MeterRegistry meterRegistry;

    /**
     * counterメトリクスをインクリメントさせます。
     *
     * @return
     */
    @GetMapping(value = "/sample/{number}")
    public String increment(@PathVariable("number") Integer number) {

        if (number < 1) {
            Counter emptyCounter = meterRegistry.counter("nobtest", "type", "first");
            emptyCounter.increment();
        } else {
            Counter emptyCounter = meterRegistry.counter("nobtest", "type", "second");
            emptyCounter.increment();
        }

        return "success to increment";
    }
}
```

Prometheus を起動すると、`nobtest`のメトリクスが収集できます。
