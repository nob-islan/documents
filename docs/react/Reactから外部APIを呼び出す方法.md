# React から外部 API を呼び出す方法

axios を使って外部 API を呼び出す方法を記載します。サンプルとして、API から受け取った message を state に保持する実装をします。

## ディレクトリ構成

```shell
.
├── app
│   ├── rootReducer.ts
│   └── store.ts               # redux-thunk導入向けの設定を入れます。
├── App.tsx
└── features
    └── message
        ├── messageAction.ts
        ├── messageApi.ts      # ここにAPI呼び出しの実体を定義します。
        ├── messageReducer.ts
        ├── messageState.ts
        └── Message.tsx
```

## サンプルコード

API 呼び出しに関係のあるクラスのみ記載します。

### app/store.ts

thunk ミドルウェアを利用するため、`createStore`を下記で宣言します。

```ts
import { applyMiddleware, legacy_createStore as createStore } from "redux";
import { rootReducer } from "./rootReducer";
import { thunk } from "redux-thunk";

export const store = createStore(
  rootReducer,
  undefined,
  applyMiddleware(thunk)
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### features/message/Message.tsx

```tsx
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../app/store";
import { getMessage } from "./messageAction";

interface Props {}

/**
 * APIからのメッセージを表示するコンポーネントです。
 *
 * @param props
 * @returns
 */
const Message: React.FC<Props> = (props) => {
  const message = useSelector((state: RootState) => state.message.message);
  const dispatch = useDispatch<AppDispatch>();

  /**
   * API呼び出しボタン押下時の動作を定義します。
   */
  const handleOnClickButton = () => {
    dispatch(getMessage());
  };

  return (
    <div>
      <div>{message}</div>
      <button onClick={handleOnClickButton}>API呼び出し</button>
    </div>
  );
};

export default Message;
```

### features/message/messageState.ts

```ts
/**
 * メッセージを保持するstateです。
 */
export interface MessageState {
  message: string;
}

/**
 * MessageStateの初期状態です。
 */
export const initialMessageState: MessageState = {
  message: "Initial message",
};
```

### features/message/messageApi.ts

API 呼び出し処理の実体を担う関数を実装します。

```ts
import axios from "axios";

/**
 * APIコールをしてメッセージを取得します。
 *
 * @returns メッセージ
 */
export const callApi = async (): Promise<string> => {
  try {
    const response = await axios.get("/api/v1/greet");
    return response.data.message;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    throw new Error("API request failed");
  }
};
```

### features/message/messageAction.ts

非同期関数として、API 呼び出し関数を実行してその結果を state に保持する関数を定義します。

```ts
import { AppDispatch } from "../../app/store";
import { callApi } from "./messageApi";

/**
 * Messageのaction typeを定義します。
 */
export const MessageActonTypeConst = {
  SET_MESSAGE: "SET_MESSAGE",
} as const;

/**
 * Messageのactionを定義します。
 */
export const messageActions = {
  /**
   * 与えられたメッセージを保持します。
   *
   * @param message メッセージ
   */
  setMessage: (message: string) => ({
    type: MessageActonTypeConst.SET_MESSAGE,
    message: message,
  }),
};

export type MessageActonTypes = ReturnType<
  (typeof messageActions)[keyof typeof messageActions]
>;

/**
 * APIを呼び出して、取得したメッセージをstateに保持します。
 */
export const getMessage = () => async (dispatch: AppDispatch) => {
  try {
    const message = await callApi();
    dispatch(messageActions.setMessage(message));
  } catch (error) {
    alert("メッセージ取得に失敗しました。");
  }
};
```

### features/message/messageReducer.ts

```ts
import { MessageActonTypeConst, MessageActonTypes } from "./messageAction";
import { initialMessageState, MessageState } from "./messageState";

/**
 * Messageのstateを更新します。
 *
 * @param state MessageState
 * @param action messageAction
 * @returns MessageState
 */
export const messageReducer = (
  state = initialMessageState,
  action: MessageActonTypes
): MessageState => {
  switch (action.type) {
    case MessageActonTypeConst.SET_MESSAGE:
      return {
        ...state,
        message: action.message,
      };
    default:
      return state;
  }
};
```
