# はじめてのGitLab Runner

とりあえずパイプラインを動かす用です。

cf. https://docs.gitlab.com/tutorials/create_register_first_runner/

```yaml
stages:
  - build
  - test

job_build:
  stage: build
  script:
    - echo "Building the project"

job_test1:
  stage: test
  script:
    - echo "This is the first test"

job_test2:
  stage: test
  script:
    - echo "This is the second test"
```
