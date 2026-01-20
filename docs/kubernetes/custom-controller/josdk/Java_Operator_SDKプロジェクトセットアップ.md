# Java Operator SDKプロジェクトセットアップ

[Java Operator SDK](https://javaoperatorsdk.io/) で実装するカスタムコントローラーのプロジェクトのセットアップ方法について記載します。

## クラスタ作成

- kind/cluster/josdk-cluster.yamlを下記内容で作成します。

```yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
```

- KindでKubernetesクラスタを構築します。

```shell
kind create cluster --name josdk-cluster --config kind/cluster/josdk-cluster.yaml
```

## プロジェクト作成

- プロジェクトを初期化します。

```shell
mvn archetype:generate \
    -DarchetypeArtifactId=maven-archetype-quickstart \
    -DjavaCompilerVersion=21 \
    -DarchetypeVersion=1.5 \
    -DinteractiveMode=false \
    -DgroupId=nob.example \
    -DartifactId=nob-controller
```

- pom.xmlを下記で作成します。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>nob.example</groupId>
    <artifactId>nob-controller</artifactId>
    <version>1.0-SNAPSHOT</version>

    <name>nob-controller</name>
    <properties>
        <maven.compiler.release>21</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.source>${maven.compiler.release}</maven.compiler.source>
        <maven.compiler.target>${maven.compiler.release}</maven.compiler.target>
        <josdk.version>5.2.2</josdk.version>
        <slf4j.version>2.0.17</slf4j.version>
        <junit.version>5.9.2</junit.version>
        <log4j.version>2.25.3</log4j.version>
        <lombok.version>1.18.40</lombok.version>
        <fabric8-client.version>7.4.0</fabric8-client.version>
    </properties>

    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>io.javaoperatorsdk</groupId>
                <artifactId>operator-framework-bom</artifactId>
                <version>${josdk.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>

    <dependencies>
        <dependency>
            <groupId>io.javaoperatorsdk</groupId>
            <artifactId>operator-framework</artifactId>
            <version>${josdk.version}</version>
        </dependency>
        <dependency>
            <groupId>io.javaoperatorsdk</groupId>
            <artifactId>operator-framework-junit-5</artifactId>
            <version>${josdk.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>${slf4j.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-slf4j2-impl</artifactId>
            <version>${log4j.version}</version>
        </dependency>
        <dependency>
            <groupId>org.apache.logging.log4j</groupId>
            <artifactId>log4j-core</artifactId>
            <version>${log4j.version}</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <scope>test</scope>
            <version>${junit.version}</version>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <scope>test</scope>
            <version>${junit.version}</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>${lombok.version}</version>
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
                <version>${fabric8-client.version}</version>
                <executions>
                    <execution>
                        <?m2e execute onConfiguration?>
                        <goals>
                            <goal>generate</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
```

## 実装

### NobSpec.java

カスタムリソースのSpecを宣言します。

```java
package nob.example;

import lombok.Data;

@Data
public class NobSpec {

    private String deploymentName;

    private Integer replicas;
}
```

### NobStatus.java

カスタムリソースのStatusを宣言します。

```java
package nob.example;

import lombok.Data;

@Data
public class NobStatus {

    private Integer availableReplicas;
}
```

### Nob.java

カスタムリソースを宣言します。

```java
package nob.example;

import io.fabric8.kubernetes.client.CustomResource;
import io.fabric8.kubernetes.api.model.Namespaced;
import io.fabric8.kubernetes.model.annotation.Group;
import io.fabric8.kubernetes.model.annotation.Version;

@Group("nob.example")
@Version("v1")
public class Nob extends CustomResource<NobSpec, NobStatus> implements Namespaced {
}
```

### DeploymentDependentResource.java

カスタムリソースが管理するDeploymentの定義を宣言します。

```java
package nob.example;

import java.util.Map;

import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.LabelSelectorBuilder;
import io.fabric8.kubernetes.api.model.ObjectMetaBuilder;
import io.fabric8.kubernetes.api.model.OwnerReferenceBuilder;
import io.fabric8.kubernetes.api.model.PodSpecBuilder;
import io.fabric8.kubernetes.api.model.PodTemplateSpecBuilder;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentBuilder;
import io.fabric8.kubernetes.api.model.apps.DeploymentSpecBuilder;
import io.javaoperatorsdk.operator.api.reconciler.Context;
import io.javaoperatorsdk.operator.processing.dependent.kubernetes.CRUDKubernetesDependentResource;
import io.javaoperatorsdk.operator.processing.dependent.kubernetes.KubernetesDependent;

@KubernetesDependent
public class DeploymentDependentResource extends CRUDKubernetesDependentResource<Deployment, Nob> {

    @Override
    protected Deployment desired(Nob nob, Context<Nob> context) {
        return new DeploymentBuilder()
                .withMetadata(new ObjectMetaBuilder()
                        .withName(nob.getSpec().getDeploymentName())
                        .withNamespace(nob.getMetadata().getNamespace())
                        .withLabels(Map.of("app", "nob-nginx", "controller", nob.getMetadata().getName()))
                        .withOwnerReferences(new OwnerReferenceBuilder()
                                .withApiVersion(nob.getApiVersion())
                                .withKind(nob.getKind())
                                .withName(nob.getMetadata().getName())
                                .withUid(nob.getMetadata().getUid())
                                .withController()
                                .withBlockOwnerDeletion()
                                .build())
                        .build())
                .withSpec(new DeploymentSpecBuilder()
                        .withSelector(new LabelSelectorBuilder()
                                .withMatchLabels(
                                        Map.of("app", "nob-nginx", "controller", nob.getMetadata().getName()))
                                .build())
                        .withReplicas(nob.getSpec().getReplicas())
                        .withTemplate(new PodTemplateSpecBuilder()
                                .withMetadata(new ObjectMetaBuilder()
                                        .withLabels(Map.of("app", "nob-nginx", "controller",
                                                nob.getMetadata().getName()))
                                        .build())
                                .withSpec(new PodSpecBuilder()
                                        .withContainers(new ContainerBuilder()
                                                .withName("nob-nginx")
                                                .withImage("nginx:1.18")
                                                .build())
                                        .build())
                                .build())
                        .build())
                .build();
    }
}
```

### NobReconciler.java

カスタムコントローラーのビジネスロジック本体を実装します。

```java
package nob.example;

import java.util.Map;

import io.fabric8.kubernetes.api.model.Event;
import io.fabric8.kubernetes.api.model.EventBuilder;
import io.fabric8.kubernetes.api.model.EventSourceBuilder;
import io.fabric8.kubernetes.api.model.ObjectMetaBuilder;
import io.fabric8.kubernetes.api.model.ObjectReference;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.fabric8.kubernetes.api.model.apps.DeploymentList;
import io.javaoperatorsdk.operator.api.reconciler.Context;
import io.javaoperatorsdk.operator.api.reconciler.Reconciler;
import io.javaoperatorsdk.operator.api.reconciler.UpdateControl;
import io.javaoperatorsdk.operator.api.reconciler.Workflow;
import io.javaoperatorsdk.operator.api.reconciler.dependent.Dependent;

@Workflow(dependents = { @Dependent(type = DeploymentDependentResource.class) })
public class NobReconciler implements Reconciler<Nob> {

    @Override
    public UpdateControl<Nob> reconcile(Nob nob, Context<Nob> context) throws Exception {

        // 古いdeploymentを削除
        DeploymentList deploymentList = context.getClient().apps().deployments()
                .inNamespace(nob.getMetadata().getNamespace())
                .withLabels(Map.of("app", "nob-nginx", "controller", nob.getMetadata().getName())).list();
        for (Deployment d : deploymentList.getItems()) {
            if (!d.getMetadata().getName().equals(nob.getSpec().getDeploymentName())) {
                context.getClient().apps().deployments().inNamespace(d.getMetadata().getNamespace())
                        .withName(d.getMetadata().getName()).delete();
            }
        }

        // Status更新向けに作成したDeploymentを取得
        Deployment deployment = context.getClient().apps().deployments().inNamespace(nob.getMetadata().getNamespace())
                .withName(nob.getSpec().getDeploymentName()).get();
        if (deployment == null) {
            return UpdateControl.noUpdate();
        }

        // Statusがセットされていなければ作成
        if (nob.getStatus() == null) {
            NobStatus n = new NobStatus();
            n.setAvailableReplicas(0);
            nob.setStatus(n);
        }

        // ステータスが変わらなければ何もせず終了
        if (deployment.getStatus().getAvailableReplicas() == null) {
            return UpdateControl.noUpdate();
        }
        if (deployment.getStatus().getAvailableReplicas().equals(nob.getStatus().getAvailableReplicas())) {
            return UpdateControl.noUpdate();
        }

        // Status更新
        nob.getStatus().setAvailableReplicas(deployment.getStatus().getAvailableReplicas());

        ObjectReference involvedObject = new ObjectReference();
        involvedObject.setApiVersion(nob.getApiVersion());
        involvedObject.setKind(nob.getKind());
        involvedObject.setName(nob.getMetadata().getName());
        involvedObject.setNamespace(nob.getMetadata().getNamespace());
        involvedObject.setUid(nob.getMetadata().getUid());
        Event event = new EventBuilder()
                .withMetadata(new ObjectMetaBuilder()
                        .withGenerateName("nobcustomresource-")
                        .withNamespace(nob.getMetadata().getNamespace())
                        .build())
                .withType("Normal")
                .withReason("Updated")
                .withMessage("Update status.availableReplicas: " + nob.getStatus().getAvailableReplicas())
                .withInvolvedObject(involvedObject)
                .withCount(1)
                .withSource(new EventSourceBuilder()
                        .withComponent(nob.getMetadata().getName())
                        .build())
                .build();
        context.getClient().v1().events().inNamespace(nob.getMetadata().getNamespace()).resource(event).create();

        return UpdateControl.patchStatus(nob);
    }
}
```

### App.java

コントローラーのエントリポイントです。

```java
package nob.example;

import io.javaoperatorsdk.operator.Operator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class App {

    private static final Logger log = LoggerFactory.getLogger(App.class);

    public static void main(String[] args) {
        Operator operator = new Operator();
        operator.register(new NobReconciler());
        operator.start();
        log.info("Operator started.");
    }
}
```

### log4j2.xml

ログ出力に関する設定main/resources/log4j2.xmlを下記内容で作成します。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Configuration name="Config" status="WARN">
    <Appenders>
        <Console name="Console" target="SYSTEM_OUT">
            <PatternLayout pattern="%d %threadId %-30c{1.} [%-5level] %msg%n%throwable"/>
        </Console>
    </Appenders>
    <Loggers>
        <Logger level="debug" name="nob.example" additivity="false">
            <AppenderRef ref="Console"/>
        </Logger>
        <Root level="info">
            <AppenderRef ref="Console"/>
        </Root>
    </Loggers>
</Configuration>
```

## 単体テスト

### NobReconcilerTest.java

コントローラーのテストを記載します。`mvn clean test`でCRDのマニフェストを自動生成しつつテストを実行します。

```java
package nob.example;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;

import io.fabric8.kubernetes.api.model.ObjectMetaBuilder;
import io.fabric8.kubernetes.api.model.apps.Deployment;
import io.javaoperatorsdk.operator.junit.LocallyRunOperatorExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;

public class NobReconcilerTest {

    @RegisterExtension
    LocallyRunOperatorExtension extension = LocallyRunOperatorExtension.builder()
            .withReconciler(NobReconciler.class)
            .build();

    private static final String DEPLOYMENT_NAME = "test-nginx";
    private static final String UPDATED_DEPLOYMENT_NAME = "updated-test-nginx";

    @Test
    void test() {

        Nob cr = extension.create(testResource());

        await().untilAsserted(() -> {
            Deployment d = extension.get(Deployment.class, DEPLOYMENT_NAME);
            assertThat(d).isNotNull();
            assertThat(d.getSpec().getReplicas()).isEqualTo(cr.getSpec().getReplicas());
        });

        cr.getSpec().setDeploymentName(UPDATED_DEPLOYMENT_NAME);
        cr.getSpec().setReplicas(5);
        extension.replace(cr);

        await().untilAsserted(() -> {
            Deployment d = extension.get(Deployment.class, UPDATED_DEPLOYMENT_NAME);
            assertThat(d).isNotNull();
            assertThat(d.getMetadata().getName()).isEqualTo(cr.getSpec().getDeploymentName());
            assertThat(d.getSpec().getReplicas()).isEqualTo(cr.getSpec().getReplicas());
        });

        extension.delete(cr);

        await().untilAsserted(() -> {
            Deployment d = extension.get(Deployment.class, UPDATED_DEPLOYMENT_NAME);
            assertThat(d).isNull();
        });
    }

    Nob testResource() {
        Nob nob = new Nob();
        nob.setMetadata(new ObjectMetaBuilder()
                .withName("test-resource")
                .build());
        nob.setSpec(new NobSpec());
        nob.getSpec().setDeploymentName(DEPLOYMENT_NAME);
        nob.getSpec().setReplicas(3);
        return nob;
    }
}
```

## ローカルアプリケーション起動

- アプリのビルドおよびCRDマニフェストの作成を行います。

```shell
mvn clean install
```

- CRDのマニフェストをapplyします。

```shell
kubectl apply -f target/classes/META-INF/fabric8/nobs.nob.example-v1.yml
```

- カスタムリソースのマニフェスト`src/k8s/custom-resource.yml`を下記で作成してapplyします。

```yaml
apiVersion: nob.example/v1
kind: Nob
metadata:
  name: nob-sample
spec:
  deploymentName: nob-nginx
  replicas: 3
```

```shell
kubectl apply -f src/k8s/custom-resource.yml
```

- 下記コマンドでカスタムリソースが動いていることを確認できます。

```
$ kubectl get Nob
NAME         AGE
nob-sample   17s
```

- Javaプロセスとしてコントローラーを起動します。

```shell
mvn exec:java -Dexec.mainClass="nob.example.App"
```

- コントローラーが正常に動作していれば、nginxのPodが作成されます。

```
$ kubectl get pod
NAME                         READY   STATUS    RESTARTS   AGE
nob-nginx-57466cd967-2j56f   1/1     Running   0          6s
nob-nginx-57466cd967-rz2rv   1/1     Running   0          6s
nob-nginx-57466cd967-vhssd   1/1     Running   0          6s
```
