import{_ as a,o as n,c as i,a6 as e}from"./chunks/framework.C3mgXFrM.js";const d=JSON.parse('{"title":"Kubernetesコントロールプレーンへのロードバランシング","description":"","frontmatter":{},"headers":[],"relativePath":"haproxy/Kubernetesコントロールプレーンへのロードバランシング.md","filePath":"haproxy/Kubernetesコントロールプレーンへのロードバランシング.md"}'),l={name:"haproxy/Kubernetesコントロールプレーンへのロードバランシング.md"};function p(t,s,h,k,r,E){return n(),i("div",null,[...s[0]||(s[0]=[e(`<h1 id="kubernetesコントロールプレーンへのロードバランシング" tabindex="-1">Kubernetesコントロールプレーンへのロードバランシング <a class="header-anchor" href="#kubernetesコントロールプレーンへのロードバランシング" aria-label="Permalink to “Kubernetesコントロールプレーンへのロードバランシング”">​</a></h1><p>Kubernetesのコントロールプレーンを冗長化した際に前段にHAProxyをロードバランサとして置く際の設定サンプルです。</p><div class="language-ini"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">global</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  maxconn 60000</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  log 127.0.0.1 local0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  log 127.0.0.1 local1 notice</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  user  haproxy</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  group haproxy</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  chroot /var/empty</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">defaults</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mode tcp</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  balance roundrobin</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">frontend kube_client</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bind :6443</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mode tcp</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  default_backend kube_api</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">backend kube_api</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mode tcp</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  balance roundrobin</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  server s1 192.168.151.171:6443 check</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  server s2 192.168.151.172:6443 check</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  server s3 192.168.151.173:6443 check</span></span></code></pre></div>`,3)])])}const o=a(l,[["render",p]]);export{d as __pageData,o as default};
