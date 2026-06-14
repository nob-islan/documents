# Reactから外部APIを呼び出す

バックエンドと疎通を取る実装のサンプルです。APIから受け取ったメッセージを画面表示します。

cf.

- https://redux-toolkit.js.org/api/createAsyncThunk
- https://redux-toolkit.js.org/rtk-query/overview

## ディレクトリ構成

```shell
.
└── features
    └── me
        ├── meApi.ts        # API呼び出しの実体
        ├── meHooks.ts      # Modalの開閉などの画面操作
        ├── me.module.scss  # 画面装飾
        ├── meSlice.ts      # コンポーネントの状態およびアクションの定義
        ├── meStyles.ts     # Modal向けstyle定義
        ├── meThunks.ts     # API呼び出しなど非同期処理を伴うロジック
        ├── Me.tsx          # 画面コンポーネント
        └── meTypes.ts      # 各種構造体
```

## サンプルコード

### `features/me/meApi.ts`

APIの呼び出しのみを行います。

```ts
/**
 * ユーザ情報取得APIのリクエストモデルです。
 */
type MeRequest = {
  name: string;
};

/**
 * ユーザ情報取得APIからの正常レスポンスを格納するモデルです。
 */
type MeSuccess = {
  ok: true;
  name: string;
  age: number;
};

/**
 * ユーザ情報取得APIからの異常レスポンスを格納するモデルです。
 */
type MeError = {
  ok: false;
  message: string;
};

/**
 * ユーザ情報取得APIのレスポンスモデルです。
 */
type MeResponse = MeSuccess | MeError;

/**
 * ユーザ情報取得APIを呼び出します。
 *
 * @param req ユーザ情報検索リクエスト
 * @returns ユーザ情報
 */
export const me = async (req: MeRequest): Promise<MeResponse> => {
  const url = new URL("/api/v1/me", window.location.origin);

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

### `features/me/meTypes.ts`

画面からAPIなどに渡す型定義を格納します。

```ts
/**
 * ユーザ情報取得処理時の入力モデルです。
 */
export type FetchMeArgs = {
  name: string;
};

/**
 * ユーザ情報取得成功時の状態をactionに渡すモデルです。
 */
export type FetchMeSuccess = {
  name: string;
  age: number;
};

/**
 * ユーザ情報取得失敗時の状態をactionに渡すモデルです。
 */
export type FetchMeError = {
  message: string;
};
```

### `features/me/meThunks.ts`

非同期処理をハンドリングします。。API呼び出し関数を実行し、その結果に対応した型を戻すことでslice側で状態の更新が行われます。

```ts
import { createAsyncThunk } from "@reduxjs/toolkit";

import { me } from "./meApi";
import type { FetchMeArgs, FetchMeError, FetchMeSuccess } from "./meTypes";

/**
 * ユーザ情報取得APIを呼び出して取得したユーザ情報をstateに保持します。
 */
export const fetchMeThunk = createAsyncThunk<
  FetchMeSuccess,
  FetchMeArgs,
  { rejectValue: FetchMeError }
>("me/fetch", async (form, { rejectWithValue }) => {
  try {
    const res = await me({ name: form.name });

    if (!res.ok) {
      return rejectWithValue({ message: res.message });
    }

    return { name: res.name, age: res.age };
  } catch {
    return rejectWithValue({ message: "不明なエラーが発生しました。" });
  }
});
```

### `features/me/meSlice.ts`

API呼び出し時の状態管理を`extraReducers`で行います。

```ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { fetchMeThunk } from "./meThunks";

/**
 * ユーザ情報表示コンポーネントの状態を保持するstateです。
 */
type MeState = {
  profile: string;
  loading: boolean;
  errorMessage?: string;
  isModalOpen: boolean;
};

const initialState: MeState = {
  profile: "",
  loading: false,
  errorMessage: undefined,
  isModalOpen: false,
};

const meSlice = createSlice({
  name: "me",
  initialState,
  reducers: {
    /**
     * モーダルの開閉制御
     */
    setIsModalOpen: (state: MeState, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      /**
       * ユーザ取得API呼び出し開始時の状態遷移
       */
      .addCase(fetchMeThunk.pending, (state) => {
        state.loading = true;
      })
      /**
       * ユーザ取得API呼び出し正常終了の状態遷移
       */
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.profile = action.payload.name + " (" + action.payload.age + ")";
        state.errorMessage = "";
        state.loading = false;
      })
      /**
       * ユーザ取得API呼び出し異常終了時の状態遷移
       */
      .addCase(fetchMeThunk.rejected, (state, action) => {
        state.errorMessage = action.payload?.message;
        state.isModalOpen = true;
        state.loading = false;
      });
  },
});

export const { setIsModalOpen } = meSlice.actions;

export default meSlice.reducer;
```

### `features/me/meHooks.ts`

ボタンクリック時など画面操作時の挙動を定義します。

```ts
import { useAppDispatch } from "../../app/hooks";
import { setIsModalOpen } from "./meSlice";
import { fetchMeThunk } from "./meThunks";

/**
 * ユーザ情報取得・表示コンポーネント向けのHooksです。
 *
 * @returns ユーザ情報取得・表示コンポーネント向けHooks
 */
export const useMeHooks = () => {
  const dispatch = useAppDispatch();

  /**
   * 検索ボタン押下時の動作を定義します。
   */
  const handleClickSearch = async (name: string) => {
    await dispatch(fetchMeThunk({ name: name }));
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

### `features/me/meStyles.ts`

Modal向けのstyle定義です。

```ts
/**
 * エラーメッセージモーダル向けのstyleです。
 */
export const modalStyles = {
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

### `features/me/Me.tsx`

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
import style from "./me.module.scss";
import { useMeHooks } from "./meHooks";
import { modalStyles } from "./meStyles";

/**
 * ユーザ情報を取得・表示するコンポーネントです。
 *
 * @returns ユーザ情報表示コンポーネント
 */
export const Me = () => {
  const meState = useAppSelector((state) => state.me);
  const { handleClickSearch, handleRequestClose } = useMeHooks();

  return (
    <div className={style.container}>
      <Modal
        isOpen={meState.isModalOpen}
        onRequestClose={handleRequestClose}
        style={modalStyles}
        contentLabel="Error message Modal"
      >
        {meState.errorMessage ?? <div>{meState.errorMessage}</div>}
      </Modal>
      {meState.profile ?? (
        <div className={style.profile}>{meState.profile}</div>
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

### `features/me/me.module.scss`

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
