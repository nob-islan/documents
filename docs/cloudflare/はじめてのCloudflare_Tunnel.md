# はじめてのCloudflare Tunnel

[Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/)を使ってローカルのコンテンツに外部からアクセスできるようにします。

## 設定

### `cloudflared`のインストール

cf. https://pkg.cloudflare.com/index.html

```shell
# Add cloudflare gpg key
sudo mkdir -p --mode=0755 /usr/share/keyrings
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
```

```shell
# Add this repo to your apt repositories
echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
```

```shell
# install cloudflared
sudo apt-get update && sudo apt-get install cloudflared
```

### コンテンツをインターネットに公開

```shell
cloudflared tunnel --protocol http2 --url http://localhost:8080
```

ログに出力されるリンクからlocalhostのコンテンツにアクセスできます。コンテンツがhttpsでの疎通を要求する場合は`--no-tls-verify`を追加してください。

### コンテンツの公開をService化

- `/usr/lib/systemd/system/ctunnel.service`を下記で作成します:

```ini
[Unit]
Description=Cloudflare Tunnel

[Service]
ExecStart=cloudflared tunnel --protocol http2 --url http://localhost:8080
Type=simple

[Install]
WantedBy=multi-user.target
```

- Serviceを起動します:

```shell
sudo systemctl start ctunnel
```

- ログを確認します:

```shell
journalctl -u ctunnel
```
