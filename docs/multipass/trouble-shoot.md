# トラブルシュート集

## `multipass`コマンドが返ってこなくなった

各種VMは生きているが、`multipass`コマンドが返ってこなくなったケースです:

```shell
# multipassdを止める
sudo launchctl bootout system/com.canonical.multipassd

# プロセスキル
sudo pkill -9 -f qemu-system

# multipassdを再起動
sudo launchctl bootstrap system /Library/LaunchDaemons/com.canonical.multipassd.plist
```
