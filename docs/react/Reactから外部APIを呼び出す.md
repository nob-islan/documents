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
        └── me
            ├── meApi.ts     # API呼び出し
            ├── meSlice.ts   # 画面の状態管理
            ├── meThunks.ts  # フロント側のビジネスロジック
            └── Me.tsx       # 画面のレンダリング
```

## サンプルコード

### `features/me/meApi.ts`

APIの呼び出しのみを行います。

```ts
/**
 * APIのリクエストモデルです。
 */
type MeApiRequest = {
  name: string;
};

/**
 * APIからの正常レスポンスを格納するモデルです。
 */
type MeApiSuccess = {
  ok: true;
  name: string;
  age: number;
};

/**
 * APIからの異常レスポンスを格納するモデルです。
 */
type MeApiError = {
  ok: false;
  message: string;
};

/**
 * APIのレスポンスモデルです。
 */
type MeApiResponse = MeApiSuccess | MeApiError;

/**
 * ユーザ情報取得APIを呼び出します。
 *
 * @param req ユーザ情報検索リクエスト
 * @returns ユーザ情報
 */
export const meApi = async (req: MeApiRequest): Promise<MeApiResponse> => {
  const url = new URL("/api/v1/me", window.location.origin);

  url.search = new URLSearchParams({
    name: req.name,
  }).toString();

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok) {
    return {
      ok: false,
      message: data.message,
    };
  }

  return {
    ok: true,
    name: data.name,
    age: data.age,
  };
};
```

### `features/me/meThunks.ts`

フロント側で行う業務処理を実装します。API呼び出し関数を実行し、その結果に対応した型を戻すことでslice側で状態の更新が行われます。

```ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import { meApi } from "./meApi";

/**
 * リクエスト情報を画面から渡すモデルです。
 */
type FetchMeForm = {
  name: string;
};

/**
 * ユーザ情報取得成功時のレスポンスモデルです。
 */
type FetchMeSuccess = {
  name: string;
  age: number;
};

/**
 * ユーザ情報取得失敗時のレスポンスモデルです。
 */
type FetchMeError = {
  message: string;
};

/**
 * APIを呼び出して取得したユーザ情報をstateに保持します。
 */
export const fetchMe = createAsyncThunk<
  FetchMeSuccess,
  FetchMeForm,
  { rejectValue: FetchMeError }
>("me/fetch", async (form, { rejectWithValue }) => {
  try {
    const res = await meApi({ name: form.name });

    if (!res.ok) {
      return rejectWithValue({ message: res.message });
    }

    return {
      name: res.name,
      age: res.age,
    };
  } catch (e) {
    return rejectWithValue({ message: "不明なエラーが発生しました。" });
  }
});
```

### `features/me/meSlice.ts`

API呼び出し時の状態管理を`extraReducers`で行っています。

```ts
import { createSlice } from "@reduxjs/toolkit";

import { fetchMe } from "./meThunks";

/**
 * ユーザ情報表示コンポーネントの状態を保持するstateです。
 */
type MeState = {
  profile: string;
  loading: boolean;
  errorMessage?: string;
};

const initialState: MeState = {
  profile: "",
  loading: false,
  errorMessage: undefined,
};

const meSlice = createSlice({
  name: "me",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.profile = action.payload.name + " (" + action.payload.age + ")";
        state.errorMessage = "";
        state.loading = false;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.errorMessage = action.payload?.message;
        state.loading = false;
      });
  },
});

export default meSlice.reducer;
```

### `features/me/Me.tsx`

stateの値を使って画面のレンダリングを行います。

```tsx
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchMe } from "./meThunks";

/**
 * ユーザ情報を取得・表示するコンポーネントです。
 *
 * @returns ユーザ情報表示コンポーネント
 */
export const Me = () => {
  const meState = useAppSelector((state) => state.me);
  const dispatch = useAppDispatch();

  return (
    <div>
      {meState.errorMessage ? (
        <div>{meState.errorMessage}</div>
      ) : (
        <div>{meState.profile}</div>
      )}
      <button onClick={() => dispatch(fetchMe({ name: "nob" }))}>検索</button>
    </div>
  );
};
```
