# 負荷ツール

Linux の計算リソースに負荷をかけるスクリプトたちです。

## CPU

### CPU 使用率固定ツール

各コアに対して均等にバックグラウンドで`yes`コマンドを実行し、CPU 使用率を指定された割合に維持します。

```shell
#!/bin/bash

#====================================================
# CPUの使用率を指定された割合で規定時間維持するスクリプトです。
#====================================================

# パラメータ
working_time=300 # 負荷時間[秒]
load_ratio=0.8   # 負荷割合

# 定数
NUM_OF_CORE=$(nproc) # コア数

# 正常終了時および強制終了時にクリーンアップを実行
function cleanup() {
    pkill -P $$
    exit 1
}

#==========
# 以下実処理
#==========

# 正常終了時および強制終了時にクリーンアップを実行
trap cleanup SIGINT SIGTERM EXIT

start_time=$(date "+%s") # 開始時刻
cooldown_ratio=$(echo "1 - $load_ratio" | bc)

for ((i=0; i<$NUM_OF_CORE; i++)); do
    (
        while true; do
            current_time=$(date +%s)
            elapsed_time=$((current_time - start_time))
            if [ $elapsed_time -ge $working_time ]; then
                break
            fi
            taskset -c $i yes > /dev/null &
            pid=$!
            sleep $load_ratio     # load_ratioの割合だけバックグラウンドでyesコマンドを実行させる
            kill $pid 2>/dev/null
            sleep $cooldown_ratio # cooldown_ratioの割合だけCPUを休ませる
        done
    ) &
done

# 全部のバックグラウンドジョブが終わるのを待つ
wait
```

## メモリ

### メモリ使用率固定ツール

メモリ上のファイルシステムに一時ファイルを作成し、メモリが指定された割合だけ使用された状態を維持します。

```shell
#!/bin/bash

#======================================================
# メモリの使用率を指定された割合で規定時間維持するスクリプトです。
#======================================================

# パラメータ
working_time=300 # 負荷時間[秒]
load_ratio=0.4  # 負荷割合

# 定数
TOTAL_MEMORY_KB=$(grep MemAvailable /proc/meminfo | awk '{print $2}') # メモリ総量[KB]
TOTAL_MEMORY_MB=$((TOTAL_MEMORY_KB / 1024))                           # メモリ総量[MB]
TMP_DIR="/dev/shm/memstress"                                          # メモリ確保用の一時的な作業ディレクトリ

# スクリプト終了時にメモリを開放する関数
function cleanup() {
    rm -rf $TMP_DIR
}

#==========
# 以下実処理
#==========

# 正常終了時および強制終了時にクリーンアップを実行
trap cleanup SIGINT SIGTERM EXIT

mkdir -p $TMP_DIR

used_mb=0 # 使用メモリ量
target_mb=$(echo "$TOTAL_MEMORY_MB * $load_ratio" | bc)
target_mb=${target_mb%.*} # 小数点以下を切り捨てて -lt できるようにする
file_num=0

while [ "$used_mb" -lt "$target_mb" ]; do
    dd if=/dev/zero of="$TMP_DIR/file_$file_num" bs=1M count=100 status=none
    used_mb=$((used_mb + 100))
    file_num=$((file_num + 1))
done

sleep $working_time
```

## ディスク

### ディスク使用率固定ツール

`/tmp`に一時ファイルを作成し、ディスクが指定された割合だけ使用された状態を維持します。

```shell
#!/bin/bash

#======================================================
# メモリの使用率を指定された割合で規定時間維持するスクリプトです。
#======================================================

# パラメータ
working_time=300 # 負荷時間[秒]
load_ratio=0.7  # 負荷割合

# 定数
TOTAL_DISK_MB=$(df -m / | awk 'NR==2 {print $2}')
USED_DISK_MB=$(df -m / | awk 'NR==2 {print $3}')
TMP_DIR="/tmp/diskstress" # メモリ確保用の一時的な作業ディレクトリ

# スクリプト終了時にメモリを開放する関数
function cleanup() {
    rm -rf $TMP_DIR
}

#==========
# 以下実処理
#==========

# 正常終了時および強制終了時にクリーンアップを実行
trap cleanup SIGINT SIGTERM EXIT

mkdir -p $TMP_DIR

target_mb=$(echo "$TOTAL_DISK_MB * $load_ratio" | bc)
target_mb=${target_mb%.*} # 小数点以下を切り捨てて -lt できるようにする
current_disk_mb=$USED_DISK_MB
file_num=0

while [ "$current_disk_mb" -lt "$target_mb" ]; do
    dd if=/dev/zero of="$TMP_DIR/file_$file_num" bs=1M count=100 status=none
    current_disk_mb=$((current_disk_mb + 100))
    file_num=$((file_num + 1))
done

sleep $working_time
```
