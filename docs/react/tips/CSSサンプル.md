# CSSサンプル

よく使うデザインのサンプルコードです。

## 各要素の中央揃え

```tsx
import style from "./login.module.scss";

/**
 * ユーザ名、パスワードの入力欄およびログインボタンを提供するコンポーネントです。
 *
 * @returns ログイン画面コンポーネント
 */
export const Login = () => {
  return (
    <div className={style.container}>
      <div className={style.nameWrapper}>
        <input className={style.name} type="text" placeholder="name" />
      </div>
      <div className={style.passwordWrapper}>
        <input className={style.password} type="password" placeholder="pass" />
      </div>
      <div className={style.loginButtonWrapper}>
        <button className={style.loginButton}>Login</button>
      </div>
    </div>
  );
};
```

```scss
$inputBoxWidth: 200px;
$inputBoxHeight: 30px;
$loginButtonWidth: 208px;
$loginButtonHeight: 36px;

.container {
  text-align: center; // 各要素を中央揃えにする

  .nameWrapper {
    padding: 10px;

    .name {
      width: $inputBoxWidth;
      height: $inputBoxHeight;
    }
  }

  .passwordWrapper {
    padding: 10px;

    .password {
      width: $inputBoxWidth;
      height: $inputBoxHeight;
    }
  }

  .loginButtonWrapper {
    padding: 10px;

    .loginButton {
      width: $loginButtonWidth;
      height: $loginButtonHeight;
      background-color: #ff9900;
    }

    .loginButton:hover {
      cursor: pointer;
      filter: brightness(120%);
    }
  }
}
```

## ページ上部に固定されるヘッダ

```tsx
import style from "./header.module.scss";

/**
 * 常にページ上部に固定されるヘッダを提供するコンポーネントです。
 *
 * @returns ヘッダコンポーネント
 */
export const Header = () => {
  return <div className={style.container}>Easy Web</div>;
};
```

```scss
.container {
  background-color: #420b62;
  color: #dddddd;
  height: 70px;
  position: fixed; // コンポーネントの位置を固定する
  width: 100%; // ヘッダーの横幅を指定する

  // メインのコンテンツがヘッダ下に隠れるため、別途調整が必要であることに注意
}
```
