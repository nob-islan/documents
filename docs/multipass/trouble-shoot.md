# トラブルシュート集

## `multipass`コマンドが返ってこなくなった

各種VMは生きているが、`multipass`コマンドが返ってこなくなったケースです。下記コマンド実施後、10秒程度待ってから再実行してください:

```shell
# multipassdを止める
sudo launchctl bootout system /Library/LaunchDaemons/com.canonical.multipassd.plist

# multipassdを再起動
sudo launchctl bootstrap system /Library/LaunchDaemons/com.canonical.multipassd.plist
```
