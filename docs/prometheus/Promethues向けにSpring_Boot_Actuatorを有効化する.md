# Prometheus 向けに Spring Boot Actuator を有効化する

Spring Boot Actuator を有効化し、Prometheus 向けにメトリクスを作成します。

## 手順

### 依存関係の追加

cf.

- https://docs.spring.io/spring-boot/reference/actuator/enabling.html
- https://docs.spring.io/spring-boot/reference/actuator/metrics.html

Spring Boot アプリに依存関係を追加します:

```xml
		<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-actuator -->
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-actuator</artifactId>
			<version>3.5.6</version>
		</dependency>
		<!-- https://mvnrepository.com/artifact/io.micrometer/micrometer-registry-prometheus -->
		<dependency>
			<groupId>io.micrometer</groupId>
			<artifactId>micrometer-registry-prometheus</artifactId>
			<version>1.15.4</version>
		</dependency>
```

### エンドポイントの付与

cf.

- https://docs.spring.io/spring-boot/reference/actuator/endpoints.html

`src/main/resources`配下に、下記内容で`application.yml`を作成します:

```yaml
spring:
  application:
    name: easyapp

management:
  endpoints:
    web:
      exposure:
        include:
          - metrics
          - prometheus
  metrics:
    enable:
      "[http.server.requests]": true
```

### Prometheus からの監視

cf.

- https://docs.spring.io/spring-boot/reference/actuator/metrics.html#actuator.metrics.export.prometheus

下記内容で prometheus の監視設定を定義します:

```yaml
scrape_configs:
  - job_name: "easyapp"
    metrics_path: "/actuator/prometheus"
    static_configs:
      - targets: ["easyapp:8080"] # {java app IP}:{port}
```

例として、下記 docker-compose によってアプリを動かし、メトリクスを Prometheus 上で確認することができます:

```yaml
services:
  java:
    container_name: easyapp
    image: eclipse-temurin:17
    ports:
      - 8080:8080
    volumes:
      - ./volumes/easyapp/easyapp-0.0.1-SNAPSHOT.jar:/easyapp-0.0.1-SNAPSHOT.jar
    entrypoint: ["java", "-jar", "/easyapp-0.0.1-SNAPSHOT.jar"]
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - 9090:9090
    volumes:
      - ./volumes/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
```
