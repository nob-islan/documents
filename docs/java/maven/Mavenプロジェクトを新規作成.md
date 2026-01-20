# Mavenプロジェクトを新規作成

cf. https://maven.apache.org/guides/getting-started/maven-in-five-minutes.html

下記コマンドでmavenプロジェクトを新規作成できます。`groupId`および`artifactId`について適宜変更してください。

```shell
mvn archetype:generate \
    -DarchetypeArtifactId=maven-archetype-quickstart \
    -DjavaCompilerVersion=21 \
    -DarchetypeVersion=1.5 \
    -DinteractiveMode=false \
    -DgroupId=nob.example \
    -DartifactId=easyapp
```
