import{_ as i,o as n,c as a,a6 as l}from"./chunks/framework.C3mgXFrM.js";const o=JSON.parse('{"title":"nginxでパスベースルーティングをする","description":"","frontmatter":{},"headers":[],"relativePath":"nginx/nginxでパスベースルーティングをする.md","filePath":"nginx/nginxでパスベースルーティングをする.md"}'),e={name:"nginx/nginxでパスベースルーティングをする.md"};function t(p,s,h,k,r,c){return n(),a("div",null,[...s[0]||(s[0]=[l(`<h1 id="nginxでパスベースルーティングをする" tabindex="-1">nginxでパスベースルーティングをする <a class="header-anchor" href="#nginxでパスベースルーティングをする" aria-label="Permalink to “nginxでパスベースルーティングをする”">​</a></h1><p>下記の要領で<code>/etc/nginx/conf.d/easyapp.conf</code>を作成するとリクエストをルーティングできます:</p><div class="language-ini"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">server {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    listen 80 default_server</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    location /api/ {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # APIへのリクエストについては8080に転送</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        proxy_pass http://localhost:8080</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    location / {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # それ以外（画面想定）については3000に転送</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        proxy_pass http://localhost:3000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,3)])])}const _=i(e,[["render",t]]);export{o as __pageData,_ as default};
