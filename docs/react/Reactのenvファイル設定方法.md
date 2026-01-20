# Reactのenvファイル設定方法

環境によって切り替えのできるシステム設定値の作り方について記載します。

## 設定方法

各種ファイルの記載方法です。

### 依存パッケージ

下記で`dotenv`をインストールします:

```shell
npm install dotenv-cli
```

### 設定ファイル

#### .env.XXX

ルートディレクトリに、各環境ごとの設定ファイルを用意します:

- .env.dev

```
REACT_APP_TEST="dev"
```

- .env.stg

```
REACT_APP_TEST="stg"
```

#### package.json

起動する際のコマンドを記載します。

```json
"scripts": {
  "start-dev": "dotenv -e .env.dev react-scripts start",
  "start-stg": "dotenv -e .env.stg react-scripts start",
},
```

例として、開発環境向けの環境変数を参照する際は`npm run start-dev`でアプリを起動します。

### 設定値を参照するクラス

`process.env`で環境変数を参照します:

```tsx
const Home = () => {
  return (
    <div>
      <p>Test: {process.env.REACT_APP_TEST}</p>
    </div>
  );
};

export default Home;
```
