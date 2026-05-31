# Spring Bootプロジェクトセットアップ

Kotlin + Spring Bootで実装するREST APIのプロジェクトの初期セットアップ方法について記載します。

cf. https://spring.io/guides/tutorials/spring-boot-kotlin

## プロジェクト作成

- [Spring initializer](https://start.spring.io/)を使ってプロジェクトを新規作成します。

```shell
curl https://start.spring.io/starter.zip \
  -d javaVersion=21 \
  -d dependencies=web \
  -d type=maven-project \
  -d language=kotlin \
  -d name=easyapp \
  -d groupId=nob.example \
  -d artifactId=easyapp \
  -o easyapp.zip
```

- zipを解凍します。

```shell
unzip easyapp.zip && rm -rf easyapp.zip
```

- `pom.xml`の警告を消すため、下記設定を追加します:

```xml
	<build>
		<pluginManagement>
			<plugins>
				<plugin>
					<groupId>org.eclipse.m2e</groupId>
					<artifactId>lifecycle-mapping</artifactId>
					<version>1.0.0</version>
					<configuration>
						<lifecycleMappingMetadata>
							<pluginExecutions>
								<pluginExecution>
									<pluginExecutionFilter>
										<groupId>org.jetbrains.kotlin</groupId>
										<artifactId>kotlin-maven-plugin</artifactId>
										<versionRange>[${kotlin.version},)</versionRange>
										<goals>
											<goal>compile</goal>
											<goal>test-compile</goal>
										</goals>
									</pluginExecutionFilter>
									<action>
										<ignore/>
									</action>
								</pluginExecution>
							</pluginExecutions>
						</lifecycleMappingMetadata>
					</configuration>
				</plugin>
			</plugins>
		</pluginManagement>
	</build>
```
