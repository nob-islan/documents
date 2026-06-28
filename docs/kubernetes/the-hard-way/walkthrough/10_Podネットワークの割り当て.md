# 10. Podネットワークの割り当て

ノード間のPod同士で通信を行うためのルートを作成します。

## ルーティングテーブルの作成

```shell
KUBE_W01_IP=$(grep kube-w01 machines.txt | cut -d " " -f 1)
KUBE_W01_SUBNET=$(grep kube-w01 machines.txt | cut -d " " -f 4)
KUBE_W02_IP=$(grep kube-w02 machines.txt | cut -d " " -f 1)
KUBE_W02_SUBNET=$(grep kube-w02 machines.txt | cut -d " " -f 4)
```

```shell
ssh nob@kube-c01 "sudo ip route add ${KUBE_W01_SUBNET} via ${KUBE_W01_IP}"
ssh nob@kube-c01 "sudo ip route add ${KUBE_W02_SUBNET} via ${KUBE_W02_IP}"
```

```shell
ssh nob@kube-w01 "sudo ip route add ${KUBE_W02_SUBNET} via ${KUBE_W02_IP}"
```

```shell
ssh nob@kube-w02 "sudo ip route add ${KUBE_W01_SUBNET} via ${KUBE_W01_IP}"
```

## 確認

```shell
ssh nob@kube-c01 "ip route"
```

```
$ ssh nob@kube-c01 "ip route"
default via 192.168.150.1 dev ens18 proto dhcp src 192.168.151.49 metric 100
10.200.0.0/24 via 192.168.151.28 dev ens18
10.200.1.0/24 via 192.168.151.54 dev ens18
192.168.150.0/23 dev ens18 proto kernel scope link src 192.168.151.49 metric 100
192.168.150.1 dev ens18 proto dhcp scope link src 192.168.151.49 metric 100
```

```shell
ssh nob@kube-w01 "ip route"
```

```
$ ssh nob@kube-w01 "ip route"
default via 192.168.150.1 dev ens18 proto dhcp src 192.168.151.28 metric 100
10.200.1.0/24 via 192.168.151.54 dev ens18
192.168.150.0/23 dev ens18 proto kernel scope link src 192.168.151.28 metric 100
192.168.150.1 dev ens18 proto dhcp scope link src 192.168.151.28 metric 100
```

```shell
ssh nob@kube-w02 "ip route"
```

```
$ ssh nob@kube-w02 "ip route"
default via 192.168.150.1 dev ens18 proto dhcp src 192.168.151.54 metric 100
10.200.0.0/24 via 192.168.151.28 dev ens18
192.168.150.0/23 dev ens18 proto kernel scope link src 192.168.151.54 metric 100
192.168.150.1 dev ens18 proto dhcp scope link src 192.168.151.54 metric 100
```

次: [スモークテスト](./11_スモークテスト.md)
