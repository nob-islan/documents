# MinIO ストレージ暗号化検証

cf. https://min.io/docs/minio/linux/administration/server-side-encryption/server-side-encryption-sse-kms.html#minio-encryption-sse-kms-quickstart  
KMS プロバイダとして HashiCorp Vault キーストアを選択します。

## Hashicorp Vault キーストア構築

### Vault インスタンス起動

cf. https://min.io/docs/kes/integrations/hashicorp-vault-keystore/

```shell
# vaultインストール
wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install vault
```

```shell
# vaultを開発モードで起動
vault server -dev
```

### Vault を Vault CLI に接続

```shell
# vaultエンドポイントを設定
export VAULT_ADDR='http://127.0.0.1:8200'
```

```shell
# vault CLIが使う認証トークンを登録
export VAULT_TOKEN={`vault server -dev`で出力されたhvs.xxxx}
```

```shell
# K/V v1シークレット エンジンを有効化
vault secrets enable -version=1 kv
```

### Vault への KES アクセスを設定

```shell
# vault ポリシーを作成
cat << EOF > ./kes-policy.hcl
path "kv/*" {
   capabilities = [ "create", "read", "delete", "list" ]
}
EOF
```

```shell
# ポリシーをvaultに書き込む
vault policy write kes-policy kes-policy.hcl
```

```shell
# KESからvaultへの認証を有効化
vault auth enable approle
```

```shell
# KESロールを作成
vault write auth/approle/role/kes-server token_num_uses=0  secret_id_num_uses=0  period=5m
```

```shell
# kes-serverロールをkes-policyにバインド
vault write auth/approle/role/kes-server policies=kes-policy
```

```shell
# KESサーバーのAppRole IDをリクエスト
vault read auth/approle/role/kes-server/role-id
```

```shell
# KESサーバーのAppRoleシークレットをリクエスト
vault write -f auth/approle/role/kes-server/secret-id
```

### KES サーバ構築

```shell
# KESインストール; see also https://min.io/docs/kes/tutorials/getting-started/
wget https://github.com/minio/kes/releases/latest/download/kes-linux-amd64
chmod +x ./kes-linux-amd64
mv ./kes-linux-amd64 /usr/local/bin/kes
```

```shell
# KES実行用の自己証明書を作成
kes identity new --ip "127.0.0.1" --key "private.key" --cert "public.crt" localhost
```

```shell
# MinIO認証情報を作成
kes identity new --key=client.key --cert=client.crt MinIO
```

```shell
# KES サーバー構成ファイルを作成
cat << EOF > config.yml
admin:
  identity: {identity generated above by 'kes identity new --key=client.key --cert=client.crt MinIO'}

tls:
  key: private.key    # The KES server TLS private key
  cert: public.crt    # The KES server TLS certificate

keystore:
   vault:
     endpoint: http://127.0.0.1:8200
     version:  v1 # The K/V engine version - either "v1" or "v2".
     engine:   kv # The engine path of the K/V engine. The default is "kv".
     approle:
       id:     {role_id generated above by 'vault read auth/approle/role/kes-server/role-id'}
       secret: {secret_id generated above by 'vault write -f auth/approle/role/kes-server/secret-id'}
EOF
```

```shell
# KESサーバを起動
kes server --config config.yml
```

### KES CLI アクセス設定

```shell
# KES CLIが通信するKESサーバを指定
export KES_SERVER=http://127.0.0.1:7373
```

```shell
# クライアントが KES サーバーと通信するために使用するキーを設定
export KES_API_KEY={kes identity generated above by 'kes identity new --key=client.key --cert=client.crt MinIO' such as kes:v1:xxxx}
```

```shell
# (オプション) 構成をテスト
kes status -k
```

## MinIO 構築

### インスタンス起動

cf. https://min.io/docs/kes/tutorials/kes-for-minio/#minio-server-setup

```shell
# MinIOインストール
wget https://dl.min.io/server/minio/release/linux-amd64/archive/minio_20241107005220.0.0_amd64.deb -O minio.deb
sudo dpkg -i minio.deb
```

```shell
### 各種環境変数を設定
# KESサーバのエンドポイント
export MINIO_KMS_KES_ENDPOINT=https://127.0.0.1:7373
# MinIOクライアントの資格情報
export MINIO_KMS_KES_CERT_FILE=client.crt
export MINIO_KMS_KES_KEY_FILE=client.key
# 暗号化キーを指定しなかった場合のデフォルトキー
export MINIO_KMS_KES_KEY_NAME=minio-default-key
# 信頼するKESサーバ証明書
export MINIO_KMS_KES_CAPATH=public.crt
# MinIOルート資格情報
export MINIO_ROOT_USER=minio
export MINIO_ROOT_PASSWORD=minio123
```

```shell
# MinIOサーバを起動
minio server /data
```

### 暗号化設定

```shell
# 暗号化キーを作成
mc admin kms key create {alias} minio-key-name
```

```shell
# バケットを暗号化
mc encrypt set sse-kms minio-key-name {alias}/{bucket name}
```
