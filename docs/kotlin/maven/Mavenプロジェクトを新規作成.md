# Mavenプロジェクトを新規作成

cf. https://jarcasting.com/archetypes/org.jetbrains.kotlin/kotlin-archetype-jvm/

## プロジェクト作成

- プロジェクトを初期化します:

```shell
mvn archetype:generate \
    -DarchetypeGroupId=org.jetbrains.kotlin \
    -DarchetypeArtifactId=kotlin-archetype-jvm \
    -DarchetypeVersion=2.2.0 \
    -DinteractiveMode=false \
    -DgroupId=nob.example \
    -DartifactId=easyapp
```

- `pom.xml`に下記を追加して、Java21でコンパイルするようにします:

```xml
    <properties>
        <java.version>21</java.version>
        <maven.compiler.target>${java.version}</maven.compiler.target>
        <maven.compiler.source>${java.version}</maven.compiler.source>
        <kotlin.compiler.jvmTarget>${java.version}</kotlin.compiler.jvmTarget>
    </properties>
```

- 作業ディレクトリのルート直下でないとVSCodeがうまくプロジェクトを認識しないためファイルを移動します:

```shell
mv easyapp/* .
rm -r easyapp/
```

## 追加設定

`pom.xml`に下記警告が出ているため、追加設定を入れて警告を消します:

> Plugin execution not covered by lifecycle configuration: org.jetbrains.kotlin:kotlin-maven-plugin:2.2.0:compile (execution: compile, phase: compile)

> Plugin execution not covered by lifecycle configuration: org.jetbrains.kotlin:kotlin-maven-plugin:2.2.0:test-compile (execution: test-compile, phase: test-compile)

```xml
                <executions>
                    <execution>
                        <?m2e execute onConfiguration?>
                        <id>compile</id>
                        <phase>compile</phase>
                        <goals>
                            <goal>compile</goal>
                        </goals>
                    </execution>
                    <execution>
                        <?m2e execute onConfiguration?>
                        <id>test-compile</id>
                        <phase>test-compile</phase>
                        <goals>
                            <goal>test-compile</goal>
                        </goals>
                    </execution>
                </executions>
```

## アプリ実行

```shell
mvn compile
mvn exec:java -Dexec.mainClass="nob.example.HelloKt"
```
