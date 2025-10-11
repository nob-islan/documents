# React コンポーネントのルーティング方法

`App.tsx`で各種コンポーネントへのルーティングを定義する実装のサンプルコードです。

## 前提

Component01, Component02 を用意し、それらへのパスをそれぞれ`/first`, `/second`と定義します。

## 実装

```tsx
import style from "./app.module.scss";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import Component01 from "./features/component01/Component01";
import Component02 from "./features/component02/Component02";

function App() {
  return (
    <BrowserRouter>
      <div className={style.body}>
        {/* 各種ページへのリンク */}
        <Link to="/first">First</Link>
        <br />
        <Link to="/second">Second</Link>
        <br />
        <br />
        {/* 各種ページのルーティング */}
        <Routes>
          <Route path="/first" element={<Component01 />} />
          <Route path="/second" element={<Component02 />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
```
