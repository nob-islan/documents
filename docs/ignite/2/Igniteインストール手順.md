# Igniteインストール手順

## 事前準備

- Java17をインストールしておいてください。

## インストール

- [Ignite Quick Start Guide for Java](https://ignite.apache.org/docs/ignite2/latest/quick-start/java)に従ってインストールを進めてください。

## 動作確認

上記ガイドに従ってサンプルアプリケーションを実装し、下記要領でアプリを起動してください:

- maven

```shell
# 環境変数を設定
export MAVEN_OPTS="--add-opens=java.base/jdk.internal.access=ALL-UNNAMED \
--add-opens=java.base/jdk.internal.misc=ALL-UNNAMED \
--add-opens=java.base/sun.nio.ch=ALL-UNNAMED \
--add-opens=java.base/sun.util.calendar=ALL-UNNAMED \
--add-opens=java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED \
--add-opens=jdk.internal.jvmstat/sun.jvmstat.monitor=ALL-UNNAMED \
--add-opens=java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED \
--add-opens=jdk.management/com.sun.management.internal=ALL-UNNAMED \
--add-opens=java.base/java.io=ALL-UNNAMED \
--add-opens=java.base/java.nio=ALL-UNNAMED \
--add-opens=java.base/java.net=ALL-UNNAMED \
--add-opens=java.base/java.util=ALL-UNNAMED \
--add-opens=java.base/java.util.concurrent=ALL-UNNAMED \
--add-opens=java.base/java.util.concurrent.locks=ALL-UNNAMED \
--add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED \
--add-opens=java.base/java.lang=ALL-UNNAMED \
--add-opens=java.base/java.lang.invoke=ALL-UNNAMED \
--add-opens=java.base/java.math=ALL-UNNAMED \
--add-opens=java.sql/java.sql=ALL-UNNAMED \
--add-opens=java.base/java.lang.reflect=ALL-UNNAMED \
--add-opens=java.base/java.time=ALL-UNNAMED \
--add-opens=java.base/java.text=ALL-UNNAMED \
--add-opens=java.management/sun.management=ALL-UNNAMED \
--add-opens java.desktop/java.awt.font=ALL-UNNAMED"
```

```shell
mvn exec:java -Dexec.mainClass="nob.example.Main"
```

- Spring Boot

```xml
        <!-- pom.xmlに起動時の引数を設定 -->
		<plugins>
			<plugin>
				<groupId>org.springframework.boot</groupId>
				<artifactId>spring-boot-maven-plugin</artifactId>
				<configuration>
					<jvmArguments>
						--add-opens=java.base/jdk.internal.access=ALL-UNNAMED
						--add-opens=java.base/jdk.internal.misc=ALL-UNNAMED
						--add-opens=java.base/sun.nio.ch=ALL-UNNAMED
						--add-opens=java.base/sun.util.calendar=ALL-UNNAMED
						--add-opens=java.management/com.sun.jmx.mbeanserver=ALL-UNNAMED
						--add-opens=jdk.internal.jvmstat/sun.jvmstat.monitor=ALL-UNNAMED
						--add-opens=java.base/sun.reflect.generics.reflectiveObjects=ALL-UNNAMED
						--add-opens=jdk.management/com.sun.management.internal=ALL-UNNAMED
						--add-opens=java.base/java.io=ALL-UNNAMED
						--add-opens=java.base/java.nio=ALL-UNNAMED
						--add-opens=java.base/java.net=ALL-UNNAMED
						--add-opens=java.base/java.util=ALL-UNNAMED
						--add-opens=java.base/java.util.concurrent=ALL-UNNAMED
						--add-opens=java.base/java.util.concurrent.locks=ALL-UNNAMED
						--add-opens=java.base/java.util.concurrent.atomic=ALL-UNNAMED
						--add-opens=java.base/java.lang=ALL-UNNAMED
						--add-opens=java.base/java.lang.invoke=ALL-UNNAMED
						--add-opens=java.base/java.math=ALL-UNNAMED
						--add-opens=java.sql/java.sql=ALL-UNNAMED
						--add-opens=java.base/java.lang.reflect=ALL-UNNAMED
						--add-opens=java.base/java.time=ALL-UNNAMED
						--add-opens=java.base/java.text=ALL-UNNAMED
						--add-opens=java.management/sun.management=ALL-UNNAMED
						--add-opens=java.desktop/java.awt.font=ALL-UNNAMED
					</jvmArguments>
				</configuration>
			</plugin>
		</plugins>
```

```shell
./mvnw spring-boot:run
```

## リファレンス

Igniteを操作するためのリファレンスです。

- [Control script](https://ignite.apache.org/docs/ignite2/latest/tools/control-script)
- [SQLLine](https://ignite.apache.org/docs/ignite2/latest/tools/sqlline)
