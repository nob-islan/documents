# KeycloakのUser Attributeを追加する

ユーザに紐づく情報の属性を追加する設定と、業務アプリ側からそれを取得するサンプルです。

## Keycloak設定

- Realm settings -> User profileからattributeを作成します。
- Clients -> {対象のClient} -> Client scopes -> {対象のClient}-dedicatedからmapperを追加します。

## 業務アプリ実装

下記サンプルでは`birth_date`を取得し、それを元に年齢を計算しています:

```java
package nob.example.easyapp.controller;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import nob.example.easyapp.controller.model.MeResponse;

/**
 * ユーザ情報APIのインターフェースです。
 *
 * @author nob
 */
@RestController
@RequestMapping(value = "/api/v1")
public class UserController {

    /**
     * ユーザ情報取得APIです。
     *
     * @return ユーザ情報
     */
    @GetMapping("/me")
    MeResponse me(@AuthenticationPrincipal OAuth2User user) {

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");
        try {
            // 誕生日から年齢を計算
            return new MeResponse(user.getAttribute("preferred_username"), Period.between(
                    sdf.parse(user.getAttribute("birth_date")).toInstant().atZone(ZoneId.systemDefault()).toLocalDate(),
                    LocalDate.now()).getYears());

        } catch (Exception e) {
            return new MeResponse(user.getAttribute("preferred_username"), 0);
        }
    }
}
```
