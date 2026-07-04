import{_ as a,o as i,c as n,a6 as p}from"./chunks/framework.C3mgXFrM.js";const o=JSON.parse('{"title":"パスベースのルーティング","description":"","frontmatter":{},"headers":[],"relativePath":"haproxy/パスベースのルーティング.md","filePath":"haproxy/パスベースのルーティング.md"}'),e={name:"haproxy/パスベースのルーティング.md"};function l(t,s,h,k,E,r){return i(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="パスベースのルーティング" tabindex="-1">パスベースのルーティング <a class="header-anchor" href="#パスベースのルーティング" aria-label="Permalink to “パスベースのルーティング”">​</a></h1><p>cf. <a href="https://www.haproxy.com/blog/path-based-routing-with-haproxy" target="_blank" rel="noreferrer">https://www.haproxy.com/blog/path-based-routing-with-haproxy</a></p><p><code>/api</code>配下をAPIサーバに、それ以外をWebサーバにルーティングするサンプルです:</p><div class="language-ini"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">global</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  maxconn 60000</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  log 127.0.0.1 local0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  log 127.0.0.1 local1 notice</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  user  haproxy</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  group haproxy</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  chroot /var/empty</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">defaults</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  mode http</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  timeout connect 5s</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  timeout client  30s</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  timeout server  30s</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">frontend website</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  bind :80</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  acl is_api path_beg /api </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># API側にルーティングするパス</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  acl is_web path_beg /    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Web側にルーティングするパス</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  use_backend api if is_api</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  use_backend web if is_web</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">backend api</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  server a1 {APIサーバのIP}:8080 check</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">backend web</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  server w1 {WebサーバのIP}:3000 check</span></span></code></pre></div>`,4)])])}const d=a(e,[["render",l]]);export{o as __pageData,d as default};
