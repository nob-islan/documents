# vimインストール
sudo apt -y install vim

# .vimrcファイルの作成
cat << EOF > ~/.vimrc
set nocompatible
EOF

# パッケージインストール
sudo apt update
sudo apt -y install ca-certificates curl gnupg lsb-release

# GPG 鍵の入手
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# リポジトリの登録
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engineインストール
sudo apt -y update
sudo apt -y install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# ユーザを docker グループに追加
sudo usermod -aG docker $USER

# 再起動
sudo reboot
