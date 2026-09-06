# はじめてのPlaywright

[Playwright](https://playwright.dev/)を使って画面打鍵テストを自動化します。

## 構築

- Playwrightをインストールします:

```shell
npm init playwright@latest
```

- （必要に応じて）依存関係をインストールします:

```shell
npx playwright install --with-deps
```

また、VSCode向けの拡張機能[Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)

## テスト実行

- テストを実行します:

```shell
npx playwright test
```
