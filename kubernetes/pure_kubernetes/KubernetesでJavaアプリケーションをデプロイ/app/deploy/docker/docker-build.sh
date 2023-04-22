USER_NAME="1ruyamaguchi"
IMAGE_NAME="kube-restapi"

# jarファイルをコピー
cp ../../target/kuberestapi-0.0.1-SNAPSHOT.jar ./jar

# イメージをビルド
docker build -t ${USER_NAME}/${IMAGE_NAME} .