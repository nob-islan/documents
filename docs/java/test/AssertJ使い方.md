# AssertJ使い方

[AssertJ](https://assertj.github.io/doc/)によるテストサンプルです。

## 実装

事前準備となる実装です。

### `domain/entity/Users.java`

```java
package nob.example.easyapp.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * usersテーブルのエンティティクラスです。
 *
 * @author nob
 */
@Table(name = "users")
@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Users {

    /** 管理ID */
    @Id
    @Column(name = "id", nullable = false)
    private Integer id;

    /** ユーザ名 */
    @Column(name = "name", length = 8, nullable = false)
    private String name;

    /** 年齢 */
    @Column(name = "age", nullable = false)
    private Integer age;
}
```

### `dto/UsersDto.java`

```java
package nob.example.easyapp.dto;

/**
 * ユーザ情報のdtoです。
 *
 * @param id   管理ID
 * @param name ユーザ名
 * @param age  年齢
 *
 * @author nob
 */
public record UsersDto(Integer id, String name, Integer age) {
}
```

### `repository/UsersRepository.java`

```java
package nob.example.easyapp.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import nob.example.easyapp.domain.entity.Users;

/**
 * usersテーブルのrepositoryインターフェースです。
 *
 * @author nob
 */
@Repository
public interface UsersRepository extends JpaRepository<Users, Integer> {

    /**
     * ユーザ名で曖昧検索します。
     *
     * @param name 検索キーのユーザ名
     * @return ユーザ情報のリスト
     */
    List<Users> findByNameLike(String name);
}
```

### `service/UsersService.java`

```java
package nob.example.easyapp.service;

import nob.example.easyapp.service.model.FetchUsersInModel;
import nob.example.easyapp.service.model.FetchUsersOutModel;

/**
 * ユーザ情報のサービスインターフェースです。
 *
 * @author nob
 */
public interface UsersService {

    /**
     * ユーザ名による曖昧検索でユーザ情報を取得します。
     *
     * @param inModel 検索条件
     * @return ユーザ情報のリスト
     * @throws IllegalArgumentException
     */
    FetchUsersOutModel fetchUsers(FetchUsersInModel inModel) throws IllegalArgumentException;
}
```

### `service/impl/UsersServiceImpl.java`

```java
package nob.example.easyapp.service.impl;

import org.springframework.stereotype.Service;

import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import nob.example.easyapp.dto.UsersDto;
import nob.example.easyapp.repository.UsersRepository;
import nob.example.easyapp.service.UsersService;
import nob.example.easyapp.service.model.FetchUsersInModel;
import nob.example.easyapp.service.model.FetchUsersOutModel;

/**
 * {@link UsersService}の実装です。
 *
 */
@Service
@RequiredArgsConstructor
public class UsersServiceImpl implements UsersService {

    @NonNull
    private UsersRepository usersRepository;

    @Override
    public FetchUsersOutModel fetchUsers(FetchUsersInModel inModel) throws IllegalArgumentException {

        if (inModel.name() == null) {
            throw new IllegalArgumentException("リクエスト内容が不正です。");
        }

        return new FetchUsersOutModel(usersRepository.findByNameLike(inModel.name()).stream()
                .map(u -> new UsersDto(u.getId(), u.getName(), u.getAge())).toList());
    }
}
```

### `service/model/FetchUsersInModel.java`

```java
package nob.example.easyapp.service.model;

/**
 * ユーザ情報検索ロジックの入力モデルです。
 *
 * @param name 検索条件のユーザ名
 *
 * @author nob
 */
public record FetchUsersInModel(String name) {
}
```

### `service/model/FetchUsersOutModel.java`

```java
package nob.example.easyapp.service.model;

import java.util.List;

import nob.example.easyapp.dto.UsersDto;

/**
 * ユーザ情報取得ロジックの出力モデルです。
 *
 * @param usersDtoList ユーザ情報のリスト
 *
 * @author nob
 */
public record FetchUsersOutModel(List<UsersDto> usersDtoList) {
}
```

## テスト作成

### `service/impl/UsersServiceImplTest.java`

```java
package nob.example.easyapp.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import nob.example.easyapp.domain.entity.Users;
import nob.example.easyapp.dto.UsersDto;
import nob.example.easyapp.repository.UsersRepository;
import nob.example.easyapp.service.model.FetchUsersInModel;

/**
 * {@link UsersServiceImpl}のテストクラスです。
 *
 * @author nob
 */
@ExtendWith(MockitoExtension.class)
public class UsersServiceImplTest {

    @InjectMocks
    private UsersServiceImpl usersService;

    @Mock
    private UsersRepository usersRepository;

    /**
     * 正常系
     */
    @Test
    void test_fetchUsers_success() {

        Mockito.when(usersRepository.findByNameLike("nob"))
                .thenReturn(List.of(new Users(1, "nob1", 13), new Users(2, "nob2", 14), new Users(3, "nob3", 15)));

        // 戻りのリストのサイズおよび中身を検証
        assertThat(usersService.fetchUsers(new FetchUsersInModel("nob")).usersDtoList())
                .hasSize(3)
                .containsExactly(
                        new UsersDto(1, "nob1", 13),
                        new UsersDto(2, "nob2", 14),
                        new UsersDto(3, "nob3", 15));
    }

    /**
     * inModelの中身が不正
     */
    @Test
    void test_fetchUsers_invalidModel() {

        // 例外発生時のインスタンス種別およびエラーメッセージを検証
        assertThatThrownBy(() -> usersService.fetchUsers(new FetchUsersInModel(null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("リクエスト内容が不正です。");
    }
}
```
