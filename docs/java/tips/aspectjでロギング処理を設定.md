`# aspectjでロギング処理を設定

**aspectj** を用いてAPI開始・終了およびエラー発生時のログ出力処理を行うサンプルコードです。

cf. https://docs.spring.io/spring-framework/reference/core/aop/ataspectj.html

## 実装

### pom.xml

下記設定を依存関係を追加します:

```xml
		<!-- https://mvnrepository.com/artifact/org.springframework/spring-aop -->
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-aop</artifactId>
			<version>6.2.11</version>
		</dependency>
		<!-- https://mvnrepository.com/artifact/org.aspectj/aspectjweaver -->
		<dependency>
			<groupId>org.aspectj</groupId>
			<artifactId>aspectjweaver</artifactId>
			<version>1.9.24</version>
		</dependency>
```

### `ApiExecLogAspect.java`

下記実装によって、指定したタイミングでログを出力します:

- `apiStartLog`: API実行時
- `apiSuccessLog`: API正常終了時
- `apiErrorLog`: API異常終了時

いずれも`"within(nob.example.easyapp.controller.*..*)"`を指定しているため、各コントローラー内のメソッド動作時に呼ばれるようになっています。

```java
package nob.example.easyapp.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Value;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class ApiExecLogAspect {

    /**
     * API開始時のログを出力します。
     *
     * @param joinPoint メソッド情報
     */
    @Before("within(nob.example.easyapp.controller.*..*)")
    public void apiStartLog(JoinPoint joinPoint) {

        try {
            // ログのモデルを作成
            StartLog startLog = new StartLog(
                    joinPoint.getTarget().getClass().getName(), // クラス名
                    joinPoint.getSignature().getName(), // メソッド名
                    new ObjectMapper().writeValueAsString(joinPoint.getArgs())); // リクエスト

            log.info("Start: " + startLog);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    /**
     * startLogに出力するログのモデルです。
     */
    @Value
    private class StartLog {

        /** クラス名 */
        private String className;

        /** メソッド名 */
        private String methodName;

        /** リクエストモデル */
        private String request;
    }

    /**
     * API正常終了時のログ出力設定です。
     *
     * @param joinPoint メソッド情報
     */
    @AfterReturning(pointcut = "within(nob.example.easyapp.controller.*..*)", returning = "result")
    public void apiSuccessLog(JoinPoint joinPoint) {

        // ログのモデルを作成
        SuccessLog successLog = new SuccessLog(
                joinPoint.getTarget().getClass().getName(), // クラス名
                joinPoint.getSignature().getName()); // メソッド名

        log.info("End: " + successLog);
    }

    /**
     * successLogに出力するログのモデルです。
     */
    @Value
    private class SuccessLog {

        /** クラス名 */
        private String className;

        /** メソッド名 */
        private String methodName;
    }

    /**
     * API異常終了時のログ出力設定です。
     *
     * @param joinPoint メソッド情報
     * @param error
     */
    @AfterThrowing(pointcut = "within(nob.example.easyapp.controller.*..*)", throwing = "error")
    public void apiErrorLog(JoinPoint joinPoint, Throwable error) {

        // ログのモデルを作成
        ErrorLog errorLog = new ErrorLog(
                joinPoint.getTarget().getClass().getName(), // クラス名
                joinPoint.getSignature().getName(), // メソッド名
                error.toString()); // エラーメッセージ

        log.error("Error: " + errorLog);
    }

    /**
     * errorLogに出力するログのモデルです。
     */
    @Value
    private class ErrorLog {

        /** クラス名 */
        private String className;

        /** メソッド名 */
        private String methodName;

        /** エラーメッセージ */
        private String message;
    }
}
```
