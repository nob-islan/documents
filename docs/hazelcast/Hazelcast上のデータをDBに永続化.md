# Hazelcast上のデータをDBに永続化

Hazelcast上にキャッシュされたデータをDB上に永続化するための設定です。

cf.

- https://docs.hazelcast.com/hazelcast/5.6/mapstore/configuring-a-generic-mapstore
- https://docs.hazelcast.com/hazelcast/5.6/mapstore/configuration-guide
- http://docs.hazelcast.com/hazelcast/5.6/serialization/compact-serialization

## 事前準備

下記SQLによって構築されるデータベースに向けてデータを永続化することを想定します:

```SQL
-- hazelcast向けMapping作成SQL
CREATE MAPPING person (
    __key INT
    , name VARCHAR
    , password VARCHAR
    , age INT
)
TYPE IMap
OPTIONS (
    'keyFormat'='int'
    , 'valueFormat' = 'compact'
    , 'valueCompactTypeName' = 'person'
);
```

```sql
-- MySQL向けテーブル作成SQL
CREATE DATABASE eadb;
USE eadb;

CREATE TABLE IF NOT EXISTS person (
    id bigint PRIMARY KEY
    , name varchar(8)
    , password varchar(32)
    , age int
);
```

## 設定

### `hazelcast-docker.xml`

設定ファイルに下記を追記します:

```xml
<hazelcast>
    <data-connection name="my-mysql-database">
        <type>JDBC</type>
        <properties>
            <property name="jdbcUrl">jdbc:mysql://localhost:3306/eadb</property>
            <property name="user">root</property>
            <property name="password">password</property>
        </properties>
        <shared>true</shared>
    </data-connection>

    <map name="person">
        <map-store enabled="true">
            <class-name>com.hazelcast.mapstore.GenericMapStore</class-name>
            <properties>
                <property name="data-connection-ref">my-mysql-database</property>
            </properties>
            <write-delay-seconds>5</write-delay-seconds>
            <write-batch-size>100</write-batch-size>
        </map-store>
    </map>
</hazelcast>
```

### Goアプリケーションでデータ投入

事前にライブラリをインストールしておいてください:

```shell
go get github.com/hazelcast/hazelcast-go-client
```

#### Mappingに対応する構造体宣言

```go
// ユーザ情報の構造体です。
type Person struct {
	Name     string // 名前
	Password string // パスワード
	Age      int32  // 年齢
}
```

#### Serializerの実装

```go
type PersonSerializer struct{}

func (p PersonSerializer) Type() reflect.Type {
	return reflect.TypeFor[*Person]()
}

func (p PersonSerializer) TypeName() string {
	return "person"
}

func (s PersonSerializer) Write(writer serialization.CompactWriter, value any) {

	person := value.(*Person)
	writer.WriteString("name", &person.Name)
	writer.WriteString("password", &person.Password)
	writer.WriteInt32("age", person.Age)
}

func (p PersonSerializer) Read(reader serialization.CompactReader) any {
	return Person{
		Name:     *reader.ReadString("name"),
		Password: *reader.ReadString("password"),
		Age:      reader.ReadInt32("age"),
	}
}
```

#### Hazelcastクライアント作成

```go
// hazelcastのクライアントを返します。
func HazelcastClient(ctx context.Context) *hazelcast.Client {

	cfg := hazelcast.Config{}
	cfg.Cluster.Name = "nob-hazelcast"

    // シリアライザ登録
	cfg.Serialization.Compact.SetSerializers(PersonSerializer{})

	hz, err := hazelcast.StartNewClientWithConfig(ctx, cfg)
	if err != nil {
		panic(fmt.Errorf("starting the client with config: %w", err))
	}

	return hz
}
```

#### 保存処理の実装

```go
// ユーザ情報を保存します。
func Save(key int32, value *Person) {

	ctx := context.TODO()

	hz := HazelcastClient(ctx)

	mp, err := hz.GetMap(ctx, "person")
	if err != nil {
		panic(fmt.Errorf("trying to get a map: %w", err))
	}

	err = mp.Set(ctx, key, value)
	if err != nil {
		panic(err)
	}
}
```

#### 取得処理の実装

```go
// 指定したキーのユーザ情報を取得します。
func Get(key int32) Person {

	ctx := context.TODO()

	hz := HazelcastClient(ctx)

	mp, err := hz.GetMap(ctx, "person")
	if err != nil {
		panic(fmt.Errorf("trying to get a map: %w", err))
	}

	val, err := mp.Get(ctx, key)
	if err != nil {
		panic(err)
	}

	return val.(Person)
}
```

### SQLでデータ投入

下記SQLでHazelcastのMapping上にデータが投入され、非同期でMySQLに永続化されます:

```sql
-- hazelcast向けサンプルデータ投入SQL
INSERT INTO person (
    __key, name, password, age
) values (
    1, 'nob', 'passwd', 13
);
```
