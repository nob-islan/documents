# ローカルネットワークで名前解決してもらう

ローカルネットワークにおけるDNSサービスである **avahi-daemon** をインストールし、他端末から `ssh nob@my-server.local` のような`.local`付きのホスト名でsshできるようにします。

```shell
sudo apt update
sudo apt install avahi-daemon

sudo systemctl enable avahi-daemon
sudo systemctl start avahi-daemon
```
