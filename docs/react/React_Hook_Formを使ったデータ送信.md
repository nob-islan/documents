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
            ├── authThunks.ts
            └── Auth.tsx
```

## 実装

### `features/auth/authApi.ts`

APIの仕様に合わせたモデル`LoginApiRequest`および`LoginApiResponse`を使ってAPIを呼び出します。

```ts
export interface LoginApiRequest {
  name: string;
  password: string;
}

interface LoginApiResponse {
  valid: boolean;
}

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

  return { valid: data.valid };
};
```

### `features/auth/authThunks.ts`

画面仕様に合わせた型`LoginForm`から`LoginApiRequest`にデータを詰め替えてAPI呼び出し関数を実行します。

```ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import { loginApi, LoginApiRequest } from "./authApi";

export interface LoginForm {
  name: string;
  password: string;
}

export const login = createAsyncThunk<void, LoginForm>(
  "auth/login",
  async (form) => {
    const req: LoginApiRequest = { name: form.name, password: form.password };

    try {
      const response = await loginApi(req);
      alert(response.valid ? "ログイン成功" : "ログイン失敗");
    } catch (e) {
      alert("不明なエラーが発生しました。");
    }
  },
);
```

### `features/auth/Auth.tsx`

入力された認証向けのデータを`LoginForm`にセットします。

```tsx
import { useForm } from "react-hook-form";

import { useAppDispatch } from "../../app/hooks";
import { login, LoginForm } from "./authThunks";

export const Auth = () => {
  const { register, handleSubmit } = useForm<LoginForm>();
  const dispatch = useAppDispatch();

  return (
    <div>
      <form onSubmit={handleSubmit((form: LoginForm) => dispatch(login(form)))}>
        <div>
          <input {...register("name")} placeholder="user" />
        </div>
        <div>
          <input {...register("password")} type="password" placeholder="pass" />
        </div>
        <div>
          <button type="submit">ログイン</button>
        </div>
      </form>
    </div>
  );
};
```
