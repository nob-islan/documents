# DockerでPostgreSQLを構築

```yaml
services:
  postgresql:
    container_name: postgresql
    image: postgres:18.4
    environment:
      - POSTGRES_USER=root
      - POSTGRES_PASSWORD=password
    ports:
      - 5432:5432
```
