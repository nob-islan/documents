import{_ as a,o as n,c as i,a6 as p}from"./chunks/framework.C05ZgNLH.js";const o=JSON.parse('{"title":"CustomResource作成手順","description":"","frontmatter":{},"headers":[],"relativePath":"kubernetes/resources/CustomResource作成手順.md","filePath":"kubernetes/resources/CustomResource作成手順.md"}'),e={name:"kubernetes/resources/CustomResource作成手順.md"};function l(t,s,h,k,r,c){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="customresource作成手順" tabindex="-1">CustomResource作成手順 <a class="header-anchor" href="#customresource作成手順" aria-label="Permalink to “CustomResource作成手順”">​</a></h1><p>独自リソースを作るためのマニフェストファイルのサンプルです。</p><p>cf. <a href="https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/" target="_blank" rel="noreferrer">https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/</a></p><h2 id="crd" tabindex="-1">CRD <a class="header-anchor" href="#crd" aria-label="Permalink to “CRD”">​</a></h2><p>Custom Resource Definitionです。カスタムリソース自体を定義します。</p><div class="language-yaml"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">apiVersion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">apiextensions.k8s.io/v1</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">kind</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">CustomResourceDefinition</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">metadata</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">samples.crds.example.nob</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # &lt;spec.names.plural&gt;.&lt;spec.group&gt;の形式にする</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">spec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  group</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">crds.example.nob</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # リソースのグループ名 REST APIのパスに使われる</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  versions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    - </span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">v1</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      served</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      storage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      schema</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">        openAPIV3Schema</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">          type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">object</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">          properties</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">            spec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">              type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">object</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">              properties</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># リソースに持たせるプロパティ</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">                nob-property1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">                  type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">string</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">                nob-property2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">                  type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">boolean</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  scope</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Namespaced</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # リソースのスコープ</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  names</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 各種名称</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    plural</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">samples</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 複数系</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    singular</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">sample</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # 単数系</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    kind</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Sample</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # kindに指定する文字列</span></span></code></pre></div><p><code>kubectl apply -f {ファイル名}</code>でCRDを登録した後、<code>kubectl describe crd {metadata.name}</code>で詳細を確認できます:</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span>$ kubectl describe crd samples.crds.example.nob</span></span>
<span class="line"><span>Name:         samples.crds.example.nob</span></span>
<span class="line"><span>Namespace:</span></span>
<span class="line"><span>Labels:       &lt;none&gt;</span></span>
<span class="line"><span>Annotations:  &lt;none&gt;</span></span>
<span class="line"><span>API Version:  apiextensions.k8s.io/v1</span></span>
<span class="line"><span>Kind:         CustomResourceDefinition</span></span>
<span class="line"><span>Metadata:</span></span>
<span class="line"><span>  Creation Timestamp:  2025-01-26T09:03:39Z</span></span>
<span class="line"><span>  Generation:          1</span></span>
<span class="line"><span>  Resource Version:    67443</span></span>
<span class="line"><span>  UID:                 a7381356-9dc2-46df-98cb-42819a5bd6cf</span></span>
<span class="line"><span>Spec:</span></span>
<span class="line"><span>  Conversion:</span></span>
<span class="line"><span>    Strategy:  None</span></span>
<span class="line"><span>  Group:       crds.example.nob</span></span>
<span class="line"><span>  Names:</span></span>
<span class="line"><span>    Kind:       Sample</span></span>
<span class="line"><span>    List Kind:  SampleList</span></span>
<span class="line"><span>    Plural:     samples</span></span>
<span class="line"><span>    Singular:   sample</span></span>
<span class="line"><span>  Scope:        Namespaced</span></span>
<span class="line"><span>  Versions:</span></span>
<span class="line"><span>    Name:  v1</span></span>
<span class="line"><span>    Schema:</span></span>
<span class="line"><span>      openAPIV3Schema:</span></span>
<span class="line"><span>        Properties:</span></span>
<span class="line"><span>          Spec:</span></span>
<span class="line"><span>            Properties:</span></span>
<span class="line"><span>              nob-property1:</span></span>
<span class="line"><span>                Type:  string</span></span>
<span class="line"><span>              nob-property2:</span></span>
<span class="line"><span>                Type:  boolean</span></span>
<span class="line"><span>            Type:      object</span></span>
<span class="line"><span>        Type:          object</span></span>
<span class="line"><span>    Served:            true</span></span>
<span class="line"><span>    Storage:           true</span></span>
<span class="line"><span>Status:</span></span>
<span class="line"><span>  Accepted Names:</span></span>
<span class="line"><span>    Kind:       Sample</span></span>
<span class="line"><span>    List Kind:  SampleList</span></span>
<span class="line"><span>    Plural:     samples</span></span>
<span class="line"><span>    Singular:   sample</span></span>
<span class="line"><span>  Conditions:</span></span>
<span class="line"><span>    Last Transition Time:  2025-01-26T09:03:39Z</span></span>
<span class="line"><span>    Message:               no conflicts found</span></span>
<span class="line"><span>    Reason:                NoConflicts</span></span>
<span class="line"><span>    Status:                True</span></span>
<span class="line"><span>    Type:                  NamesAccepted</span></span>
<span class="line"><span>    Last Transition Time:  2025-01-26T09:03:39Z</span></span>
<span class="line"><span>    Message:               the initial names have been accepted</span></span>
<span class="line"><span>    Reason:                InitialNamesAccepted</span></span>
<span class="line"><span>    Status:                True</span></span>
<span class="line"><span>    Type:                  Established</span></span>
<span class="line"><span>  Stored Versions:</span></span>
<span class="line"><span>    v1</span></span>
<span class="line"><span>Events:  &lt;none&gt;</span></span></code></pre></div><h2 id="cr" tabindex="-1">CR <a class="header-anchor" href="#cr" aria-label="Permalink to “CR”">​</a></h2><p>リソース本体です。コントローラが無いため何もできません。</p><div class="language-yaml"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">apiVersion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">crds.example.nob/v1</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # CRDで設定した&lt;spec.group&gt;および&lt;spec.versions&gt;</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">kind</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">Sample</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> # CRDで設定したkind</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">metadata</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">nob-first-cr</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">spec</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># CRDで設定した各種プロパティ</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  nob-property1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;nob test&quot;</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  nob-property2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span></span></code></pre></div><p><code>kubectl apply -f {ファイル名}</code>でリソースを作成した後、<code>kubectl describe {kind} {リソース名}</code>で詳細を確認できます:</p><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span>$ kubectl describe sample nob-first-cr</span></span>
<span class="line"><span>Name:         nob-first-cr</span></span>
<span class="line"><span>Namespace:    default</span></span>
<span class="line"><span>Labels:       &lt;none&gt;</span></span>
<span class="line"><span>Annotations:  &lt;none&gt;</span></span>
<span class="line"><span>API Version:  crds.example.nob/v1</span></span>
<span class="line"><span>Kind:         Sample</span></span>
<span class="line"><span>Metadata:</span></span>
<span class="line"><span>  Creation Timestamp:  2025-01-26T09:03:43Z</span></span>
<span class="line"><span>  Generation:          1</span></span>
<span class="line"><span>  Resource Version:    67451</span></span>
<span class="line"><span>  UID:                 35f3e3a1-db89-4a7f-b975-448b7a254034</span></span>
<span class="line"><span>Spec:</span></span>
<span class="line"><span>  nob-property1:  nob test</span></span>
<span class="line"><span>  nob-property2:  true</span></span>
<span class="line"><span>Events:           &lt;none&gt;</span></span></code></pre></div>`,13)])])}const E=a(e,[["render",l]]);export{o as __pageData,E as default};
