import{_ as a,o as i,c as e,a6 as n}from"./chunks/framework.C05ZgNLH.js";const o=JSON.parse('{"title":"Keycloak初期セットアップ","description":"","frontmatter":{},"headers":[],"relativePath":"keycloak/Keycloak初期セットアップ.md","filePath":"keycloak/Keycloak初期セットアップ.md"}'),l={name:"keycloak/Keycloak初期セットアップ.md"};function t(h,s,p,k,r,c){return i(),e("div",null,[...s[0]||(s[0]=[n(`<h1 id="keycloak初期セットアップ" tabindex="-1">Keycloak初期セットアップ <a class="header-anchor" href="#keycloak初期セットアップ" aria-label="Permalink to “Keycloak初期セットアップ”">​</a></h1><p><a href="https://www.keycloak.org/" target="_blank" rel="noreferrer">Keycloak</a>の初期セットアップを行います。</p><h2 id="事前準備" tabindex="-1">事前準備 <a class="header-anchor" href="#事前準備" aria-label="Permalink to “事前準備”">​</a></h2><ul><li>OpenJDKを用意してください。</li><li>データベースを別途用意し、ユーザおよび空のデータベース<code>kdb</code>を作成しておいてください。</li></ul><h2 id="インストール" tabindex="-1">インストール <a class="header-anchor" href="#インストール" aria-label="Permalink to “インストール”">​</a></h2><p>cf. <a href="https://www.keycloak.org/getting-started/getting-started-zip" target="_blank" rel="noreferrer">https://www.keycloak.org/getting-started/getting-started-zip</a></p><ul><li>Keycloakをダウンロードします:</li></ul><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">wget</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> https://github.com/keycloak/keycloak/releases/download/26.5.0/keycloak-26.5.0.zip</span></span></code></pre></div><ul><li>zipファイルを解凍します:</li></ul><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unzip</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> keycloak-26.5.0.zip</span></span></code></pre></div><ul><li><code>conf/keycloak.conf</code>を下記で作成します:</li></ul><div class="language-ini"><button title="Copy Code" class="copy"></button><span class="lang">ini</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Basic settings for running in production. Change accordingly before deploying the server.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Database</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The database vendor.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">db</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=mariadb</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The username of the database user.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">db-username</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=root</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The password of the database user.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">db-password</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=password</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The full database JDBC URL. If not provided, a default URL is set based on the selected database vendor.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">db-url</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=jdbc:mariadb://localhost/kdb</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Observability</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># If the server should expose healthcheck endpoints.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#health-enabled=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># If the server should expose metrics endpoints.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#metrics-enabled=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># HTTP</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The file path to a server certificate or certificate chain in PEM format.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#https-certificate-file=\${kc.home.dir}/conf/server.crt.pem</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The file path to a private key in PEM format.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#https-certificate-key-file=\${kc.home.dir}/conf/server.key.pem</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># The proxy address forwarding mode if the server is behind a reverse proxy.</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#proxy=reencrypt</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Enables the HTTP listener.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">http-enabled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=true</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Do not attach route to cookies and rely on the session affinity capabilities from reverse proxy</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#spi-sticky-session-encoder-infinispan-should-attach-route=false</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Hostname for the Keycloak server.</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">hostname</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=localhost</span></span></code></pre></div><ul><li>設定を反映させます:</li></ul><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bin/kc.sh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> build</span></span></code></pre></div><ul><li>サーバを起動します:</li></ul><div class="language-shell"><button title="Copy Code" class="copy"></button><span class="lang">shell</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">bin/kc.sh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> start</span></span></code></pre></div><p>起動後、<a href="http://localhost:8080" target="_blank" rel="noreferrer">http://localhost:8080</a> でadmin画面を開くことができます。</p>`,17)])])}const g=a(l,[["render",t]]);export{o as __pageData,g as default};
