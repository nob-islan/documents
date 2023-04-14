# カスタムメトリクスの設定方法

cf. [公式ドキュメント](https://aws.amazon.com/jp/premiumsupport/knowledge-center/cloudwatch-memory-metrics-ec2/)  
Cloud Watch のカスタムメトリクスを設定してメモリ使用状況などを監視できるようにします。

## IAM ロールの作成

エージェントがサーバからメトリクスを収集できるようにするためのロールを作成します。

- `IAM`サービスから`ロール`を選択
- `ロールの作成`を選択
- `CloudWatchAgentServerPolicy`ポリシーを選択してロールを作成
- EC2 インスタンスにロールをアタッチ

## エージェントパッケージをダウンロード・インストール

- [公式ドキュメント](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/download-cloudwatch-agent-commandline.html)の表に従って、使用しているプラットフォームに適したダウンロードリンクからダウンロード

```
wget ${download-link}
```

- インストール

```
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
```

## エージェントファイルの設定

- エージェントファイルを作成

```
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

- エージェントを開始

```
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -s
```

`すべてのメトリクス` -> `CWAgent`から確認できます。
