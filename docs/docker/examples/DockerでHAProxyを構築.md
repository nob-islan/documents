# DockerでHAProxyを構築

cf. https://www.haproxy.com/documentation/haproxy-configuration-tutorials/

- docker-composeを下記で作成します:

```yaml
services:
  haproxy:
    container_name: nob-haproxy
    image: haproxytech/haproxy-alpine:3.0
    ports:
      - 80:80
    volumes:
      - ./volumes/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg
```

- haproxy.cfgを下記で作成します（see also; [Configuration file composition](https://www.haproxy.com/documentation/haproxy-configuration-tutorials/proxying-essentials/configuration-basics/overview/#configuration-file-composition)）:

```config
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

frontend website
  bind :80
  mode http
  default_backend web_servers

backend web_servers
  mode http
  balance roundrobin
  server s1 192.168.151.123:80 check
  server s2 192.168.151.124:80 check
```
