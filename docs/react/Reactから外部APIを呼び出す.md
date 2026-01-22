# Reactから外部APIを呼び出す

バックエンドと疎通を取る実装のサンプルです。APIから受け取ったメッセージを画面表示します。

cf.

- https://redux-toolkit.js.org/api/createAsyncThunk
- https://redux-toolkit.js.org/rtk-query/overview

## ディレクトリ構成

```shell
.
└── src
    └── features
        └── message
            ├── messageApi.ts     # API呼び出し
            ├── messageSlice.ts   # 画面の状態管理
            ├── messageThunks.ts  # フロント側のビジネスロジック
            └── Message.tsx       # 画面のレンダリング
```

## サンプルコード

### `features/message/messageSlice.ts`

API呼び出し時の状態管理を`extraReducers`で行っています。

```ts
import { createSlice } from "@reduxjs/toolkit";

import { fetchMessage } from "./messageThunks";

interface MessageState {
  text: string;
  error?: string;
  loading: boolean;
}

const initialState: MessageState = {
  text: "Empty message",
  loading: false,
};

const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.text = action.payload.date + ", " + action.payload.message;
        state.error = undefined;
      })
      .addCase(fetchMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error;
      });
  },
});

export default messageSlice.reducer;
```

### `features/message/messageApi.ts`

APIの呼び出しのみを行います。

```ts
interface MessageApiResponse {
  ok: boolean;
  message: string;
  date: string;
}

export async function fetchMessageApi(): Promise<MessageApiResponse> {
  const url = new URL("/api/v1/me", window.location.origin);

  url.search = new URLSearchParams({
    name: "nob",
  }).toString();

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  const data = await res.json();

  return {
    ok: res.ok,
    message: data.message,
    date: data.date,
  };
}
```

### `features/message/messageThunks.ts`

フロント側で行う業務処理を実装します。API呼び出し関数を実行し、その結果に対応した型を戻すことでslice側で状態の更新が行われます。

```ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import { fetchMessageApi } from "./messageApi";

interface FetchMessageResponse {
  message: string;
  date: string;
}

interface FetchMessageError {
  error: string;
}

export const fetchMessage = createAsyncThunk<
  FetchMessageResponse,
  void,
  { rejectValue: FetchMessageError }
>("message/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await fetchMessageApi();
    if (!response.ok) {
      return rejectWithValue({ error: response.message });
    }
    return {
      message: response.message,
      date: response.date,
    };
  } catch (e) {
    return rejectWithValue({ error: "不明なエラーが発生しました。" });
  }
});
```

### `features/message/Message.tsx`

stateの値を使って画面のレンダリングを行います。

```tsx
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchMessage } from "./messageThunks";

export function Message() {
  const message = useAppSelector((state) => state.message);
  const dispatch = useAppDispatch();

  return (
    <div>
      <h1>{message.error ? message.error : message.text}</h1>
      <button onClick={() => dispatch(fetchMessage())}>
        {message.loading ? "Loading..." : "API呼び出し"}
      </button>
    </div>
  );
}
```
