# React Hook Formを使ったデータ送信

[React Hook Form](https://react-hook-form.com/)を使って、画面上に入力した値をAPIに送信する方法を記載します。サンプルとして、簡単なログイン画面を実装します。

## ライブラリのインストール

```shell
npm install react-hook-form
```

## ディレクトリ構成

```shell
.
└── src
    └── features
        └── auth
            ├── authApi.ts
            ├── authSlice.ts
            ├── authThunks.ts
            └── Auth.tsx
```

## 実装

### `features/auth/authApi.ts`

APIの仕様に合わせたモデル`LoginApiRequest`および`LoginApiResponse`を使ってAPIを呼び出します。

```ts
/**
 * ログインAPIのリクエストモデルです。
 */
type LoginApiRequest = {
  name: string;
  password: string;
};

/**
 * ログインAPIからの正常レスポンスを格納するモデルです。
 */
type LoginApiSuccess = {
  ok: true;
  valid: boolean;
};

/**
 * ログインAPIからの以上レスポンスを格納するモデルです。
 */
type LoginApiError = {
  ok: false;
  message: string;
};

/**
 * ログインAPIのレスポンスモデルです。
 */
type LoginApiResponse = LoginApiSuccess | LoginApiError;

/**
 * ログインAPIを呼び出します。
 *
 * @param req ログイン情報
 * @returns 認証可否
 */
export const loginApi = async (
  req: LoginApiRequest,
): Promise<LoginApiResponse> => {
  const url = new URL("/api/v1/login", window.location.origin);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, message: data.message };
  }

  return { ok: true, valid: data.valid };
};
```

### `features/auth/authThunks.ts`

画面仕様に合わせた型`LoginForm`から`LoginApiRequest`にデータを詰め替えてAPI呼び出し関数を実行します。

```ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import { loginApi } from "./authApi";

/**
 * ログインリクエスト情報を画面から渡すモデルです。
 */
export type LoginForm = {
  name: string;
  password: string;
};

/**
 * ログイン成功時の状態をactionに渡すモデルです。
 */
type LoginSuccess = {
  valid: boolean;
};

/**
 * ログイン失敗時の状態をactionに渡すモデルです。
 */
type LoginError = {
  message: string;
};

/**
 * ログインAPIを呼び出して返ってきた結果をstateに保持します。
 */
export const login = createAsyncThunk<
  LoginSuccess,
  LoginForm,
  { rejectValue: LoginError }
>("auth/login", async (form, { rejectWithValue }) => {
  try {
    const res = await loginApi({
      name: form.name,
      password: form.password,
    });

    if (!res.ok) {
      return rejectWithValue({ message: res.message });
    }

    return { valid: res.valid };
  } catch {
    return rejectWithValue({ message: "不明なエラーが発生しました。" });
  }
});
```

### `features/auth/authSlice.ts`

API呼び出し時の状態管理をextraReducersで行います。

```ts
import { createSlice } from "@reduxjs/toolkit";

import { login } from "./authThunks";

/**
 * ログインの状態を保持するstateです。
 */
type AuthState = {
  valid: boolean;
  message?: string;
};

const initialState: AuthState = {
  valid: false,
  message: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /**
       * ログインAPI呼び出し開始時の状態遷移
       */
      .addCase(login.pending, (state) => {
        state.valid = false;
        state.message = "ログイン中...";
      })
      /**
       * ログインAPI呼び出し正常終了時の状態遷移
       */
      .addCase(login.fulfilled, (state, action) => {
        state.valid = action.payload.valid;
        state.message = action.payload.valid ? "ログイン完了" : "ログイン失敗";
      })
      /**
       * ログインAPI呼び出し異常終了時の状態遷移
       */
      .addCase(login.rejected, (state, action) => {
        state.valid = false;
        state.message = action.payload?.message;
      });
  },
});

export default authSlice.reducer;
```

### `features/auth/Auth.tsx`

入力された認証向けのデータを`LoginForm`にセットします。

```tsx
import { useForm } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { login, type LoginForm } from "./authThunks";

/**
 * ログイン画面のコンポーネントです。
 *
 * @returns ログイン画面コンポーネント
 */
export const Auth = () => {
  const { register, handleSubmit } = useForm<LoginForm>();
  const authState = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  return (
    <div>
      <form onSubmit={handleSubmit((form: LoginForm) => dispatch(login(form)))}>
        <div>
          <input {...register("name")} type="text" placeholder="name" />
        </div>
        <div>
          <input {...register("password")} type="password" placeholder="pass" />
        </div>
        <div>
          <button type="submit">ログイン</button>
        </div>
        {authState.message && <div>{authState.message}</div>}
      </form>
    </div>
  );
};
```
