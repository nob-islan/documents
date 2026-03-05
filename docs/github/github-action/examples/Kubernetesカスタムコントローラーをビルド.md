# Kubernetesカスタムコントローラーをビルド

GitHub Actionsを使ってKubernetesのカスタムコントローラーをビルドし、コンテナイメージとしてレジストリにpushします。また、コントローラー起動用のマニフェストをリリース成果物として公開します。

## 設定

リリースタグが切られた際に下記を実行します:

- テスト実行
- コンテナイメージのビルド、レジストリへのpush
- マニフェストファイルの作成、リリース成果物としての公開

### `.github/workflows/build.yaml`

```yaml
name: Kubernetes custom controller
on:
  release:
    types: [published]
env:
  controller: nob-controller # コントローラー名
jobs:
  test:
    name: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: "1.25"
      - name: Test with the Go CLI
        run: |
          go install gotest.tools/gotestsum@latest
          make test
  build:
    name: build
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Log in to Docker Hub
        uses: docker/login-action@65b78e6e13532edd9afa3aa52ac7964289d1a9c1
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - name: Build and push Docker images
        id: push
        uses: docker/build-push-action@3b5e8027fcad23fda98b2e3ac259d8d67585f671
        with:
          context: .
          push: true
          tags: ${{ secrets.DOCKER_REPOSITORY }}/${{ env.controller }}:${{ github.ref_name }}
      - name: Create manifest files
        run: |
          curl -s https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh | bash
          mv kustomize /usr/local/bin/
          cd config/manager && kustomize edit set image controller=${{ secrets.DOCKER_REPOSITORY }}/${{ env.controller }}:${{ github.ref_name }}
          cd ../../ && mkdir deploy
          kustomize build config/default > deploy/${{ env.controller }}.yaml
      - name: Upload manifest files
        uses: actions/upload-release-asset@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # This token is provided by Actions, you do not need to create your own token
        with:
          upload_url: ${{ github.event.release.upload_url }}
          asset_path: deploy/${{ env.controller }}.yaml
          asset_name: ${{ env.controller }}.yaml
          asset_content_type: application/octet-stream
```
