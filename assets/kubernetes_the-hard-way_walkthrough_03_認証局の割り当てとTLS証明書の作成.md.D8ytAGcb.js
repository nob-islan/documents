import{_ as i,o as a,c as n,a6 as e}from"./chunks/framework.C3mgXFrM.js";const c=JSON.parse('{"title":"3. 認証局の割り当ておよびTLS証明書の作成","description":"","frontmatter":{},"headers":[],"relativePath":"kubernetes/the-hard-way/walkthrough/03_認証局の割り当てとTLS証明書の作成.md","filePath":"kubernetes/the-hard-way/walkthrough/03_認証局の割り当てとTLS証明書の作成.md"}'),l={name:"kubernetes/the-hard-way/walkthrough/03_認証局の割り当てとTLS証明書の作成.md"};function p(t,s,h,k,F,r){return a(),n("div",null,[...s[0]||(s[0]=[e(`<h1 id="_3-認証局の割り当ておよびtls証明書の作成" tabindex="-1">3. 認証局の割り当ておよびTLS証明書の作成 <a class="header-anchor" href="#_3-認証局の割り当ておよびtls証明書の作成" aria-label="Permalink to “3. 認証局の割り当ておよびTLS証明書の作成”">​</a></h1><p><code>openssl</code>を用いて認証局を割り当てて下記に対するTLS証明書を作成します。</p><ul><li>kube-apiserver</li><li>kube-controller-manager</li><li>kube-scheduler</li><li>kubelet</li><li>kube-proxy</li></ul><h2 id="認証局の割り当て" tabindex="-1">認証局の割り当て <a class="header-anchor" href="#認証局の割り当て" aria-label="Permalink to “認証局の割り当て”">​</a></h2><p>Kubernetesコンポーネントの証明書を生成するために必要なすべての詳細を定義した<code>ca.conf</code>を作成します。</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">cat</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;&lt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> EOF</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.conf</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[req]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = req_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">x509_extensions    = ca_x509_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[ca_x509_extensions]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">basicConstraints = CA:TRUE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keyUsage         = cRLSign, keyCertSign</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[req_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">C   = US</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ST  = Washington</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">L   = Seattle</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN  = CA</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[admin]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = admin_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">req_extensions     = default_req_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[admin_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN = admin</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">O  = system:masters</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Service Accounts</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">#</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># The Kubernetes Controller Manager leverages a key pair to generate</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># and sign service account tokens as described in the</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># [managing service accounts](https://kubernetes.io/docs/admin/service-accounts-admin/)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># documentation.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[service-accounts]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = service-accounts_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">req_extensions     = default_req_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[service-accounts_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN = service-accounts</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Worker Nodes</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">#</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Kubernetes uses a [special-purpose authorization mode](https://kubernetes.io/docs/admin/authorization/node/)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># called Node Authorizer, that specifically authorizes API requests made</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># by [Kubelets](https://kubernetes.io/docs/concepts/overview/components/#kubelet).</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># In order to be authorized by the Node Authorizer, Kubelets must use a credential</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># that identifies them as being in the system:nodes group, with a username</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># of system:node:&lt;nodeName&gt;.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-w01]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = kube-w01_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">req_extensions     = kube-w01_req_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-w01_req_extensions]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">basicConstraints     = CA:FALSE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">extendedKeyUsage     = clientAuth, serverAuth</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keyUsage             = critical, digitalSignature, keyEncipherment</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsCertType           = client</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsComment            = &quot;kube-w01 Certificate&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectAltName       = DNS:kube-w01, IP:127.0.0.1</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectKeyIdentifier = hash</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-w01_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN = system:node:kube-w01</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">O  = system:nodes</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">C  = US</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ST = Washington</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">L  = Seattle</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-w02]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = kube-w02_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">req_extensions     = kube-w02_req_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-w02_req_extensions]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">basicConstraints     = CA:FALSE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">extendedKeyUsage     = clientAuth, serverAuth</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keyUsage             = critical, digitalSignature, keyEncipherment</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsCertType           = client</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsComment            = &quot;kube-w02 Certificate&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectAltName       = DNS:kube-w02, IP:127.0.0.1</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectKeyIdentifier = hash</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-w02_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN = system:node:kube-w02</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">O  = system:nodes</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">C  = US</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ST = Washington</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">L  = Seattle</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Kube Proxy Section</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-proxy]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = kube-proxy_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">req_extensions     = kube-proxy_req_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-proxy_req_extensions]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">basicConstraints     = CA:FALSE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">extendedKeyUsage     = clientAuth, serverAuth</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keyUsage             = critical, digitalSignature, keyEncipherment</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsCertType           = client</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsComment            = &quot;Kube Proxy Certificate&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectAltName       = DNS:kube-proxy, IP:127.0.0.1</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectKeyIdentifier = hash</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-proxy_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN = system:kube-proxy</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">O  = system:node-proxier</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">C  = US</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ST = Washington</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">L  = Seattle</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Controller Manager</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-controller-manager]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = kube-controller-manager_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">req_extensions     = kube-controller-manager_req_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-controller-manager_req_extensions]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">basicConstraints     = CA:FALSE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">extendedKeyUsage     = clientAuth, serverAuth</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keyUsage             = critical, digitalSignature, keyEncipherment</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsCertType           = client</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsComment            = &quot;Kube Controller Manager Certificate&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectAltName       = DNS:kube-controller-manager, IP:127.0.0.1</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectKeyIdentifier = hash</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-controller-manager_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN = system:kube-controller-manager</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">O  = system:kube-controller-manager</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">C  = US</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ST = Washington</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">L  = Seattle</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># Scheduler</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-scheduler]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = kube-scheduler_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">req_extensions     = kube-scheduler_req_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-scheduler_req_extensions]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">basicConstraints     = CA:FALSE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">extendedKeyUsage     = clientAuth, serverAuth</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keyUsage             = critical, digitalSignature, keyEncipherment</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsCertType           = client</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsComment            = &quot;Kube Scheduler Certificate&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectAltName       = DNS:kube-scheduler, IP:127.0.0.1</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectKeyIdentifier = hash</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-scheduler_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN = system:kube-scheduler</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">O  = system:system:kube-scheduler</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">C  = US</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ST = Washington</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">L  = Seattle</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># API Server</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">#</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># The Kubernetes API server is automatically assigned the kubernetes</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># internal dns name, which will be linked to the first IP address (10.32.0.1)</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># from the address range (10.32.0.0/24) reserved for internal cluster</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"># services.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-api-server]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">distinguished_name = kube-api-server_distinguished_name</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">prompt             = no</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">req_extensions     = kube-api-server_req_extensions</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-api-server_req_extensions]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">basicConstraints     = CA:FALSE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">extendedKeyUsage     = clientAuth, serverAuth</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keyUsage             = critical, digitalSignature, keyEncipherment</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsCertType           = client, server</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsComment            = &quot;Kube API Server Certificate&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectAltName       = @kube-api-server_alt_names</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectKeyIdentifier = hash</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-api-server_alt_names]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">IP.0  = 127.0.0.1</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">IP.1  = 10.32.0.1</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DNS.0 = kubernetes</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DNS.1 = kubernetes.default</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DNS.2 = kubernetes.default.svc</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DNS.3 = kubernetes.default.svc.cluster</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DNS.4 = kubernetes.svc.cluster.local</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DNS.5 = kube-c01.kubernetes.local</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DNS.6 = api-server.kubernetes.local</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[kube-api-server_distinguished_name]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CN = kubernetes</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">C  = US</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">ST = Washington</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">L  = Seattle</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">[default_req_extensions]</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">basicConstraints     = CA:FALSE</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">extendedKeyUsage     = clientAuth</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">keyUsage             = critical, digitalSignature, keyEncipherment</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsCertType           = client</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nsComment            = &quot;Admin Client Certificate&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">subjectKeyIdentifier = hash</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">EOF</span></span></code></pre></div><p>CA構成ファイル、証明書、および秘密鍵を生成します。</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openssl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> genrsa</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -out</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.key</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 4096</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openssl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> req</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -x509</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -new</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -sha512</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -noenc</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -key</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.key</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -days</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3653</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.conf</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -out</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.crt</span></span></code></pre></div><p>生成されていることを確認します。</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ls</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.crt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.key</span></span></code></pre></div><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span>$ ls ca.crt ca.key</span></span>
<span class="line"><span>ca.crt  ca.key</span></span></code></pre></div><h2 id="クライアント証明書、サーバ証明書の作成" tabindex="-1">クライアント証明書、サーバ証明書の作成 <a class="header-anchor" href="#クライアント証明書、サーバ証明書の作成" aria-label="Permalink to “クライアント証明書、サーバ証明書の作成”">​</a></h2><p>各Kubernetesコンポーネントのクライアント証明書とサーバー証明書、およびadmin Kubernetesユーザーのクライアント証明書を生成します。</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">certs</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;admin&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kube-w01&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kube-w02&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;kube-proxy&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;kube-scheduler&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;kube-controller-manager&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;kube-api-server&quot;</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &quot;service-accounts&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \${certs[</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]}; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">do</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  openssl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> genrsa</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -out</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">i</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}.key&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 4096</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  openssl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> req</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -new</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -key</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">i</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}.key&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -sha256</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -config</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;ca.conf&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -section</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \${i} </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -out</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">i</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}.csr&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  openssl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> x509</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -req</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -days</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 3653</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -in</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">i</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}.csr&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -copy_extensions</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> copyall</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -sha256</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -CA</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;ca.crt&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -CAkey</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;ca.key&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -CAcreateserial</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    -out</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">i</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}.crt&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">done</span></span></code></pre></div><p>各種証明書が生成されていることを確認します。</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ls</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -1</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> *</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.crt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> *</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.key</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> *</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.csr</span></span></code></pre></div><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span>$ ls -1 *.crt *.key *.csr</span></span>
<span class="line"><span>admin.crt</span></span>
<span class="line"><span>admin.csr</span></span>
<span class="line"><span>admin.key</span></span>
<span class="line"><span>ca.crt</span></span>
<span class="line"><span>ca.key</span></span>
<span class="line"><span>kube-api-server.crt</span></span>
<span class="line"><span>kube-api-server.csr</span></span>
<span class="line"><span>kube-api-server.key</span></span>
<span class="line"><span>kube-controller-manager.crt</span></span>
<span class="line"><span>kube-controller-manager.csr</span></span>
<span class="line"><span>kube-controller-manager.key</span></span>
<span class="line"><span>kube-proxy.crt</span></span>
<span class="line"><span>kube-proxy.csr</span></span>
<span class="line"><span>kube-proxy.key</span></span>
<span class="line"><span>kube-scheduler.crt</span></span>
<span class="line"><span>kube-scheduler.csr</span></span>
<span class="line"><span>kube-scheduler.key</span></span>
<span class="line"><span>kube-w01.crt</span></span>
<span class="line"><span>kube-w01.csr</span></span>
<span class="line"><span>kube-w01.key</span></span>
<span class="line"><span>kube-w02.crt</span></span>
<span class="line"><span>kube-w02.csr</span></span>
<span class="line"><span>kube-w02.key</span></span>
<span class="line"><span>service-accounts.crt</span></span>
<span class="line"><span>service-accounts.csr</span></span>
<span class="line"><span>service-accounts.key</span></span></code></pre></div><h2 id="クライアント証明書、サーバ証明書の配布" tabindex="-1">クライアント証明書、サーバ証明書の配布 <a class="header-anchor" href="#クライアント証明書、サーバ証明書の配布" aria-label="Permalink to “クライアント証明書、サーバ証明書の配布”">​</a></h2><p>必要な証明書をkube-c01、kube-w01、kube-w02にコピーします。</p><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">scp</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  ca.key</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.crt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kube-api-server.key</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kube-api-server.crt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> service-accounts.key</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> service-accounts.crt</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  nob@kube-c01:~/</span></span></code></pre></div><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> HOST </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">in</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kube-w01</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> kube-w02</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">do</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nob@</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${HOST} </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sudo mkdir -p /var/lib/kubelet&quot;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  scp</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ca.crt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nob@</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${HOST}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:~/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nob@</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${HOST} </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sudo mv ~/ca.crt /var/lib/kubelet/&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  scp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \${HOST}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.crt</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nob@</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${HOST}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:~/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nob@</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${HOST} </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sudo mv ~/\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">HOST</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}.crt /var/lib/kubelet/kubelet.crt&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  scp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> \${HOST}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.key</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nob@</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${HOST}</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:~/</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ssh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nob@</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\${HOST} </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;sudo mv ~/\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">HOST</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}.key /var/lib/kubelet/kubelet.key&quot;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">done</span></span></code></pre></div><p>次: <a href="./04_認証用のKubernetes構成ファイルの生成.html">認証用のKubernetes構成ファイルの生成</a></p>`,23)])])}const g=i(l,[["render",p]]);export{c as __pageData,g as default};
