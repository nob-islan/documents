# React Hook Form を使ったデータ送信方法

React Hook Form を使って、画面上に入力した値を API に送信する方法を記載します。サンプルとして、簡単なログイン画面を実装します。

## ライブラリのインストール

```shell
npm install react-hook-form redux-thunk axios
```

## 実装

### app/store.ts

ミドルウェア利用向けに store.ts を下記で作成します。

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

### features/login/Login.tsx

`LoginFormData`を定義し、入力された認証向けのデータをセットします。

```tsx
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";
import { login } from "./loginAction";

interface Props {}

/**
 * 認証フォームの構造体です。
 */
export type LoginFormData = {
  name: string;
  password: string;
};

/**
 * ログイン画面のコンポーネントです。
 *
 * @param props
 * @returns
 */
const Login: React.FC<Props> = (props) => {
  const { register, handleSubmit } = useForm<LoginFormData>();
  const dispatch = useDispatch<AppDispatch>();

  /**
   *送信ボタン押下時の動作を定義します。
   *
   * @param data 認証向けデータ
   */
  const onSubmit = (data: LoginFormData) => {
    dispatch(login(data));
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <input {...register("name")} />
        </div>
        <div>
          <input {...register("password")} type="password" />
        </div>
        <div>
          <button type="submit">送信</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
```

### features/login/loginAction.ts

後述の API 呼び出し関数をコールします。

```ts
import { LoginFormData } from "./Login";
import { callApi } from "./loginApi";

/**
 * APIを呼び出して、取得したメッセージをstateに保持します。
 */
export const login = (data: LoginFormData) => async () => {
  try {
    const message = await callApi(data);
    alert(message);
  } catch (error) {
    alert("API呼び出しに失敗しました。");
  }
};
```

### features/login/loginApi.ts

ログイン API を呼び出します。

```ts
import axios from "axios";
import { LoginFormData } from "./Login";

/**
 * APIコールをして認証処理を行います。
 *
 * @returns メッセージ
 */
export const callApi = async (data: LoginFormData): Promise<string> => {
  try {
    const payload = {
      name: data.name,
      password: data.password,
    };

    const response = await axios.post("/api/v1/login", payload);
    return response.data.message;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      return error.response.data.message;
    }
    throw new Error("API request failed");
  }
};
```
