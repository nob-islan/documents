# `docker-in-docker`が機能しない

`docker`コマンドは使えるものの、コンテナが起動できない事象を引きました:

```
$ docker run -itd nginx:stable

docker: Error response from daemon: failed to mount /tmp/containerd-mount1226524157: mount source: "overlay", target: "/tmp/containerd-mount1226524157", fstype: overlay, flags: 0, data: "workdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/9/work,upperdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/9/fs,lowerdir=/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/7/fs:/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/6/fs:/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/5/fs:/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/4/fs:/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/3/fs:/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/2/fs:/var/lib/containerd/io.containerd.snapshotter.v1.overlayfs/snapshots/1/fs,index=off", err: invalid argument

Run 'docker run --help' for more information
```

上記エラー発生時は、`Dockerfile`内でストレージドライバに関する設定を行い開発コンテナを起動します:

<details><summary>devcontainer.json</summary>

```json
{
  "name": "Go",
  "build": {
    "dockerfile": "Dockerfile"
  },
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:4.0.0": {}
  },
  "customizations": {
    "vscode": {
      "settings": {
        "editor.formatOnSave": true,
        "[go]": {
          "editor.rulers": [100]
        }
      },
      "extensions": ["golang.go"]
    }
  }
}
```

</details>

<details><summary>Dockerfile</summary>

```Dockerfile
FROM mcr.microsoft.com/devcontainers/go:1.26-bookworm

# Docker daemonのストレージドライバをvfsに強制する設定を配置
RUN mkdir -p /etc/docker && echo '{"storage-driver": "vfs"}' > /etc/docker/daemon.json
```

</details>
