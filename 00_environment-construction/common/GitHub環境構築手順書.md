## GitHub環境構築手順書
https://github.com/1ruyamaguchi  
あらかじめコマンドラインでgitコマンドが叩けるようにしておく。（Homebrewを使ったgitのインストールなど）

### Gitの初期設定
ターミナルで以下のコマンドを叩く：  
ユーザ名の設定  
```
git config --global user.name \${userName}  
```
メールアドレスの設定  
```
git config --global user.email \${email}  
```
登録内容の確認  
```
git config --list
```

### GitHubでアカウントの作成
https://github.com  
user: nob-islan
email: nob.snail@gmail.com
pass: 4r7ju34w
<!-- User: 1ruyamaguchi  
email: 1ru.yamaguchi@gmail.com  
Pass: 4r7ju1ru   -->
画面の表示通りに進めばうまくいく…はず。

### リモートリポジトリの作成
GitHubトップ画面にて「Create repository」を選択  
画面の表示通りに進めばうまくいく…はず。

### ローカルリポジトリの作成
ローカルリポジトリにしたいディレクトリに移動し、
```
git init
```
を叩く。

### push時
以下のコマンドでローカルリポジトリとリモートリポジトリを紐付け
```
git remote add origin ${リモートリポジトリのアドレス}
```
push時にuser nameおよびパスワードを聞かれることがある（最初だけかも）。  
このパスワードはログイン時のパスワードとは異なる…らしい。
個人アクセストークンを以下の手順で作成し、入力する必要がある。
- GitHubのページ右上のプロフィールを選択、「Settings」押下
- 左サイドバーの「Developer settings」> 「Personal access tokens」押下
- 「Generate new token」押下
- 必要事項を埋めていく。スコープは「repo」でいいはず。
- 「Generate token」押下

