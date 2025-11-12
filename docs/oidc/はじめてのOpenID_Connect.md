# はじめての OpenID Connect

認証・認可プロトコルの [OpenID Connect](https://openid.net/specs/openid-connect-core-1_0.html) についてその業務処理を解説します。

## 登場人物

- End user: 業務アプリケーションの利用者
- Relying party (RP): 業務アプリケーションを提供するシステム
- OpenID provider (OP): 認証を担うシステム

## シーケンス図

```mermaid
%%{init:{'theme':'dark'}}%%

sequenceDiagram

    actor end_user as End user
    participant rp as RP
    participant op as OP

    autonumber
    end_user ->> rp: 業務 API 呼び出し
    rp ->+ end_user: 認可エンドポイントへリダイレクト
    end_user ->>-op: 認証リクエスト
        Note right of op: 認可エンドポイント
    op -->> end_user: ログイン画面
    end_user ->> op: ユーザ認証
    op -->+ end_user: 認証レスポンス
    end_user ->>- rp: リダイレクト URI へリダイレクト
    rp ->> op: トークンリクエスト
        Note right of op: トークンエンドポイント
    op -->> rp: トークンレスポンス
    rp ->> rp: ID トークン検証
    rp -->> end_user: ログインセッション
```

## 処理解説

WIP
