# Vault 初期セットアップ

[HashiCorp Vault](https://developer.hashicorp.com/vault) の初期セットアップをします。

## 手順

### インストール

cf. https://developer.hashicorp.com/vault/install

```shell
wget -O - https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(grep -oP '(?<=UBUNTU_CODENAME=).*' /etc/os-release || lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install vault
```

### Unseal

cf. https://developer.hashicorp.com/vault/tutorials/get-started/setup

- `./vault-server.hcl` を作成します:

```hcl
cat > ./vault-server.hcl << EOF
api_addr      = "http://{VaultサーバのIP}:8200"
cluster_addr  = "http://{VaultサーバのIP}:8201"
cluster_name  = "learn-vault-cluster"
disable_mlock = true
ui            = true

listener "tcp" {
  address     = "{VaultサーバのIP}:8200"
  tls_disable = "true"
}

backend "raft" {
  path    = "./vault-data"
  node_id = "learn-vault-server"
}
EOF
```

- データ保管用ディレクトリを作成します:

```shell
mkdir ./vault-data
```

- Vault を開始します:

```shell
vault server -config=./vault-server.hcl > ./vault.log 2>&1 &
```

- `vault` コマンドを実行するための環境変数を設定します:

```shell
export VAULT_ADDR=http://{VaultサーバのIP}:8200
```

- Vault を起動します:

```shell
# unseal keyが出力されます。Vaultのsealを解除するのに必要です。
vault operator init -key-shares=1 -key-threshold=1
```

- Vault の seal を解除します:

```shell
vault operator unseal
```
