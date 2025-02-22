# Go で Gemini API を実行

Gemini API キーを取得し、golang のライブラリを使って API を叩けるようにします。

## 手順

cf. https://ai.google.dev/gemini-api/docs/api-key?hl=ja

### API キー発行

cf. https://aistudio.google.com/app/apikey?hl=ja

### curl 打鍵

```shell
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=GEMINI_API_KEY" \
-H 'Content-Type: application/json' \
-X POST \
-d '{
  "contents": [{
    "parts":[{"text": "Explain how AI works"}]
    }]
   }'
```

### go で Gemini API をリクエスト

cf.

- https://ai.google.dev/gemini-api/docs/quickstart?hl=ja&lang=go
- https://github.com/google/generative-ai-go/blob/7276bbc8524c52eed98d38f2169d14dab9d3289f/genai/internal/samples/docs-snippets_test.go

<details><summary>サンプルコード</summary>

```go
package main

import (
	"context"
	"fmt"
	"log"

	"google.golang.org/api/option"

	"github.com/google/generative-ai-go/genai"
)

func main() {

	ctx := context.Background()
	client, err := genai.NewClient(
		ctx,
		option.WithAPIKey("{APIキー}"),
	)
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")
	res, err := model.GenerateContent(ctx, genai.Text("Geminiについて説明してください。"))
	if err != nil {
		log.Fatal(err)
	}

	printResponse(res)
}

func printResponse(res *genai.GenerateContentResponse) {
	for _, cand := range res.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				fmt.Println(part)
			}
		}
	}
	fmt.Println("---")
}
```
