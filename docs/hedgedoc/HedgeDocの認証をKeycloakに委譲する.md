# HedgeDocの認証をKeycloakに委譲する

KeycloakによるHedgeDocへのログインを実装します。

## HedgeDocを構築

ローカル環境におけるKeycloakとの疎通を考慮し、Dockerではなくパッケージによるマニュアルインストールを行います:

cf. https://docs.hedgedoc.org/setup/manual-setup/

## Keycloakと連携

cf. https://docs.hedgedoc.org/guides/auth/keycloak/

- 各種環境変数をexportします:

```shell
export CMD_OAUTH2_USER_PROFILE_URL=http://localhost:8080/realms/<your-realm>/protocol/openid-connect/userinfo
export CMD_OAUTH2_USER_PROFILE_USERNAME_ATTR=preferred_username
export CMD_OAUTH2_USER_PROFILE_DISPLAY_NAME_ATTR=name
export CMD_OAUTH2_USER_PROFILE_EMAIL_ATTR=email
export CMD_OAUTH2_TOKEN_URL=http://localhost:8080/realms/<your-realm>/protocol/openid-connect/token
export CMD_OAUTH2_AUTHORIZATION_URL=http://localhost:8080/realms/<your-realm>/protocol/openid-connect/auth
export CMD_OAUTH2_CLIENT_ID=<your-client-id>
export CMD_OAUTH2_CLIENT_SECRET=<your-client-secret>
export CMD_OAUTH2_PROVIDERNAME=Keycloak
export CMD_OAUTH2_SCOPE=openid email profile
export CMD_DOMAIN=localhost
export CMD_PORT=3000
export CMD_PROTOCOL_USESSL=false
export CMD_URL_ADDPORT=true
```

- HedgeDocを起動します:

```shell
NODE_ENV=production yarn start
```
