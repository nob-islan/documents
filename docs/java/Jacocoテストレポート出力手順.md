# Jacoco テストレポート出力手順

参考：https://tosi-tech.net/2020/06/coverage-report-of-jacoco/  
Maven および Gradle プロジェクトについて記載。

## Maven

### 手順

`pom.xml`の`<plugins>`内に以下を追記します：

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.5</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

また、`<project>`の中に以下を追加します：

```xml
<reporting>
<plugins>
    <plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <reportSets>
        <reportSet>
        <reports>
            <report>report</report>
        </reports>
        </reportSet>
    </reportSets>
    </plugin>
</plugins>
</reporting>
```

追記後、`./mvnw test jacoco:report`コマンドを叩きます。うまくいけば`target/site/jacoco`内に html 形式でレポートが作成されます。

## Gradle

`build.gradle`ファイルの`plugins`ブロック内に

```
id 'jacoco'
```

を追記する。追記後`./gradlew test jacocoTestReport`コマンドを叩きます。うまくいけば`build/reports/jacoco/test/html`内にレポートが作成されます。
