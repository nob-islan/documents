# ローカルネットワークで名前解決してもらう

ローカルネットワークにおける DNS サービスである **avahi-daemon** をインストールし、他端末から `ssh nob@my-server.local` のような`.local`付きのホスト名で ssh できるようにします。

```shell
sudo apt update
sudo apt install avahi-daemon

sudo systemctl enable avahi-daemon
sudo systemctl start avahi-daemon
```
