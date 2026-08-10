import{_ as a,o as i,c as n,a6 as e}from"./chunks/framework.C05ZgNLH.js";const c=JSON.parse('{"title":"DockerでHAProxyを構築","description":"","frontmatter":{},"headers":[],"relativePath":"docker/examples/DockerでHAProxyを構築.md","filePath":"docker/examples/DockerでHAProxyを構築.md"}'),l={name:"docker/examples/DockerでHAProxyを構築.md"};function p(t,s,h,r,k,o){return i(),n("div",null,[...s[0]||(s[0]=[e(`<h1 id="dockerでhaproxyを構築" tabindex="-1">DockerでHAProxyを構築 <a class="header-anchor" href="#dockerでhaproxyを構築" aria-label="Permalink to “DockerでHAProxyを構築”">​</a></h1><p>cf. <a href="https://www.haproxy.com/documentation/haproxy-configuration-tutorials/" target="_blank" rel="noreferrer">https://www.haproxy.com/documentation/haproxy-configuration-tutorials/</a></p><ul><li><code>docker-compose.yaml</code>を下記で作成します:</li></ul><div class="language-yaml"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">services</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  haproxy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    container_name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nob-haproxy</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    image</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">haproxytech/haproxy-alpine:3.0</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    ports</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">80:80</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    volumes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      - </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">./volumes/haproxy.cfg:/usr/local/etc/haproxy/haproxy.cfg</span></span></code></pre></div><ul><li><code>haproxy.cfg</code>を下記で作成します（see also; <a href="https://www.haproxy.com/documentation/haproxy-configuration-tutorials/proxying-essentials/configuration-basics/overview/#configuration-file-composition" target="_blank" rel="noreferrer">Configuration file composition</a>）:</li></ul><div class="language-ini"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">global</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  maxconn 60000</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  log 127.0.0.1 local0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  log 127.0.0.1 local1 notice</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  user  haproxy</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  group haproxy</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  chroot /var/empty</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">defaults</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mode http</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  balance roundrobin</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">frontend website</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bind :80</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mode http</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  default_backend web_servers</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">backend web_servers</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mode http</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  balance roundrobin</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  server s1 192.168.151.123:80 check</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  server s2 192.168.151.124:80 check</span></span></code></pre></div>`,6)])])}const d=a(l,[["render",p]]);export{c as __pageData,d as default};
