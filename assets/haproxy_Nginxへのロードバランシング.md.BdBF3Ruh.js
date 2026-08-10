import{_ as s,o as a,c as p,a6 as e}from"./chunks/framework.C05ZgNLH.js";const h=JSON.parse('{"title":"Nginxへのロードバランシング","description":"","frontmatter":{},"headers":[],"relativePath":"haproxy/Nginxへのロードバランシング.md","filePath":"haproxy/Nginxへのロードバランシング.md"}'),l={name:"haproxy/Nginxへのロードバランシング.md"};function i(c,n,t,o,r,_){return a(),p("div",null,[...n[0]||(n[0]=[e(`<h1 id="nginxへのロードバランシング" tabindex="-1">Nginxへのロードバランシング <a class="header-anchor" href="#nginxへのロードバランシング" aria-label="Permalink to “Nginxへのロードバランシング”">​</a></h1><p>複数台のnginxの前段にHAProxyをロードバランサとして置く際の設定サンプルです。</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span>global</span></span>
<span class="line"><span>  maxconn 60000</span></span>
<span class="line"><span>  log 127.0.0.1 local0</span></span>
<span class="line"><span>  log 127.0.0.1 local1 notice</span></span>
<span class="line"><span>  user  haproxy</span></span>
<span class="line"><span>  group haproxy</span></span>
<span class="line"><span>  chroot /var/empty</span></span>
<span class="line"><span></span></span>
<span class="line"><span>defaults</span></span>
<span class="line"><span>  mode http</span></span>
<span class="line"><span>  balance roundrobin</span></span>
<span class="line"><span></span></span>
<span class="line"><span>frontend nginx_client</span></span>
<span class="line"><span>  bind :80</span></span>
<span class="line"><span>  mode http</span></span>
<span class="line"><span>  default_backend nginx_web</span></span>
<span class="line"><span></span></span>
<span class="line"><span>backend nginx_web</span></span>
<span class="line"><span>  mode http</span></span>
<span class="line"><span>  balance roundrobin</span></span>
<span class="line"><span>  server s1 192.168.151.61:80 check</span></span>
<span class="line"><span>  server s2 192.168.151.62:80 check</span></span></code></pre></div>`,3)])])}const g=s(l,[["render",i]]);export{h as __pageData,g as default};
