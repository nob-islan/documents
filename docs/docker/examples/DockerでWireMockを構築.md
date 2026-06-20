# DockerでWireMockを構築

cf. https://wiremock.org/docs/standalone/docker/

```yaml
services:
  wiremock:
    container_name: wiremock
    image: wiremock/wiremock:latest
    ports:
      - 8080:8080
    volumes:
      - ./volumes/wiremock/mappings:/home/wiremock/mappings
```
