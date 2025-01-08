#!/bin/sh

if [ ! -d "work" ]; then
  mkdir -p work
fi
APP="apipark"
APP_BIN="./${APP}"
DATE=$(date "+%Y-%m-%d %H:%M:%S")

# 日志文件的路径
LOG_FILE="work/${APP}-${DATE}.log"

# PID 文件的路径，用于存储进程 ID
PID_FILE="work/${APP}.pid"

is_program_running() {
    # 使用 ps 命令查找程序，并通过 grep 过滤结果
    # -e 选项表示精确匹配，确保只找到完全匹配的进程
    if ps -ef | grep -v grep | grep -e $1 > /dev/null; then
        return 0  # 程序正在运行
    else
        return 1  # 程序没有运行
    fi
}

# 启动函数
start() {
    # 创建新的日志文件
    date "+%Y-%m-%d %H:%M:%S" >> "$LOG_FILE"
    echo "Starting ${APP}..." >> "$LOG_FILE"

    # 启动并重定向输出到日志文件
    # 使用 nohup 和 & 让程序在后台运行
    nohup "$APP_BIN" >> "$LOG_FILE" 2>&1 &
    PID=$!
    echo ${PID} > "$PID_FILE"
    sleep 3
    if is_program_running ${PID}; then
        echo "${APP} started with PID ${PID}, output is being logged to $LOG_FILE"
    else
        echo "${APP} failed to start, see $LOG_FILE for details"
        cat "$LOG_FILE"
        exit 1
    fi
    # 启动ai事件监听程序
#    nohup ./apipark_ai_event_listen >> "$LOG_FILE" 2>&1 &
}

# 停止函数
stop() {
    # 读取 PID 文件
    PID=$(cat "$PID_FILE")

    # 检查 PID 是否存在
    if [ -z "$PID" ]; then
        echo "No ${APP} process is running."
        return
    fi

    # 发送 SIGTERM 信号以优雅地停止进程
    kill "$PID"

    # 确认进程是否已停止
    if kill -0 "$PID" 2>/dev/null; then
        echo "${APP} is still running, attempting to force stop."
        kill -9 "$PID"
    else
        echo "${APP} stopped successfully."
    fi

    # 删除 PID 文件
    rm -f "$PID_FILE"
}

# 主函数
main() {
    case "$1" in
        start)
            start
            ;;
        stop)
            stop
            ;;
        restart)
            stop
            start
            ;;
        *)
            echo "Usage: $0 {start|stop|restart}"
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"