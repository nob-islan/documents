# Reactプロジェクトセットアップ

ReactおよびTypeScriptを使ったWebプロジェクトの初期セットアップ方法について記載します。

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
npm install redux react-redux react-router-dom
```

### scss

- `XXX.module.scss`を使えるようにするため、下記をインストールします。

```shell
npm install sass node-sass
```

## Redux向け実装

Reduxを動かすために必要な改修およびサンプルコードについて記載します。サンプルでは + ボタンと - ボタンによってカウンターを増減させる画面を実装します。

### ディレクトリ構成

自動生成されるもののうち、手を入れる必要がないものについては除外しています。

```shell
.
└── src
    ├── app
    │   ├── rootReducer.ts         # reducerの統合
    │   └── store.ts               # store作成
    ├── app.module.scss            # Appの装飾
    ├── App.tsx                    # アプリケーションコンテンツのroot
    ├── features
    │   └── counter
    │       ├── counterAction.ts   # 各コンポーネントの動作
    │       ├── counterReducer.ts  # 各コンポーネントの状態変化関数の実装
    │       ├── counterState.ts    # 各コンポーネントの状態定義
    │       └── Counter.tsx        # 各コンポーネントの本体定義
    ├── index.module.scss          # ページ全体の装飾
    ├── index.tsx                  # アプリケーションのエントリ
    └── .prettierrc                # コードフォーマットの定義
```

### クラス一覧

各クラスに必要な修正、または新規作成方法について記載します。

#### .prettierrc

コードのフォーマットに関する設定を定義します。

```json
{
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "none",
  "semi": true
}
```

#### app/store.ts

各種reducerを取りまとめたstoreを作成します。

```ts
import { legacy_createStore as createStore } from "redux";
import { rootReducer } from "./rootReducer";

export const store = createStore(rootReducer);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### app/rootReducer.ts

reducerを統合します。reducerが増えるたびに`rootReducer`への追記が必要です。

```ts
import { combineReducers } from "redux";
import { counterReducer } from "../features/counter/counterReducer";

/**
 * reducerを統合します。
 */
export const rootReducer = combineReducers({
  counter: counterReducer,
});
```

#### index.tsx

`Provider`コンポーネントで`App`コンポーネントをラップします。

```tsx
<Provider store={store}>
  <App />
</Provider>
```

#### App.tsx

ルーティングを設定します。

```tsx
import style from "./app.module.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Counter from "./features/counter/Counter";

function App() {
  return (
    <BrowserRouter>
      <div className={style.body}>
        <Routes>
          <Route path="/" element={<Counter />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```

#### features/counter/Counter.tsx

画面コンテンツおよびactionの呼び出しを定義します。

```tsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { counterActions } from "./counterAction";

interface Props {}

/**
 * カウンターを表示するコンポーネントです。
 *
 * @param props
 * @returns
 */
const Counter: React.FC<Props> = (props) => {
  const count = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch<AppDispatch>();

  /**
   * マイナスボタン押下時の動作を定義します。
   */
  const handleOnClickDecrementButton = () => {
    dispatch(counterActions.decrement());
  };

  /**
   * プラスボタン押下時の動作を定義します。
   */
  const handleOnClickIncrementButton = () => {
    dispatch(counterActions.increment());
  };

  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={handleOnClickDecrementButton}>-</button>
      <button onClick={handleOnClickIncrementButton}>+</button>
    </div>
  );
};

export default Counter;
```

#### features/counter/counterState.ts

画面の状態を管理するための構造体を宣言します。

```ts
/**
 * カウンターの状態を保持するstateです。
 */
export interface CounterState {
  value: number;
}

/**
 * CounterStateの初期状態です。
 */
export const initialCounterState: CounterState = {
  value: 0,
};
```

#### features/counter/counterAction.ts

各コンポーネントのアクションを定義します。

```ts
/**
 * Counterのaction typeを定義します。
 */
export const CounterActionTypeConst = {
  INCREMENT: "INCREMENT",
  DECREMENT: "DECREMENT",
} as const;

/**
 * Counterのactionを定義します。
 */
export const counterActions = {
  /**
   * 値を増加させます。
   */
  increment: () => ({
    type: CounterActionTypeConst.INCREMENT,
  }),

  /**
   * 値を減少させます。
   */
  decrement: () => ({
    type: CounterActionTypeConst.DECREMENT,
  }),
};

export type CounterActionTypes = ReturnType<
  (typeof counterActions)[keyof typeof counterActions]
>;
```

#### features/counter/counterReducer.ts

各コンポーネントの状態変化を返す関数を定義します。

```ts
import { CounterActionTypeConst, CounterActionTypes } from "./counterAction";
import { CounterState, initialCounterState } from "./counterState";

/**
 * Counterのstateを更新します。
 *
 * @param state CounterState
 * @param action counterAction
 * @returns CounterState
 */
export const counterReducer = (
  state = initialCounterState,
  action: CounterActionTypes,
): CounterState => {
  switch (action.type) {
    case CounterActionTypeConst.INCREMENT:
      return {
        ...state,
        value: state.value + 1,
      };
    case CounterActionTypeConst.DECREMENT:
      return {
        ...state,
        value: state.value - 1,
      };
    default:
      return state;
  }
};
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
