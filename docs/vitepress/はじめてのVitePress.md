# はじめてのVitePress

[VitePress](https://vitepress.dev/ja/)を使ってMarkdownファイルをドキュメントとして公開します。

## Getting started

cf. https://vitepress.dev/ja/guide/getting-started

## アドオン

### [VitePress Sidebar](https://vitepress-sidebar.cdget.com/)

サイドバーを自動生成します。

### [vitepress-mermaid-plugin](https://www.npmjs.com/package/vitepress-mermaid-plugin)

mermaidで描いた図をレンダリングできるようにします。

## サンプルコード

### `config.mts`

```ts
import { defineConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

/**
 * VitePress本体のオプションを設定します。
 */
const vitePressOptions = {
  srcDir: "docs",

  title: "Nob sample document",
  description: "A VitePress Site",
  themeConfig: {
    // フッタのprev, nextボタンを非表示にします。
    docFooter: {
      prev: false,
      next: false,
    },
  },
};

/**
 * サイドバーを自動生成します。
 */
const vitePressSidebarOptions = {
  documentRootPath: "docs",
  collapsed: true,
  useTitleFromFileHeading: true,
};

export default defineConfig(
  withSidebar(vitePressOptions, vitePressSidebarOptions),
);
```

### `theme/index.js`

各種cssファイルをimportします。

cf. https://vitepress.dev/ja/guide/extending-default-theme#customizing-css

```js
import DefaultTheme from "vitepress/theme";
import "./custom.css";

export default DefaultTheme;
```

### `theme/custom.css`

```css
/* 右側アウトライン（TOC）の折り返し */
.VPDocAsideOutline .outline-link {
  white-space: normal;
  line-height: 1.4;
  display: block;
  margin-bottom: 10px;
}
```
