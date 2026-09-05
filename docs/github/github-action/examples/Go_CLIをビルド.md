# Go CLIをビルド

GitHub Actionsを使ってGoのCLIアプリをビルドします。

## 設定

cf.

- [Upload release asset](https://github.com/actions/upload-release-asset)
- [Matrix](https://docs.github.com/ja/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations)

リリースタグが切られた時点でモジュールのビルドおよび成果物のリリースへの配置が実行されます。Settings > Actions > General > Workflow permissionsでread and write権限を与えないと`Resource not accessible by integration`が起きるので注意してください。

### `.github/workflows/build.yaml`

```yaml
name: Go
on:
  release:
    types: [published]
jobs:
  build:
    name: build
    runs-on: ubuntu-latest
    env:
      module: easycli
    strategy:
      matrix:
        os: [linux, macOS]
        include:
          - os: linux
            goos: linux
            goarch: amd64
            suffix: linux_amd64
          - os: macOS
            goos: darwin
            goarch: arm64
            suffix: macOS_arm64
    steps:
      - uses: actions/checkout@v4
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: "1.26"
      - name: Build
        run: |
          GOOS=${{ matrix.goos }} GOARCH=${{ matrix.goarch }} go build -o ${module}_${{ github.ref_name }}_${{ matrix.suffix }} cmd/${module}/main.go
      - name: Upload Release Asset
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # This token is provided by Actions, you do not need to create your own token
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: ${{ env.module }}_${{ github.ref_name}}_${{ matrix.suffix }}
          asset_name: ${{ env.module }}_${{ github.ref_name}}_${{ matrix.suffix }}
          asset_content_type: application/octet-stream
```
