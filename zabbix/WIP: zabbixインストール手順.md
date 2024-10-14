# Zabbix インストール

## Zabbix サーバインストール

### 事前準備

- mysql インストール

```shell
sudo apt update
sudo apt install mysql-server-8.0 -f
```

### 参考文献

- https://www.zabbix.com/documentation/current/en/manual/installation/install_from_packages/debian_ubuntu
- https://www.zabbix.com/download?zabbix=7.0&os_distribution=ubuntu&os_version=22.04&components=server_frontend_agent&db=mysql&ws=apache

## Zabbix Agent インストール

### 参考文献

- https://www.zabbix.com/documentation/6.0/jp/manual/appendix/config/zabbix_agentd
- https://qiita.com/ohtsuka-shota/items/a08848ff69dc868e6e43

（Host に template を追加したら Availability が光った気もするが、気のせいな気もする。）
