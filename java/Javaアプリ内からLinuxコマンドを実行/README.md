# Java アプリ内から Linux コマンドを実行

`ProcessBuilder`を使って、Java アプリから Linux のコマンドを実行して結果を取得します。

## サンプルコード

例として、`curl`コマンドで別途用意した API`/metrics/sample/{number}`をキックします。

```java
/**
 * curlのテスト用クラスです。
 *
 */
@RestController
@RequestMapping("/curl")
public class CurlTest {

    private final String CURL = "curl ";
    private final String HTTP_DOMAIN = "http://localhost:8080";
    private final String API_BASE = "/metrics";
    private final String API_METHOD = "/sample";

    /**
     * curlテスト用
     *
     */
    @GetMapping(value = "/sample/{number}")
    public String testCurl(@PathVariable("number") Integer number) throws Exception {

        // プロセスインスタンスの作成
        ProcessBuilder pb = new ProcessBuilder("/bin/sh", "-c",
                CURL + HTTP_DOMAIN + API_BASE + API_METHOD + "/" + number);
        // 実行
        Process process = pb.start();

        // 結果の出力
        String result = "";
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(process.getInputStream(), Charset.defaultCharset()))) {
            String line;
            while ((line = br.readLine()) != null) {
                result = result + line;
            }
        }

        return result;
    }
}
```
