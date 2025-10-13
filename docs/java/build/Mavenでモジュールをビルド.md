# Maven でモジュールをビルド

maven を使って作成したプロジェクトをビルドし、実行可能な jar ファイルを作成します。

## 手順

- `pom.xml`に下記を追記します:

```xml
    <build>
        <plugins>
            <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-jar-plugin</artifactId>
            <version>3.3.0</version> <!-- バージョンは都度調整 -->
            <configuration>
                <archive>
                    <manifest>
                        <mainClass>nob.example.Main</mainClass> <!-- mainメソッドを指定-->
                    </manifest>
                </archive>
            </configuration>
            </plugin>
        </plugins>
    </build>
```

- jar ファイルを作成します:

```shell
mvn clean install
```

ビルド後、`java -jar {jarファイルのパス}`でアプリケーションを実行できます。
