# KMS 暗号化設定

RustFS のバケットを SSE-KMS 方式で暗号化します。

cf. https://docs.rustfs.com/features/encryption/#object-encryption

## Vault 設定

KMS として [Hashicorp Vault](https://developer.hashicorp.com/vault) を利用します。

cf.

- https://developer.hashicorp.com/vault/docs/secrets/transit
- https://github.com/rustfs/rustfs/blob/main/docs/kms/README.md

### 手順

- RustFS 向けのポリシーを作成します。

```shell
# cf. https://developer.hashicorp.com/vault/docs/commands/policy
cat << EOF >> /tmp/rustfs-policy.hcl
path "secret/*" {
  capabilities = ["create", "read", "update", "patch", "delete", "list", "recover"]
}

path "transits/rustfs-master/" {
  capabilities = ["read"]
}
EOF

vault policy write rustfs-policy /tmp/rustfs-policy.hcl
```

- RustFS 向けのトークンを作成します。

```shell
# cf. https://developer.hashicorp.com/vault/docs/commands/token
vault token create -policy rustfs-policy
```

- transit および kv を有効化します:

```shell
vault secrets enable transit
vault secrets enable -path=secret kv-v2
```

- 暗号化キーを作成します:

```shell
vault write transit/keys/rustfs-master type=aes256-gcm96
```

## RustFS 設定

### 手順

- **SSE 設定**画面において下記設定を入力します:

| 項目                   | 設定値               |
| ---------------------- | -------------------- |
| Vault サーバー         | Vault サーバの IP    |
| Vault トークン         | 上で作成したトークン |
| Transit マウントパス   | `transit`            |
| KV マウントパス        | `secret`             |
| キーパスプレフィックス | `rustfs/kms/keys`    |
| デフォルトキー ID      | `rustfs-master`      |

- KMS 設定後、キーを作成できます。キー作成後、下記コマンドで確認できます:

```shell
vault kv list secret/rustfs/kms/keys/
```
