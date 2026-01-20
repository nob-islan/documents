# nginxサーバでファイルをアップロード、ダウンロードする

`curl`を使ってファイルをアップロードしたり、ダウンロードしたりできるようにする設定です。

## 設定

`default.conf`を下記で作成します。今回は`/var/nob/data`配下にファイルを保存するように設定しています。あらかじめこのディレクトリを作成しておかないとエラーになるので注意してください。

```diff
 server {
     listen       80;
     listen  [::]:80;
     server_name  localhost;

     #access_log  /var/log/nginx/host.access.log  main;

     location / {
+        root /var/nob/data;
+        client_body_temp_path /var/nob/temp_data;
+        dav_methods PUT DELETE MKCOL COPY MOVE;
+        create_full_put_path on;
+        dav_access group:rw all:r;
     }

     #error_page  404              /404.html;

     # redirect server error pages to the static page /50x.html
     #
     error_page   500 502 503 504  /50x.html;
     location = /50x.html {
         root   /usr/share/nginx/html;
     }
}
```

## 動作確認

### ファイルアップロード

`/var/nob/data`配下に`localtest.txt`を配置します。

```shell
curl -X PUT -F upfile=./localtest.txt http://localhost:80/localtest.txt
```

### ファイルダウンロード

ローカルに`nobtest.txt`をダウンロードします。

```shell
curl -O http://localhost:80/nobtest.txt
```
