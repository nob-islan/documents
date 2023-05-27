# Java から Prometheus 向けのメトリクス作成

Java アプリ内でメトリクスを作成して Prometheus で収集します。

## ソース

エンドポイントの作成、各種設定ファイルの追記などは![promtheusでJavaアプリを監視する](../prometheus%E3%81%A7Java%E3%82%A2%E3%83%97%E3%83%AA%E3%82%92%E7%9B%A3%E8%A6%96%E3%81%99%E3%82%8B/README.md)を参照ください。

メトリクスおよび Prometheus 向けエンドポイントの作成例です：

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
