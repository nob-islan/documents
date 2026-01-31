# Reactのenvファイル設定方法

環境によって切り替えのできるシステム設定値の作り方について記載します。

cf. https://ja.vite.dev/guide/env-and-mode

## 設定方法

各種ファイルの記載方法です。

### 依存パッケージ

下記で`dotenv`をインストールします:

```shell
npm install dotenv-cli
```

### 設定ファイル

#### `.env.xxx`

ルートディレクトリに、各環境ごとの設定ファイルを用意します:

- `.env.dev`

```
VITE_APP_TEST="dev"
```

- `.env.stg`

```
VITE_APP_TEST="stg"
```

#### `package.json`

起動する際のコマンドを記載します。

```json
"scripts": {
  "start-dev": "dotenv -e .env.dev vite -- --host",
  "start-stg": "dotenv -e .env.stg vite -- --host",
},
```

例として、開発環境向けの環境変数を参照する際は`npm run start-dev`でアプリを起動します。

### 設定値を参照するクラス

`process.env`で環境変数を参照します:

```tsx
export const Home = () => {
  return (
    <>
      <p>env: {import.meta.env.VITE_APP_TEST}</p>
    </>
  );
};
```
