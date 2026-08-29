# Reactから外部APIを呼び出す

バックエンドと疎通を取る実装のサンプルです。APIから受け取ったメッセージを画面表示します。

cf.

- https://redux-toolkit.js.org/api/createAsyncThunk
- https://redux-toolkit.js.org/rtk-query/overview

## ディレクトリ構成

```shell
.
└── features
    └── user
        ├── userApi.ts        # API呼び出しの実体
        ├── userHooks.ts      # Modalの開閉などの画面操作
        ├── user.module.scss  # 画面装飾
        ├── userSlice.ts      # コンポーネントの状態およびアクションの定義
        ├── userStyles.ts     # Modal向けstyle定義
        ├── userThunks.ts     # API呼び出しなど非同期処理を伴うロジック
        ├── User.tsx          # 画面コンポーネント
        └── userTypes.ts      # 各種構造体
```

## サンプルコード

### `features/user/userApi.ts`

APIの呼び出しのみを行います。

```ts
/**
 * ユーザ情報取得APIのリクエストモデルです。
 */
type UserRequest = {
  name: string;
};

/**
 * ユーザ情報取得APIからの正常レスポンスを格納するモデルです。
 */
type UserSuccess = {
  ok: true;
  name: string;
  age: number;
};

/**
 * ユーザ情報取得APIからの異常レスポンスを格納するモデルです。
 */
type UserError = {
  ok: false;
  message: string;
};

/**
 * ユーザ情報取得APIのレスポンスモデルです。
 */
type UserResponse = UserSuccess | UserError;

/**
 * ユーザ情報取得APIを呼び出します。
 *
 * @param req ユーザ情報検索リクエスト
 * @returns ユーザ情報
 */
export const user = async (req: UserRequest): Promise<UserResponse> => {
  const url = new URL("/api/v1/user", window.location.origin);

  url.search = new URLSearchParams({
    name: req.name,
  }).toString();

  const res = await fetch(url.toString(), {
    method: "GET",
  });

  const data = await res.json();

  if (!res.ok) {
    return { ok: false, message: data.message };
  }

  return { ok: true, name: data.name, age: data.age };
};
```

### `features/user/userTypes.ts`

画面からAPIなどに渡す型定義を格納します。

```ts
/**
 * ユーザ情報取得処理時の入力モデルです。
 */
export type FetchUserArgs = {
  name: string;
};

/**
 * ユーザ情報取得成功時の状態をactionに渡すモデルです。
 */
export type FetchUserSuccess = {
  name: string;
  age: number;
};

/**
 * ユーザ情報取得失敗時の状態をactionに渡すモデルです。
 */
export type FetchUserError = {
  message: string;
};
```

### `features/user/userThunks.ts`

非同期処理をハンドリングします。。API呼び出し関数を実行し、その結果に対応した型を戻すことでslice側で状態の更新が行われます。

```ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import { user } from "./userApi";
import type {
  FetchUserArgs,
  FetchUserError,
  FetchUserSuccess,
} from "./userTypes";

/**
 * ユーザ情報取得APIを呼び出して取得したユーザ情報をstateに保持します。
 */
export const fetchUserThunk = createAsyncThunk<
  FetchUserSuccess,
  FetchUserArgs,
  { rejectValue: FetchUserError }
>("user/fetch", async (form, { rejectWithValue }) => {
  try {
    const res = await user({ name: form.name });

    if (!res.ok) {
      return rejectWithValue({ message: res.message });
    }

    return { name: res.name, age: res.age };
  } catch {
    return rejectWithValue({ message: "不明なエラーが発生しました。" });
  }
});
```

### `features/user/userSlice.ts`

API呼び出し時の状態管理を`extraReducers`で行います。

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { fetchUserThunk } from "./userThunks";

/**
 * ユーザ情報表示コンポーネントの状態を保持するstateです。
 */
type UserState = {
  profile: string;
  loading: boolean;
  errorMessage?: string;
  isModalOpen: boolean;
};

const initialState: UserState = {
  profile: "",
  loading: false,
  errorMessage: undefined,
  isModalOpen: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    /**
     * モーダルの開閉制御
     */
    setIsModalOpen: (state: UserState, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /**
       * ユーザ取得API呼び出し開始時の状態遷移
       */
      .addCase(fetchUserThunk.pending, (state) => {
        state.loading = true;
      })
      /**
       * ユーザ取得API呼び出し正常終了の状態遷移
       */
      .addCase(fetchUserThunk.fulfilled, (state, action) => {
        state.profile = action.payload.name + " (" + action.payload.age + ")";
        state.errorMessage = "";
        state.loading = false;
      })
      /**
       * ユーザ取得API呼び出し異常終了時の状態遷移
       */
      .addCase(fetchUserThunk.rejected, (state, action) => {
        state.errorMessage = action.payload?.message;
        state.isModalOpen = true;
        state.loading = false;
      });
  },
});

export const { setIsModalOpen } = userSlice.actions;

export default userSlice.reducer;
```

### `features/user/userHooks.ts`

ボタンクリック時など画面操作時の挙動を定義します。

```ts
import { useAppDispatch } from "../../app/hooks";
import { setIsModalOpen } from "./userSlice";
import { fetchUserThunk } from "./userThunks";

/**
 * ユーザ情報取得・表示コンポーネント向けのHooksです。
 *
 * @returns ユーザ情報取得・表示コンポーネント向けHooks
 */
export const useUserHooks = () => {
  const dispatch = useAppDispatch();

  /**
   * 検索ボタン押下時の動作を定義します。
   */
  const handleClickSearch = async (name: string) => {
    await dispatch(fetchUserThunk({ name: name }));
  };

  /**
   * エラーメッセージモーダルクローズ時の動作を定義します。
   */
  const handleRequestClose = () => {
    dispatch(setIsModalOpen(false));
  };

  return {
    handleClickSearch,
    handleRequestClose,
  };
};
```

### `features/user/userStyles.ts`

Modal向けのstyle定義です。

```ts
import type { Styles } from "react-modal";

/**
 * エラーメッセージモーダル向けのstyleです。
 */
export const modalStyles: Styles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    color: "#000000",
  },
};
```

### `features/user/User.tsx`

事前に[react-modal](https://www.npmjs.com/package/react-modal)をインストールしておいてください。

```shell
npm install --save react-modal @types/react-modal
```

また、`main.tsx`に下記を追加してください。

```tsx
Modal.setAppElement("#root");
```

stateの値を使って画面のレンダリングを行います。

```tsx
import Modal from "react-modal";

import { useAppSelector } from "../../app/hooks";
import style from "./user.module.scss";
import { useUserHooks } from "./userHooks";
import { modalStyles } from "./userStyles";

/**
 * ユーザ情報を取得・表示するコンポーネントです。
 *
 * @returns ユーザ情報表示コンポーネント
 */
export const User = () => {
  const userState = useAppSelector((state) => state.user);
  const { handleClickSearch, handleRequestClose } = useUserHooks();

  return (
    <div className={style.container}>
      <Modal
        isOpen={userState.isModalOpen}
        onRequestClose={handleRequestClose}
        style={modalStyles}
        contentLabel="Error message Modal"
      >
        {userState.errorMessage ?? <div>{userState.errorMessage}</div>}
      </Modal>
      {userState.profile ?? (
        <div className={style.profile}>{userState.profile}</div>
      )}
      <div className={style.searchButtonWrapper}>
        <button
          onClick={() => handleClickSearch("nob")}
          className={style.searchButton}
        >
          検索
        </button>
      </div>
    </div>
  );
};
```

### `features/user/user.module.scss`

```scss
$fontSize: 18px;
$borderRadius: 10px;

.container {
  text-align: center;

  .searchButtonWrapper {
    padding: 20px;

    .searchButton {
      border-radius: $borderRadius;
      width: 120px;
      height: 40px;
      font-size: $fontSize;
      background-color: #ff9900;
    }

    .searchButton:hover {
      cursor: pointer;
      background-color: #fa6f00;
    }
  }
}
```
