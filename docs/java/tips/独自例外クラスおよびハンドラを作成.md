# 独自例外クラスおよびハンドラを作成

自作の例外クラスを作成し、ハンドラによってエラーメッセージを API レスポンスとして返却します。

- 例外クラス

```java
package nob.example.firstapp.exception;

/**
 * サンプルの自作例外クラスです。
 *
 */
public class SampleException extends Exception {

    public SampleException(String message) {
        super(message);
    }
}
```

- 例外ハンドラ

```java
package nob.example.firstapp.handler;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.Data;
import nob.example.firstapp.exception.SampleException;

/**
 * サンプル例外のハンドラです。
 *
 */
@RestControllerAdvice
public class SampleExceptionHandler {

    /**
     * サンプル例外が投げられた際に呼ばれるメソッドです。
     *
     * @param e
     * @return 例外メッセージ
     */
    @SuppressWarnings({ "unchecked", "rawtypes" })
    @ExceptionHandler(SampleException.class) // SampleExceptionが投げられた際に動く
    public ResponseEntity<ResponseBody> sampleExceptionHandle(SampleException e) {

        ResponseBody responseBody = new ResponseBody();
        responseBody.setMessage(e.getMessage());

        return new ResponseEntity(responseBody, HttpStatus.UNPROCESSABLE_ENTITY);
    }

    /**
     * サンプル例外発生時のレスポンスボディです。
     *
     */
    @Data
    private class ResponseBody {

        /**
         * エラーメッセージ
         */
        private String message;
    }
}
```

上記で例外クラスおよびハンドラを実装し、下記のように例外を投げると

```java
/**
 * サンプル例外を投げるメソッドです。
 *
 * @throws SampleException
 */
public void error() throws SampleException {

    throw new SampleException("テスト例外です。");
}
```

以下のように API レスポンスが返却されます:

```
$ curl localhost:8080/api/sample/error
{"message":"テスト例外です。"}
```
