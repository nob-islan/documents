# ノート PC を閉じてもスリープしないようにする

```shell
# 設定ファイル書き換え
sudo vim /etc/systemd/logind.conf
```

`HandleLidSwitch=ignore`に書き換えます。

```shell
# サービス再起動
sudo systemctl restart systemd-logind.service
```
