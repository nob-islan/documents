# Kubernetesコントロールプレーンへのロードバランシング

Kubernetesのコントロールプレーンを冗長化した際に前段にHAProxyをロードバランサとして置く際の設定サンプルです。

```cfg
global
  maxconn 60000
  log 127.0.0.1 local0
  log 127.0.0.1 local1 notice
  user  haproxy
  group haproxy
  chroot /var/empty

defaults
  mode tcp
  balance roundrobin

frontend kube_client
  bind :6443
  mode tcp
  default_backend kube_api

backend kube_api
  mode tcp
  balance roundrobin
  server s1 192.168.151.171:6443 check
  server s2 192.168.151.172:6443 check
  server s3 192.168.151.173:6443 check
```
