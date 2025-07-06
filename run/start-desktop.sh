#!/bin/bash

# WSL桌面环境启动脚本
echo "🚀 启动WSL桌面环境..."

# 设置环境变量
export DISPLAY=:0
export XDG_RUNTIME_DIR=/tmp/runtime-root
mkdir -p /tmp/runtime-root
chmod 700 /tmp/runtime-root

# 启动虚拟X11服务器
echo "📺 启动虚拟X11服务器..."
Xvfb :0 -screen 0 1920x1080x24 -ac &
XVFB_PID=$!

# 等待X11服务器启动
sleep 2

# 启动XFCE4桌面
echo "🖥️  启动XFCE4桌面..."
xfce4-session &
DESKTOP_PID=$!

# 启动VNC服务器（可选，用于远程访问）
echo "🌐 启动VNC服务器 (端口5900)..."
x11vnc -display :0 -nopw -listen localhost -xkb -ncache 10 -ncache_cr -forever &
VNC_PID=$!

echo "✅ 桌面环境启动完成！"
echo ""
echo "📋 使用说明："
echo "1. 桌面已启动在 :0 显示"
echo "2. VNC服务器运行在 localhost:5900"
echo "3. 使用VNC客户端连接 localhost:5900 查看桌面"
echo "4. 按 Ctrl+C 停止所有服务"
echo ""

# 等待用户中断
trap "echo '🛑 正在停止桌面环境...'; kill $XVFB_PID $DESKTOP_PID $VNC_PID 2>/dev/null; exit" INT
wait 