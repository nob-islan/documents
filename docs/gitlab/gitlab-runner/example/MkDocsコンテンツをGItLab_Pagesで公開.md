# MkDocsコンテンツをGItLab Pagesで公開

## ディレクトリ構成

プロジェクトのルートディレクトリにmkdocs.ymlが配置されている前提とします:

```
.
├──docs
│   └──index.md
├── .gitlab-ci.yml
└──mkdocs.yml
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
    - pip install mkdocs
    - pip install mkdocs-material
    - mkdocs build
    - mkdir public
    - mv site/* public/
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```
