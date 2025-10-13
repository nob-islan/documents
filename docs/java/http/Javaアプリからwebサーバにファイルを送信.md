# Java アプリから web サーバにファイルを送信

Java アプリ内でファイルを作成、web サーバ上に格納します。

## 登場人物

- nginx サーバ
- Java アプリケーション

## 構築

### nginx サーバ

ディレクトリ構成は下記です：

```
root
  ├─docker-compose.yaml
  ├─Dockerfile
  └─volume
      └─default.conf
```

`default.conf`を下記で作成します。`# for file upload`のところ以外はデフォルトのままです。

```conf
server {
    listen       80;
    listen  [::]:80;
    server_name  localhost;

    #access_log  /var/log/nginx/host.access.log  main;

    location / {
        root   /usr/share/nginx/html;
        index  index.html index.htm;
    }

    # for file upload
    location /sample/file {
        root /var/www/data;
        client_body_temp_path /var/www/temp_data;
        dav_methods PUT DELETE MKCOL COPY MOVE;
        create_full_put_path on;
        dav_access group:rw all:r;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page   500 502 503 504  /50x.html;
    location = /50x.html {
        root   /usr/share/nginx/html;
    }

    # proxy the PHP scripts to Apache listening on 127.0.0.1:80
    #
    #location ~ \.php$ {
    #    proxy_pass   http://127.0.0.1;
    #}

    # pass the PHP scripts to FastCGI server listening on 127.0.0.1:9000
    #
    #location ~ \.php$ {
    #    root           html;
    #    fastcgi_pass   127.0.0.1:9000;
    #    fastcgi_index  index.php;
    #    fastcgi_param  SCRIPT_FILENAME  /scripts$fastcgi_script_name;
    #    include        fastcgi_params;
    #}

    # deny access to .htaccess files, if Apache's document root
    # concurs with nginx's one
    #
    #location ~ /\.ht {
    #    deny  all;
    #}
}
```

`Dockerfile`を下記で作成します。ファイル格納用のディレクトリを作成しています。

```Dockerfile
FROM nginx:stable

RUN mkdir -p /var/www/data /var/www/data_temp
RUN chown -R nginx /var/www/data /var/www/data_temp
```

`docker-compose.yaml`を下記で作成します。先に作成した設定ファイルをマウントしています。

```yaml
version: "3.7"
services:
  nginx:
    build: .
    container_name: nob-nginx
    ports:
      - 80:80
    volumes:
      - "./volume/default.conf:/etc/nginx/conf.d/default.conf"
```

### Java アプリケーション

`resources`配下の`application.properties`に下記を記載します：

```shell
# nginxのホスト
nginx.host=http://localhost:80/
# nginxのベースURL
nginx.base.url=sample/file
```

`AppConfig.java`を作成します。このクラスから`application.properties`の設定値を読み込むことができます：

```java
package com.example.javanginx.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import lombok.Getter;

/**
 * application.propertiesから設定値を読み込むクラスです。
 *
 */
@Component
@Getter
public class AppConfig {

    @Value("${nginx.host}")
    private String nginxHost;

    @Value("${nginx.base.url}")
    private String nginxBaseUrl;
}
```

サービスのインターフェースを下記で作成します：

```java
package com.example.javanginx.service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * nginxにファイルをアップロードするサンプルインターフェースです。
 *
 */
@RestController
@RequestMapping("/sample")
public interface NginxService {

    /**
     * ファイルをアップロードします。
     *
     * @return
     */
    @GetMapping(value = "file")
    String fileUpload();
}
```

サービスの実装クラスを下記で作成します：

```java
package com.example.javanginx.service.impl;

import java.io.OutputStream;
import java.io.PrintStream;
import java.net.HttpURLConnection;
import java.net.URL;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.javanginx.config.AppConfig;
import com.example.javanginx.service.NginxService;

/**
 * nginxにファイルをアップロードするサンプル実装クラスです。
 *
 */
@Service
public class NginxServiceImpl implements NginxService {

    @Autowired
    private AppConfig appConfig;

    /**
     * {@inheritDoc}
     *
     */
    @Override
    public String fileUpload() {

        // ファイルの内容を作成
        StringBuilder fileContent = new StringBuilder();
        fileContent.append("This is a test of file uploading!!! \n");

        // 返却値を宣言
        String response = "";
        try {
            // 保存先URLを作成
            String strUrl = appConfig.getNginxHost() + appConfig.getNginxBaseUrl() + "/" + "testfile.txt";
            URL url = new URL(strUrl);

            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("PUT");
            connection.setDoOutput(true);
            connection.setDoInput(true);
            connection.setUseCaches(false);
            connection.connect();

            OutputStream outputStream = connection.getOutputStream();

            PrintStream printStream = new PrintStream(outputStream);
            printStream.print(fileContent.toString());
            printStream.close();

            // レスポンスコードを取得
            int responseCode = connection.getResponseCode();
            response = "Result response code is " + responseCode;
        } catch (Exception e) {
            e.printStackTrace();
        }

        return response;
    }
}
```

## 起動、動作確認

- `docker compose up`で nginx サーバを起動、
- Java アプリケーションを起動

してから`curl http://localhost:8080/sample/file`を叩きます。

```
Nobs-MacBook-Air:java-nginx nob$ curl http://localhost:8080/sample/file
Result response code is 201
```

ファイルが正常に作成されていることが確認できます。

```
Nobs-MacBook-Air:~ nob$ docker exec -it nob-nginx cat /var/www/data/sample/file/testfile.txt
This is a test of file uploading!!!
```
