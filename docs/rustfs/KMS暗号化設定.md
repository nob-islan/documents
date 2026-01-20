# KMS暗号化設定

RustFSのバケットをSSE-KMS方式で暗号化します。

cf. https://docs.rustfs.com/features/encryption/#object-encryption

## Vault設定

KMSとして [Hashicorp Vault](https://developer.hashicorp.com/vault) を利用します。

cf.

- https://developer.hashicorp.com/vault/docs/secrets/transit
- https://github.com/rustfs/rustfs/blob/main/docs/kms/README.md

### 手順

- RustFS向けのポリシーを作成します。

```shell
# cf. https://developer.hashicorp.com/vault/docs/commands/policy
cat << EOF >> ./rustfs-policy.hcl
path "secret/*" {
  capabilities = ["create", "read", "update", "patch", "delete", "list", "recover"]
}

path "transits/rustfs-master/" {
  capabilities = ["read"]
}
EOF

vault policy write rustfs-policy ./rustfs-policy.hcl
```

- RustFS向けのトークンを作成します。

```shell
# cf. https://developer.hashicorp.com/vault/docs/commands/token
vault token create -policy rustfs-policy
```

- transitおよびkvを有効化します:

```shell
vault secrets enable transit
vault secrets enable -path=secret kv-v2
```

- 暗号化キーを作成します:

```shell
vault write transit/keys/rustfs-master type=aes256-gcm96
```

## RustFS設定

### 手順

- **SSE設定**画面において下記設定を入力します:

| 項目                   | 設定値               |
| ---------------------- | -------------------- |
| Vaultサーバー         | VaultサーバのIP    |
| Vaultトークン         | 上で作成したトークン |
| Transitマウントパス   | `transit`            |
| KVマウントパス        | `secret`             |
| キーパスプレフィックス | `rustfs/kms/keys`    |
| デフォルトキーID      | `rustfs-master`      |

- KMS設定後、キーを作成できます。キー作成後、下記コマンドで確認できます:

```shell
vault kv list secret/rustfs/kms/keys/
```
