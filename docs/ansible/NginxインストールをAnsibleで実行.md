# Nginx インストールを Ansible で実行

お試し程度

## 実装

```yaml
- hosts: node
  tasks:
    # 下準備
    - name: Preparation
      apt:
        update_cache: yes
      become: yes

    # nginxインストール
    - name: Nginx install
      apt:
        name:
          - nginx
      become: yes

    # nginxが起動していることの確認
    - name: Make sure nginx is running
      service:
        name: nginx
        state: started
```

## 実行

```shell
ansible-playbook ~/ansible/playbook/nginx.yaml -i /etc/ansible/hosts --private-key ~/.ssh/first-key -u ubuntu
```
