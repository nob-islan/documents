# GitLab RunnerをKubernetes executorで動かす

GitLabを[Kubernetes executor](https://docs.gitlab.com/runner/executors/kubernetes/)で動かすための設定手順です。

cf.

- https://docs.gitlab.com/runner/install/kubernetes/
- https://docs.gitlab.com/ci/docker/using_buildkit/

## 手順

- `values.yaml`を作成します:

```yaml
gitlabUrl: { GitLab URL }
runnerToken: { GitLab Runner token }
rbac:
  create: true

runners:
  config: |
    [[runners]]
      name = "k8s-runner"
      executor = "kubernetes"

      [runners.kubernetes]
        namespace = "gl-runner"
        image = "ubuntu:24.04"
        helper_image = "registry.gitlab.com/gitlab-org/gitlab-runner/gitlab-runner-helper:arm64-latest"
```

- GitLab Helm repositoryを追加します:

```shell
helm repo add gitlab https://charts.gitlab.io
```

- GitLab Runner向けnamespaceを作成します:

```shell
kubectl create namespace gl-runner
```

- インストールを行います:

```shell
helm install --namespace gl-runner first-runner -f values.yaml gitlab/gitlab-runner
```
