# React Hook Form を使ったデータ送信方法

React Hook Form を使って、画面上に入力した値を API に送信する方法を記載します。サンプルとして、簡単なログイン画面を実装します。

## ライブラリのインストール

```shell
npm install react-hook-form
```

## 実装

### Login.tsx

`LoginFormData`を定義し、入力された認証向けのデータをセットします。

```tsx
import { useForm } from "react-hook-form";
import { login } from "./loginAction";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../app/store";

interface Props {}

/**
 * 認証フォームの構造体です。
 */
export type LoginFormData = {
  username: string;
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
          <input {...register("username")} />
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

### loginAction.ts

後述の API 呼び出し関数をコールします。

```ts
import { AppDispatch } from "../../app/store";
import { LoginFormData } from "./Login";
import { callApi } from "./loginApi";

/**
 * APIを呼び出して、取得したメッセージをstateに保持します。
 */
export const login = (data: LoginFormData) => async (dispatch: AppDispatch) => {
  try {
    const message = await callApi(data);
    alert(message);
  } catch (error) {
    alert("メッセージ取得に失敗しました。");
  }
};
```

### loginApi.ts

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
  const payload = {
    username: data.username,
    password: data.password,
  };

  const response = await axios.post(
    "http://localhost:8080/sample/login",
    payload
  );

  if (response.statusText !== "OK") {
    throw new Error("API request failed");
  }
  return response.data.message;
};
```
