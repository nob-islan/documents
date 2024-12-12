# はじめての multipass

multipass を使って仮想マシンを起動します。

## コマンド集

- ネットワーク名を表示します。

  ```shell
  multipass networks
  ```

- 仮想マシンを起動します。

  ```shell
  multipass launch --name first-ubuntu --network Wi-Fi
  ```

- 仮想マシン一覧を確認します。

  ```shell
  multipass ls
  ```

- 仮想マシンにログインします。

  ```shell
  multipass shell first-ubuntu
  ```

- 仮想マシンを停止します。

  ```shell
  multipass stop first-ubuntu
  ```

- 仮想マシンを削除します。

  ```shell
  multipass delete first-ubuntu
  ```

- 仮想マシンを完全に削除します。

  ```shell
  multipass purge first-ubuntu
  ```

- マシンイメージ一覧を表示します。

  ```shell
  multipass find
  ```

- イメージを指定して仮想マシンを起動します。

  ```shell
  multipass launch 20.04 second-ubuntu
  ```

- 仮想マシンのログを tail します。

  ```shell
  multipass exec first-ubuntu -- tail -f /var/log/cloud-init-output.log
  ```
