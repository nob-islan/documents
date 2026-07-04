# 3. 認証局の割り当ておよびTLS証明書の作成

`openssl`を用いて認証局を割り当てて下記に対するTLS証明書を作成します。

- kube-apiserver
- kube-controller-manager
- kube-scheduler
- kubelet
- kube-proxy

## 認証局の割り当て

Kubernetesコンポーネントの証明書を生成するために必要なすべての詳細を定義した`ca.conf`を作成します。

```shell
cat << EOF > ca.conf
[req]
distinguished_name = req_distinguished_name
prompt             = no
x509_extensions    = ca_x509_extensions

[ca_x509_extensions]
basicConstraints = CA:TRUE
keyUsage         = cRLSign, keyCertSign

[req_distinguished_name]
C   = US
ST  = Washington
L   = Seattle
CN  = CA

[admin]
distinguished_name = admin_distinguished_name
prompt             = no
req_extensions     = default_req_extensions

[admin_distinguished_name]
CN = admin
O  = system:masters

# Service Accounts
#
# The Kubernetes Controller Manager leverages a key pair to generate
# and sign service account tokens as described in the
# [managing service accounts](https://kubernetes.io/docs/admin/service-accounts-admin/)
# documentation.

[service-accounts]
distinguished_name = service-accounts_distinguished_name
prompt             = no
req_extensions     = default_req_extensions

[service-accounts_distinguished_name]
CN = service-accounts

# Worker Nodes
#
# Kubernetes uses a [special-purpose authorization mode](https://kubernetes.io/docs/admin/authorization/node/)
# called Node Authorizer, that specifically authorizes API requests made
# by [Kubelets](https://kubernetes.io/docs/concepts/overview/components/#kubelet).
# In order to be authorized by the Node Authorizer, Kubelets must use a credential
# that identifies them as being in the system:nodes group, with a username
# of system:node:<nodeName>.

[kube-w01]
distinguished_name = kube-w01_distinguished_name
prompt             = no
req_extensions     = kube-w01_req_extensions

[kube-w01_req_extensions]
basicConstraints     = CA:FALSE
extendedKeyUsage     = clientAuth, serverAuth
keyUsage             = critical, digitalSignature, keyEncipherment
nsCertType           = client
nsComment            = "kube-w01 Certificate"
subjectAltName       = DNS:kube-w01, IP:127.0.0.1
subjectKeyIdentifier = hash

[kube-w01_distinguished_name]
CN = system:node:kube-w01
O  = system:nodes
C  = US
ST = Washington
L  = Seattle

[kube-w02]
distinguished_name = kube-w02_distinguished_name
prompt             = no
req_extensions     = kube-w02_req_extensions

[kube-w02_req_extensions]
basicConstraints     = CA:FALSE
extendedKeyUsage     = clientAuth, serverAuth
keyUsage             = critical, digitalSignature, keyEncipherment
nsCertType           = client
nsComment            = "kube-w02 Certificate"
subjectAltName       = DNS:kube-w02, IP:127.0.0.1
subjectKeyIdentifier = hash

[kube-w02_distinguished_name]
CN = system:node:kube-w02
O  = system:nodes
C  = US
ST = Washington
L  = Seattle


# Kube Proxy Section
[kube-proxy]
distinguished_name = kube-proxy_distinguished_name
prompt             = no
req_extensions     = kube-proxy_req_extensions

[kube-proxy_req_extensions]
basicConstraints     = CA:FALSE
extendedKeyUsage     = clientAuth, serverAuth
keyUsage             = critical, digitalSignature, keyEncipherment
nsCertType           = client
nsComment            = "Kube Proxy Certificate"
subjectAltName       = DNS:kube-proxy, IP:127.0.0.1
subjectKeyIdentifier = hash

[kube-proxy_distinguished_name]
CN = system:kube-proxy
O  = system:node-proxier
C  = US
ST = Washington
L  = Seattle


# Controller Manager
[kube-controller-manager]
distinguished_name = kube-controller-manager_distinguished_name
prompt             = no
req_extensions     = kube-controller-manager_req_extensions

[kube-controller-manager_req_extensions]
basicConstraints     = CA:FALSE
extendedKeyUsage     = clientAuth, serverAuth
keyUsage             = critical, digitalSignature, keyEncipherment
nsCertType           = client
nsComment            = "Kube Controller Manager Certificate"
subjectAltName       = DNS:kube-controller-manager, IP:127.0.0.1
subjectKeyIdentifier = hash

[kube-controller-manager_distinguished_name]
CN = system:kube-controller-manager
O  = system:kube-controller-manager
C  = US
ST = Washington
L  = Seattle


# Scheduler
[kube-scheduler]
distinguished_name = kube-scheduler_distinguished_name
prompt             = no
req_extensions     = kube-scheduler_req_extensions

[kube-scheduler_req_extensions]
basicConstraints     = CA:FALSE
extendedKeyUsage     = clientAuth, serverAuth
keyUsage             = critical, digitalSignature, keyEncipherment
nsCertType           = client
nsComment            = "Kube Scheduler Certificate"
subjectAltName       = DNS:kube-scheduler, IP:127.0.0.1
subjectKeyIdentifier = hash

[kube-scheduler_distinguished_name]
CN = system:kube-scheduler
O  = system:system:kube-scheduler
C  = US
ST = Washington
L  = Seattle


# API Server
#
# The Kubernetes API server is automatically assigned the kubernetes
# internal dns name, which will be linked to the first IP address (10.32.0.1)
# from the address range (10.32.0.0/24) reserved for internal cluster
# services.

[kube-apiserver]
distinguished_name = kube-apiserver_distinguished_name
prompt             = no
req_extensions     = kube-apiserver_req_extensions

[kube-apiserver_req_extensions]
basicConstraints     = CA:FALSE
extendedKeyUsage     = clientAuth, serverAuth
keyUsage             = critical, digitalSignature, keyEncipherment
nsCertType           = client, server
nsComment            = "Kube API Server Certificate"
subjectAltName       = @kube-apiserver_alt_names
subjectKeyIdentifier = hash

[kube-apiserver_alt_names]
IP.0  = 127.0.0.1
IP.1  = 10.32.0.1
DNS.0 = kubernetes
DNS.1 = kubernetes.default
DNS.2 = kubernetes.default.svc
DNS.3 = kubernetes.default.svc.cluster
DNS.4 = kubernetes.svc.cluster.local
DNS.5 = kube-c01.kubernetes.local
DNS.6 = api-server.kubernetes.local

[kube-apiserver_distinguished_name]
CN = kubernetes
C  = US
ST = Washington
L  = Seattle


[default_req_extensions]
basicConstraints     = CA:FALSE
extendedKeyUsage     = clientAuth
keyUsage             = critical, digitalSignature, keyEncipherment
nsCertType           = client
nsComment            = "Admin Client Certificate"
subjectKeyIdentifier = hash
EOF
```

CA構成ファイル、証明書、および秘密鍵を生成します。

```shell
openssl genrsa -out ca.key 4096
openssl req -x509 -new -sha512 -noenc \
  -key ca.key -days 3653 \
  -config ca.conf \
  -out ca.crt
```

生成されていることを確認します。

```shell
ls ca.crt ca.key
```

```
$ ls ca.crt ca.key
ca.crt  ca.key
```

## クライアント証明書、サーバ証明書の作成

各Kubernetesコンポーネントのクライアント証明書とサーバー証明書、およびadmin Kubernetesユーザーのクライアント証明書を生成します。

```shell
certs=(
  "admin" "kube-w01" "kube-w02"
  "kube-proxy" "kube-scheduler"
  "kube-controller-manager"
  "kube-apiserver"
  "service-accounts"
)
```

```shell
for i in ${certs[*]}; do
  openssl genrsa -out "${i}.key" 4096

  openssl req -new -key "${i}.key" -sha256 \
    -config "ca.conf" -section ${i} \
    -out "${i}.csr"

  openssl x509 -req -days 3653 -in "${i}.csr" \
    -copy_extensions copyall \
    -sha256 -CA "ca.crt" \
    -CAkey "ca.key" \
    -CAcreateserial \
    -out "${i}.crt"
done
```

各種証明書が生成されていることを確認します。

```shell
ls -1 *.crt *.key *.csr
```

```
$ ls -1 *.crt *.key *.csr
admin.crt
admin.csr
admin.key
ca.crt
ca.key
kube-apiserver.crt
kube-apiserver.csr
kube-apiserver.key
kube-controller-manager.crt
kube-controller-manager.csr
kube-controller-manager.key
kube-proxy.crt
kube-proxy.csr
kube-proxy.key
kube-scheduler.crt
kube-scheduler.csr
kube-scheduler.key
kube-w01.crt
kube-w01.csr
kube-w01.key
kube-w02.crt
kube-w02.csr
kube-w02.key
service-accounts.crt
service-accounts.csr
service-accounts.key
```

## クライアント証明書、サーバ証明書の配布

必要な証明書をkube-c01、kube-w01、kube-w02にコピーします。

```shell
scp \
  ca.key ca.crt kube-apiserver.key kube-apiserver.crt service-accounts.key service-accounts.crt \
  nob@kube-c01:~/
```

```shell
for HOST in kube-w01 kube-w02; do
  ssh nob@${HOST} "sudo mkdir -p /var/lib/kubelet"
  scp ca.crt nob@${HOST}:~/
  ssh nob@${HOST} "sudo mv ~/ca.crt /var/lib/kubelet/"

  scp ${HOST}.crt nob@${HOST}:~/
  ssh nob@${HOST} "sudo mv ~/${HOST}.crt /var/lib/kubelet/kubelet.crt"

  scp ${HOST}.key nob@${HOST}:~/
  ssh nob@${HOST} "sudo mv ~/${HOST}.key /var/lib/kubelet/kubelet.key"
done
```

次: [認証用のKubernetes構成ファイルの生成](./04_認証用のKubernetes構成ファイルの生成.md)
