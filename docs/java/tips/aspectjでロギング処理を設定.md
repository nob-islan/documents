# aspectjでロギング処理を設定

[aspectj](https://docs.spring.io/spring-framework/reference/core/aop/ataspectj.html)を用いてAPI開始・終了およびエラー発生時のログ出力処理を行うサンプルコードです。

## 実装

### `pom.xml`

下記設定を依存関係を追加します:

```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-aspectj</artifactId>
		</dependency>
```

### `ApiExecLogAspect.java`

下記実装によって、指定したタイミングでログを出力します:

- `apiStartLog`: API実行時
- `apiSuccessLog`: API正常終了時
- `apiErrorLog`: API異常終了時

いずれも`"execution(* nob.example.easyapp.controller..*(..))"`を指定しているため、各コントローラー内のメソッド動作時に呼ばれるようになっています。

```java
package nob.example.easyapp.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Aspect
@Component
@Slf4j
public class ApiExecLogAspect {

    /**
     * API開始時のログを出力します。
     *
     * @param joinPoint メソッド情報
     */
    @Before("execution(* nob.example.easyapp.controller..*(..))")
    public void apiStartLog(JoinPoint joinPoint) {

        /**
         * API開始時のログのモデルです。
         *
         * @param className  クラス名
         * @param methodName メソッド名
         * @param request    リクエストモデル
         */
        record StartLog(String className, String methodName, String request) {
        }

        try {
            StartLog startLog = new StartLog(
                    joinPoint.getTarget().getClass().getName(),
                    joinPoint.getSignature().getName(),
                    new ObjectMapper().writeValueAsString(joinPoint.getArgs()));

            log.info("Start: " + startLog);
        } catch (JacksonException e) {
            e.printStackTrace();
        }
    }

    /**
     * API正常終了時のログ出力設定です。
     *
     * @param joinPoint メソッド情報
     */
    @AfterReturning(pointcut = "execution(* nob.example.easyapp.controller..*(..))")
    public void apiSuccessLog(JoinPoint joinPoint) {

        /**
         * API正常終了時のログのモデルです。
         *
         * @param className  クラス名
         * @param methodName メソッド名
         */
        record SuccessLog(String className, String methodName) {
        }

        SuccessLog successLog = new SuccessLog(
                joinPoint.getTarget().getClass().getName(), // クラス名
                joinPoint.getSignature().getName()); // メソッド名

        log.info("End: " + successLog);
    }

    /**
     * API異常終了時のログ出力設定です。
     *
     * @param joinPoint メソッド情報
     * @param error
     */
    @AfterThrowing(pointcut = "execution(* nob.example.easyapp.controller..*(..))", throwing = "error")
    public void apiErrorLog(JoinPoint joinPoint, Throwable error) {

        /**
         * API異常終了時のログのモデルです。
         *
         * @param className    クラス名
         * @param methodName   メソッド名
         * @param errorMessage エラーメッセージ
         */
        record ErrorLog(String className, String methodName, String errorMessage) {
        }

        ErrorLog errorLog = new ErrorLog(
                joinPoint.getTarget().getClass().getName(), // クラス名
                joinPoint.getSignature().getName(), // メソッド名
                error.toString()); // エラーメッセージ

        log.error("Error: " + errorLog);
    }
}
```
