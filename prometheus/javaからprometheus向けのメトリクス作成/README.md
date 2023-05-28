# Java から Prometheus 向けのメトリクス作成

Java アプリ内でメトリクスを作成して Prometheus で収集します。

## ソース

エンドポイントの作成、各種設定ファイルの追記などは[promtheus で Java アプリを監視する](../prometheus%E3%81%A7Java%E3%82%A2%E3%83%97%E3%83%AA%E3%82%92%E7%9B%A3%E8%A6%96%E3%81%99%E3%82%8B/README.md)を参照ください。

メトリクスおよび Prometheus 向けエンドポイントの作成例です：

### Counter

値の増加のみに対応したメトリクスです。

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

### Gauge

値の増減に対応したメトリクスです。

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
     * gaugeメトリクスの値をnumberの値に変更します。
     *
     * @return
     */
    @GetMapping(value = "/sample/{number}")
    public String increment(@PathVariable("number") Integer number) {

        // numberが偶数であればfirstを、奇数であればsecondを更新します。
        if (number % 2 == 0) {
            this.removeOldGauge("nobtest", "type", "first");
            meterRegistry.gauge("nobtest", Tags.of("type", "first"), number);
        } else {
            this.removeOldGauge("nobtest", "type", "second");
            meterRegistry.gauge("nobtest", Tags.of("type", "second"), number);
        }

        return "success the api";
    }

    /**
     * 古いgaugeを削除します。
     *
     * @param name
     * @param tag
     */
    private void removeOldGauge(String name, String tagKey, String tagValue) {

        // タグ指定でメトリクスを検索し、ヒットしたら削除します。
        Gauge gauge = meterRegistry.find(name).tag(tagKey, tagValue).gauge();
        if (gauge != null) {
            meterRegistry.remove(gauge);
        }
    }
}
```
