# Nginx へのロードバランシング

複数台の nginx の前段に HAProxy をロードバランサとして置く際の設定サンプルです。

```
global
  maxconn 60000
  log 127.0.0.1 local0
  log 127.0.0.1 local1 notice
  user  haproxy
  group haproxy
  chroot /var/empty

defaults
  mode http
  balance roundrobin

frontend nginx_client
  bind :80
  mode http
  default_backend nginx_web

backend nginx_web
  mode http
  balance roundrobin
  server s1 192.168.151.61:80 check
  server s2 192.168.151.62:80 check
```
