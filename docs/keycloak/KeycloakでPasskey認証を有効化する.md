# KeycloakでPasskey認証を有効化する

cf. https://www.keycloak.org/docs/latest/server_admin/#_webauthn_passwordless

## 設定

### Passkey認証の有効化

- Authenticationからflowを作成します（ビルトインのbrowserフローを複製すると簡単です）。
  - `WebAuthn Passwordless Authenticator`を追加します。
  - 例えば下記の構成のフローを作成します:

    ```
    execution: Cookie
    execution: Identity Provider Redirector
    execution: WebAuthn Passwordless Authenticator
    flow: Password login
        step: Username Password Form
    ```

- Action内のBind flowを選択してフローを有効化します。

### Passkey登録の必須化

- Authentication -> Required actionsからWebauthn Register PasswordlessのSet as default actionをOnにすることで、ユーザ作成時にパスキー作成を強制できます。
