# Swagger UIをWeb上で表示

`swagger.json`をもとに、APIドキュメントをWeb上で閲覧できるようにします。

## 設定

[Swagger UI](https://github.com/swagger-api/swagger-ui/)の実装をもとにした下記ファイルを`index.html`として作成することで、nginxなどで閲覧することができます:

```html
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <title>API Documentation</title>

    <link
      rel="stylesheet"
      href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
    />
  </head>

  <body>
    <div id="swagger-ui"></div>

    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: "./swagger.json",
          dom_id: "#swagger-ui",
        });
      };
    </script>
  </body>
</html>
```
