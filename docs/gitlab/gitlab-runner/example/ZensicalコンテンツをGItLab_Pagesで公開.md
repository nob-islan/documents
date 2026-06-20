# ZensicalコンテンツをGItLab Pagesで公開

cf. https://zensical.org/docs/publish-your-site/#gitlab-pages

## ディレクトリ構成

プロジェクトのルートディレクトリに`zensical.toml`が配置されている前提とします:

```
.
├──docs
│   └──index.md
├── .gitlab-ci.yml
└──zensical.toml
```

## 設定ファイル

### `.gitlab-ci.yml`

デフォルトブランチにpushした際にrunnerが実行され、pagesが更新されます。

```yaml
stages:
  - deploy
image: python:slim
pages:
  stage: deploy
  script:
    - pip install zensical
    - zensical build --clean
  pages:
    publish: site
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```
