# React Hook Formを使ったデータ送信

[React Hook Form](https://react-hook-form.com/)を使って、画面上に入力した値をAPIに送信する方法を記載します。サンプルとして、簡単なログイン画面を実装します。

## ライブラリのインストール

```shell
npm install react-hook-form
```

## ディレクトリ構成

```shell
.
└── features
    └── auth
        ├── authApi.ts
        ├── authHooks.ts
        ├── auth.module.scss
        ├── authSlice.ts
        ├── authThunks.ts
        ├── Auth.tsx
        └── authTypes.ts
```

## 実装

### `features/auth/authApi.ts`

APIの仕様に合わせたモデル`LoginApiRequest`および`LoginApiResponse`を使ってAPIを呼び出します。

```ts
/**
 * ログインAPIのリクエストモデルです。
 */
type LoginRequest = {
  name: string;
  password: string;
};

/**
 * ログインAPIからの正常レスポンスを格納するモデルです。
 */
type LoginSuccess = {
  ok: true;
  valid: boolean;
};

/**
 * ログインAPIからの以上レスポンスを格納するモデルです。
 */
type LoginError = {
  ok: false;
  message: string;
};

/**
 * ログインAPIのレスポンスモデルです。
 */
type LoginResponse = LoginSuccess | LoginError;

/**
 * ログインAPIを呼び出します。
 *
 * @param req ログイン情報
 * @returns 認証可否
 */
export const login = async (req: LoginRequest): Promise<LoginResponse> => {
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

### `features/auth/authTypes.ts`

画面からAPIなどに渡す型定義を格納します。

```ts
/**
 * ログインリクエスト情報を画面から渡すモデルです。
 */
export type LoginForm = {
  name: string;
  password: string;
};
```

### `features/auth/authThunks.ts`

画面仕様に合わせた型`LoginForm`から`LoginApiRequest`にデータを詰め替えてAPI呼び出し関数を実行します。

```ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import { login } from "./authApi";
import type { LoginForm } from "./authTypes";

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
export const loginThunk = createAsyncThunk<
  LoginSuccess,
  LoginForm,
  { rejectValue: LoginError }
>("auth/login", async (form, { rejectWithValue }) => {
  try {
    const res = await login({
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

import { loginThunk } from "./authThunks";

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
      .addCase(loginThunk.pending, (state) => {
        state.valid = false;
        state.message = "ログイン中...";
      })
      /**
       * ログインAPI呼び出し正常終了時の状態遷移
       */
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.valid = action.payload.valid;
        state.message = action.payload.valid ? "ログイン完了" : "ログイン失敗";
      })
      /**
       * ログインAPI呼び出し異常終了時の状態遷移
       */
      .addCase(loginThunk.rejected, (state, action) => {
        state.valid = false;
        state.message = action.payload?.message;
      });
  },
});

export default authSlice.reducer;
```

### `features/auth/authHooks.ts`

```ts
import { useAppDispatch } from "../../app/hooks";
import { loginThunk } from "./authThunks";
import type { LoginForm } from "./authTypes";

/**
 * ログインコンポーネント向けのHooksです。
 *
 * @returns ログインコンポーネント向けHooks
 */
export const useAuthHooks = () => {
  const dispatch = useAppDispatch();

  /**
   * ログインボタン押下時の動作を定義します。
   */
  const handleClickLogin = async (form: LoginForm) => {
    await dispatch(loginThunk(form));
  };

  return { handleClickLogin };
};
```

### `features/auth/Auth.tsx`

入力された認証向けのデータを`LoginForm`にセットします。

```tsx
import { useForm } from "react-hook-form";

import { useAppSelector } from "../../app/hooks";
import style from "./auth.module.scss";
import { useAuthHooks } from "./authHooks";
import type { LoginForm } from "./authTypes";

/**
 * ログイン画面のコンポーネントです。
 *
 * @returns ログイン画面コンポーネント
 */
export const Auth = () => {
  const { register, handleSubmit } = useForm<LoginForm>();
  const authState = useAppSelector((state) => state.auth);
  const { handleClickLogin } = useAuthHooks();

  return (
    <div className={style.container}>
      <form
        onSubmit={handleSubmit((form: LoginForm) => handleClickLogin(form))}
      >
        <div className={style.inputWrapper}>
          <input
            aria-label="name"
            {...register("name")}
            type="text"
            placeholder="name"
            className={style.input}
          />
        </div>
        <div className={style.inputWrapper}>
          <input
            aria-label="password"
            {...register("password")}
            type="password"
            placeholder="password"
            className={style.input}
          />
        </div>
        <div className={style.loginButtonWrapper}>
          <button type="submit" className={style.loginButton}>
            ログイン
          </button>
        </div>
        {authState.message && <div>{authState.message}</div>}
      </form>
    </div>
  );
};
```

### `features/auth/auth.module.scss`

```scss
$fontSize: 18px;
$borderRadius: 10px;

.container {
  text-align: center;

  .inputWrapper {
    padding: 10px;

    .input {
      border-radius: $borderRadius;
      width: 300px;
      height: 35px;
      font-size: $fontSize;
    }
  }

  .loginButtonWrapper {
    padding: 20px;

    .loginButton {
      border-radius: $borderRadius;
      width: 120px;
      height: 40px;
      font-size: $fontSize;
      background-color: #ff9900;
    }

    .loginButton:hover {
      cursor: pointer;
      background-color: #fa6f00;
    }
  }
}
```
