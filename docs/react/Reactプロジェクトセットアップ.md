# Reactプロジェクトセットアップ

ReactおよびTypeScriptを使ったWebプロジェクトの初期セットアップ方法について記載します。

cf. https://react-redux.js.org/tutorials/quick-start

## プロジェクト作成

プロジェクトの新規作成方法について記載します。

- [Vite](https://vite.dev/)を使ってプロジェクトを新規作成します。

```shell
# cf. https://vite.dev/guide/?utm_source=chatgpt.com#scaffolding-your-first-vite-project
npm create vite@latest easyweb -- --template react-ts
cd easyweb
npm install
```

- reduxおよび他必要なものをインストールします。

```shell
npm install @reduxjs/toolkit react-redux react-router-dom
```

- `xxx.module.scss`を使えるようにするため、下記をインストールします。

```shell
npm install sass
```

- [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)によるフォーマットを有効化するため、下記をインストールします:

```shell
npm install eslint-plugin-simple-import-sort
```

## Redux向け実装

Reduxを動かすために必要な改修およびサンプルコードについて記載します。サンプルではカウンターを増減させる画面を実装します。

### ディレクトリ構成

```shell
.
├── eslint.config.js             # ESLintによるコードフォーマットの設定
├── .prettierrc                  # Prettierによるコードフォーマットの設定
└── src
    ├── app
    │   ├── hooks.ts             # storeを操作する関数の定義
    │   └── store.ts             # 各コンポーネントの状態を持つstoreの管理
    ├── app.module.scss          # コンポーネントの装飾
    ├── App.tsx                  # アプリケーションコンテンツのroot
    ├── features
    │   └── counter
    │       ├── counterSlice.ts  # コンポーネントの状態およびアクションの定義
    │       └── Counter.tsx      # コンポーネント本体
    ├── index.scss               # 画面全体の装飾
    └── main.tsx                 # アプリケーションのエントリポイント
```

### クラス一覧

各クラスに必要な修正、または新規作成方法について記載します。

#### `eslint.config.js`

ESLintによるフォーマットに関する設定を定義します。

```js
import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
  },
]);
```

#### `.prettierrc`

Prettierによるフォーマットに関する設定を定義します。

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "none",
  "semi": true
}
```

#### `app/store.ts`

各種reducerを取りまとめたstoreを作成します。

```ts
import { configureStore } from "@reduxjs/toolkit";

import counterReducer from "../features/counter/counterSlice";

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### `app/hooks.ts`

storeを操作する関数を定義します。

```ts
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

#### `main.tsx`

`Provider`コンポーネントで`App`コンポーネントをラップします。

```tsx
import "./index.scss";

import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import App from "./App";
import { store } from "./app/store";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <Provider store={store}>
    <App />
  </Provider>,
);
```

#### `features/counter/Counter.tsx`

画面コンテンツおよびactionの呼び出しを定義します。

```tsx
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { decrement, increment } from "./counterSlice";

/**
 * カウンター画面のPropsを定義するモデルです。
 */
interface CounterProps {
  title: string;
}

/**
 * カウンター画面を提供するコンポーネントです。
 *
 * @param カウンター画面のProps
 * @returns カウンター画面コンポーネント
 */
export const Counter = ({ title }: CounterProps) => {
  const count = useAppSelector((state) => state.counter.value);
  const dispatch = useAppDispatch();

  return (
    <div>
      <div>
        <h1>{title}</h1>
        <button
          aria-label="Increment value"
          onClick={() => dispatch(increment())}
        >
          Increment
        </button>
        <span>{count}</span>
        <button
          aria-label="Decrement value"
          onClick={() => dispatch(decrement())}
        >
          Decrement
        </button>
      </div>
    </div>
  );
};
```

#### `features/counter/counterSlice.ts`

画面の状態を管理するためのreducerおよびactionを定義します。

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/**
 * カウンター画面の状態を管理するstateです。
 */
type CounterState = {
  value: number;
};

const initialState: CounterState = {
  value: 0,
};

/**
 * incrementByAmountによって変化する状態を定義するモデルです。
 */
type IncrementByAmountPayload = {
  value: number;
};

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (
      state,
      action: PayloadAction<IncrementByAmountPayload>,
    ) => {
      state.value += action.payload.value;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
```

#### `App.tsx`

ルーティングを設定します。

```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";

import style from "./app.module.scss";
import { Counter } from "./features/counter/Counter";

const App = () => {
  return (
    <BrowserRouter>
      <div className={style.body}>
        <Routes>
          <Route path="/" element={<Counter title="First counter" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
```

#### `index.scss`

Webページ全体の装飾を定義します。

```scss
body {
  background-color: #050027;
  color: #dddddd;
}
```

#### `app.module.scss`

App配下の装飾を定義します。

```scss
.body {
  padding: 60px 60px 60px 60px;
}
```

## 起動

```shell
npm run dev -- --host
```

起動後、http://localhost:5173 で画面が確認できます。
