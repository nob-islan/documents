# Java Operator SDK プロジェクトのテンプレートを作成

[Java Operator SDK](https://javaoperatorsdk.io/)を利用した Kubernetes のカスタムコントローラー開発プロジェクトのテンプレートを作成し、プロジェクトを初期化します。シェルスクリプトによるツールを提供します。

## ツール本体

<details><summary>init.sh</summary>

```shell
#!/bin/bash

#=======================================================================
# Java Operator SDKで実装するカスタムコントローラープロジェクトの雛形を作成します。
# usage: bash init.sh {group.id} {CustomResourceKind}
#=======================================================================

# 入力パラメータ
group_id=$1
kind=$2

# 入力値チェック
if [ -z ${group_id} ]; then
    echo "Input group ID"
    exit 1
fi
if [ -z ${kind} ]; then
    echo "Input custom resource kind"
    exit 1
fi

controller_name=`echo ${kind} | tr [A-Z] [a-z]`controller

# 変数
group_id_slash_divided=`echo ${group_id} | sed 's#\.#/#g'`

# ディレクトリ作成
k8s_resource_dir=${controller_name}/k8s
java_class_dir=${controller_name}/src/main/java/${group_id_slash_divided}
java_resources_dir=${controller_name}/src/main/resources
java_test_dir=${controller_name}/src/test/java/${group_id_slash_divided}
mkdir -p ${k8s_resource_dir}
mkdir -p ${java_class_dir}
mkdir -p ${java_resources_dir}
mkdir -p ${java_test_dir}

# custom_resource.yaml作成
cat << EOF > ${k8s_resource_dir}/custom_resource.yaml
apiVersion: ${group_id}/v1
kind: ${kind}CustomResource
metadata:
  name: `echo ${kind} | tr [A-Z] [a-z]`-sample
spec:
  # TODO: add your custom resource spec
EOF

# pom.xml作成
cat << EOF > ${controller_name}/pom.xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>${group_id}</groupId>
    <artifactId>${controller_name}</artifactId>
    <version>0.1.0-SNAPSHOT</version>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <josdk.version>5.1.2</josdk.version>
        <fabric8-client.version>7.3.1</fabric8-client.version>
        <lombok.version>1.18.40</lombok.version>
        <logback.version>1.5.18</logback.version>
        <junit.version>5.13.4</junit.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.javaoperatorsdk</groupId>
                <artifactId>operator-framework-bom</artifactId>
                <version>\${josdk.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <!-- https://mvnrepository.com/artifact/io.javaoperatorsdk/operator-framework -->
        <dependency>
            <groupId>io.javaoperatorsdk</groupId>
            <artifactId>operator-framework</artifactId>
            <version>\${josdk.version}</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/io.javaoperatorsdk/operator-framework-junit-5 -->
        <dependency>
            <groupId>io.javaoperatorsdk</groupId>
            <artifactId>operator-framework-junit-5</artifactId>
            <version>\${josdk.version}</version>
            <scope>test</scope>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>\${lombok.version}</version>
        </dependency>
        <!-- https://mvnrepository.com/artifact/ch.qos.logback/logback-classic -->
        <dependency>
            <groupId>ch.qos.logback</groupId>
            <artifactId>logback-classic</artifactId>
            <version>\${logback.version}</version>
            <scope>compile</scope>
        </dependency>
        <!-- https://mvnrepository.com/artifact/org.junit.jupiter/junit-jupiter-api -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>\${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
            </plugin>
            <plugin>
                <groupId>io.fabric8</groupId>
                <artifactId>crd-generator-maven-plugin</artifactId>
                <version>\${fabric8-client.version}</version>
                <executions>
                    <execution>
                        <?m2e execute onConfiguration,onIncremental?>
                        <goals>
                            <goal>generate</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-shade-plugin</artifactId>
                <version>3.4.1</version>
                <executions>
                    <execution>
                    <phase>package</phase>
                    <goals>
                        <goal>shade</goal>
                    </goals>
                    <configuration>
                        <createDependencyReducedPom>false</createDependencyReducedPom>
                        <transformers>
                        <transformer implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
                            <mainClass>${group_id}.Main</mainClass>
                        </transformer>
                        </transformers>
                    </configuration>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
EOF

# Main.java作成
cat << EOF > ${java_class_dir}/Main.java
package ${group_id};

import io.javaoperatorsdk.operator.Operator;

public class Main {
    public static void main(String[] args) {

        Operator operator = new Operator();
        operator.register(new ${kind}Reconciler());
        operator.start();
    }
}
EOF

# Spec.java作成
cat << EOF > ${java_class_dir}/${kind}Spec.java
package ${group_id};

import lombok.Data;

@Data
public class ${kind}Spec {

    private String value;

    // TODO: add your custom resource spec
}
EOF

# Status.java作成
cat << EOF > ${java_class_dir}/${kind}Status.java
package ${group_id};

import lombok.Data;

@Data
public class ${kind}Status {

    // TODO: add your custom resource status
}
EOF

# CustomResource作成
cat << EOF > ${java_class_dir}/${kind}CustomResource.java
package ${group_id};

import io.fabric8.kubernetes.client.CustomResource;
import io.fabric8.kubernetes.api.model.Namespaced;
import io.fabric8.kubernetes.model.annotation.Group;
import io.fabric8.kubernetes.model.annotation.Version;

@Group("${group_id}")
@Version("v1")
public class ${kind}CustomResource extends CustomResource<${kind}Spec, ${kind}Status> implements Namespaced {
}
EOF

# Reconciler作成
cat << EOF > ${java_class_dir}/${kind}Reconciler.java
package ${group_id};

import io.javaoperatorsdk.operator.api.reconciler.Context;
import io.javaoperatorsdk.operator.api.reconciler.Reconciler;
import io.javaoperatorsdk.operator.api.reconciler.UpdateControl;
import io.javaoperatorsdk.operator.api.reconciler.Workflow;

@Workflow(dependents = { /* TODO: add your dependent resources */ })
public class ${kind}Reconciler implements Reconciler<${kind}CustomResource> {

    @Override
    public UpdateControl<${kind}CustomResource> reconcile(${kind}CustomResource resource, Context<${kind}CustomResource> context) throws Exception {

        // TODO: add your business logic

        return UpdateControl.noUpdate();
    }
}
EOF

# ReconcilerTest作成
cat << EOF > ${java_test_dir}/${kind}ReconcilerTest.java
package ${group_id};

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import io.fabric8.kubernetes.api.model.ObjectMetaBuilder;
import io.javaoperatorsdk.operator.junit.LocallyRunOperatorExtension;

public class ${kind}ReconcilerTest {

    @RegisterExtension
    LocallyRunOperatorExtension extension = LocallyRunOperatorExtension.builder()
            .withReconciler(${kind}Reconciler.class)
            .build();

    @Test
    void test() {

        ${kind}CustomResource cr = extension.create(testResource());

        // TODO: add your test logic

        extension.delete(cr);
    }

    ${kind}CustomResource testResource() {
        ${kind}CustomResource resource = new ${kind}CustomResource();
        resource.setMetadata(new ObjectMetaBuilder()
                .withName("test-resource")
                .build());
        resource.setSpec(new ${kind}Spec());
        resource.getSpec().setValue("test");
        // TODO: add your custom resource spec

        return resource;
    }
}
EOF

# .gitignore作成
cat << EOF > ${controller_name}/.gitignore
#Maven
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup
release.properties
.flattened-pom.xml

# Eclipse
.project
.classpath
.settings/
bin/

# IntelliJ
.idea
*.ipr
*.iml
*.iws

# NetBeans
nb-configuration.xml

# Visual Studio Code
.vscode
.factorypath

# OSX
.DS_Store

# Vim
*.swp
*.swo

# patch
*.orig
*.rej

# Local environment
.env
EOF

# Makefile作成
cat << EOF > ${controller_name}/Makefile
# Test the controller application using junit test class
.PHONY: test
test:
	mvn clean test

# Create the jar file of the controller application, and apply the crd manifest file
# The crd manifest file will be found in target/classes/META-INF/fabric8
.PHONY: package
package:
	mvn clean package
	kubectl apply -f target/classes/META-INF/fabric8/\$(ls -1 target/classes/META-INF/fabric8)

# Run the built jar file
.PHONY: run
run:
	java -jar target/${controller_name}-0.1.0-SNAPSHOT.jar
EOF

# logback.xmlのサンプル作成
cat << EOF > ${java_resources_dir}/logback.xml.sample
<configuration>
    <root level="INFO">
        <appender-ref ref="STDOUT" />
    </root>
    <appender name="STDOUT" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n</pattern>
        </encoder>
    </appender>
</configuration>
EOF
```

</details>

## 作成ファイル一覧

上記ツールによって下記ファイルが作成されます。

### `custom_resource.yaml`

カスタムリソースのマニフェストです。spec については、後述の`Spec.java`と併せて実装者が定義して追記する必要があります。

### `pom.xml`

Java プロジェクトの必要な依存関係を記述しています。各種ライブラリのバージョンが古い場合などは適宜更新をしてください。

### `Main.java`

main メソッドを持つクラスです。基本的に編集は不要です。

### `Spec.java`

カスタムリソースの spec を定義するクラスです。必要な値を宣言してください。

### `Status.java`

カスタムリソースの status を定義するクラスです。必要な値を宣言してください。

### `CustomResource.java`

カスタムリソース本体を宣言するクラスです。基本的に編集は不要です。

### `Reconciler.java`

main から呼び出されて reconcile 処理を行うクラスです。コントローラーの業務処理を記述してください。

### `ReconcilerTest.java`

`Reconciler.java`のテストクラスです。業務処理に併せてテストを記述してください。

### `.gitignore`

Git 管理対象外とするディレクトリを記述しています。基本的に編集は不要です。

### `Makefile`

`make`コマンドで実行する開発支援向けのスクリプトを定義しています:

- `test` 単体テストを実行します。
- `package` jar ファイルを作成し、自動生成される CRD マニフェストを apply します。
- `run` 作成した jar ファイルを実行します。

### `logback.xml`のサンプル

ログ出力向けの設定を行う`logback.xml`のサンプルを出力します。ファイル名から`.sample`を外すとログレベルが INFO に上がります（デフォルトは DEBUG）。
