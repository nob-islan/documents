# Reactプロジェクトセットアップ

ReactおよびTypeScriptを使ったWebプロジェクトの初期セットアップ方法について記載します。

cf. https://react-redux.js.org/tutorials/quick-start

## プロジェクト作成

プロジェクトの新規作成方法について記載します。

### redux

- プロジェクトを新規作成します。

```shell
npx create-react-app easyweb --template typescript
```

- reduxおよび他必要なものをインストールします。

```shell
cd easyweb
npm install @reduxjs/toolkit react-redux react-router-dom
```

### scss

- `XXX.module.scss`を使えるようにするため、下記をインストールします。

```shell
npm install sass node-sass
```

### eslint

- [eslint-plugin-simple-import-sort](https://github.com/lydell/eslint-plugin-simple-import-sort)によるフォーマットを有効化するため、下記をインストールします:

```shell
npm install eslint-plugin-simple-import-sort
```

## Redux向け実装

Reduxを動かすために必要な改修およびサンプルコードについて記載します。サンプルではカウンターを増減させる画面を実装します。

### ディレクトリ構成

自動生成されるもののうち、手を入れる必要がないものについては除外しています。

```shell
.
└── src
    ├── app
    │   ├── hooks.ts             # storeを操作する関数の定義
    │   └── store.ts             # 各コンポーネントの状態を持つstoreの管理
    ├── app.module.scss          # コンポーネントの装飾
    ├── App.tsx                  # アプリケーションコンテンツのroot
    ├── .eslintrc.json           # ESLintによるコードフォーマットの設定
    ├── features
    │   └── counter
    │       ├── counterSlice.ts  # コンポーネントの状態およびアクションの定義
    │       └── Counter.tsx      # コンポーネント本体
    ├── index.module.scss        # 画面全体の装飾
    ├── index.tsx                # アプリケーションのエントリポイント
    └── .prettierrc              # Prettierによるコードフォーマットの設定
```

### クラス一覧

各クラスに必要な修正、または新規作成方法について記載します。

#### .prettierrc

Prettierによるフォーマットに関する設定を定義します。

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "none",
  "semi": true
}
```

#### .eslintrc.json

ESLintによるフォーマットに関する設定を定義します。

```json
{
  "plugins": ["simple-import-sort"],
  "rules": {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  }
}
```

#### app/store.ts

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

#### app/hooks.ts

storeを操作する関数を定義します。

```ts
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "./store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
```

#### index.tsx

`Provider`コンポーネントで`App`コンポーネントをラップします。

```tsx
import "./index.module.scss";

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

#### features/counter/Counter.tsx

画面コンテンツおよびactionの呼び出しを定義します。

```tsx
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { decrement, increment } from "./counterSlice";

interface CounterProps {
  title: string;
}

export function Counter({ title }: CounterProps) {
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
}
```

#### features/counter/counterSlice.ts

画面の状態を管理するためのreducerおよびactionを定義します。

```ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import type { RootState } from "../../app/store";

interface CounterState {
  value: number;
}

const initialState: CounterState = {
  value: 0,
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
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;

export const selectCount = (state: RootState) => state.counter.value;

export default counterSlice.reducer;
```

#### App.tsx

ルーティングを設定します。

```tsx
import { BrowserRouter, Route, Routes } from "react-router-dom";

import style from "./app.module.scss";
import { Counter } from "./features/counter/Counter";

function App() {
  return (
    <BrowserRouter>
      <div className={style.body}>
        <Routes>
          <Route path="/" element={<Counter title="First counter" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

#### index.module.scss

Webページ全体の装飾を定義します。

```scss
body {
  background-color: #050027;
  color: #dddddd;
}
```

#### app.module.scss

App配下の装飾を定義します。

```scss
.body {
  padding: 60px 60px 60px 60px;
}
```

## 起動

```shell
npm start
```

起動後、http://localhost:3000 で画面が確認できます。
