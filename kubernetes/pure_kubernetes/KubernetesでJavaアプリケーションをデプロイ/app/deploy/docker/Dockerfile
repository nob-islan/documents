FROM openjdk:17

# イメージビルド用の環境変数
ARG jarFile="kuberestapi-0.0.1-SNAPSHOT.jar"
ARG jarFilePath="/nob/server/jar"
ARG logFilePath="/nob/server/log"
# コンテナ内で使う環境変数
ENV JAR_FILE=${jarFile}
ENV JAR_FILE_PATH=${jarFilePath}

RUN mkdir -p ${jarFilePath}
RUN mkdir ${logFilePath}

COPY ./jar/${jarFile} ${jarFilePath}

CMD java -jar ${JAR_FILE_PATH}/${JAR_FILE}