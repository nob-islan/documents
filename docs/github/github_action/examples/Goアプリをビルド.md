# Go アプリをビルド

GitHub Actions を使って Go アプリケーションをビルドし、コンテナイメージとしてレジストリに push します。

## 設定

cf.

- [Go build and test](https://docs.github.com/ja/actions/tutorials/build-and-test-code/go)
- [Publish docker image](https://docs.github.com/ja/actions/tutorials/publish-packages/publish-docker-images)

タグが切られた際に下記を実行します:

- 指定したパッケージ配下のテスト実行
- モジュールビルド
- コンテナイメージのビルド、レジストリへの push

```yml
name: Go
on:
  release:
    types: [published]
env:
  module: easyapp # GOアプリケーションのモジュール名
jobs:
  test:
    name: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: "1.23"
      - name: Test with the Go CLI
        run: |
          cd ${module}
          go install gotest.tools/gotestsum@latest
          gotestsum --junitfile report.xml -- -coverprofile=coverage.txt ./internal/handler ./internal/usecase ./internal/infrastructure/repository
          go tool cover -html=coverage.txt -o coverage.html
          go tool cover -func=coverage.txt
      - name: Upload Go test results
        uses: actions/upload-artifact@v4
        with:
          name: Go-test-coverage
          path: ${{ env.module }}/coverage.html
  build:
    name: build
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: "1.23"
      - name: Build
        run: |
          cd ${module}
          go build cmd/main.go
          mv ./main ../
      - name: Log in to Docker Hub
        uses: docker/login-action@65b78e6e13532edd9afa3aa52ac7964289d1a9c1
        with:
          registry: ${{ secrets.HARBOR_REGISTORY }}
          username: ${{ secrets.HARBOR_USERNAME }}
          password: ${{ secrets.HARBOR_PASSWORD }}
      - name: Build and push Docker images
        id: push
        uses: docker/build-push-action@3b5e8027fcad23fda98b2e3ac259d8d67585f671
        with:
          context: .
          push: true
          tags: ${{ secrets.HARBOR_REGISTORY }}/${{ secrets.HARBOR_PROJECT }}/${{ env.module }}:${{ github.ref_name }}
```

## FIXME

- プライベートレジストリへの疎通ができていません。ジョブが harbor が乗っているローカルネットワークとは異なるそれ上で動いているようで、curl からして通らない状態です。
