# Ubuntuデスクトップをインストールする

Ubuntuのデスクトップ版にリモートデスクトップで接続します。

## インストール手順

```shell
# デスクトップおよびxrdpのインストール
sudo apt update
sudo apt install -y ubuntu-desktop xrdp
sudo systemctl enable xrdp

# ユーザ追加
sudo adduser rdp-user
sudo usermod -aG sudo rdp-user
```

## 接続方法

Microsoft Remote Desktopなどで`{IPアドレス}:3389`にアクセスするとUbuntuデスクトップが使えるようになります。
