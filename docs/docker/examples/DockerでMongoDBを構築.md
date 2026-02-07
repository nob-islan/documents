# DockerでMongoDBを構築

cf. https://hub.docker.com/_/mongo

```yaml
services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - "./volumes/data/db:/data/db"
```
