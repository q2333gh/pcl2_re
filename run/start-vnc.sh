#!/bin/bash

# WSL TigerVNC桌面启动脚本
echo "🚀 启动WSL TigerVNC桌面环境..."

# 设置环境变量
export DISPLAY=:1
export XDG_RUNTIME_DIR=/tmp/runtime-root
mkdir -p /tmp/runtime-root
chmod 700 /tmp/runtime-root

# 启动TigerVNC服务器
echo "📺 启动TigerVNC服务器..."
vncserver :1 -geometry 1920x1080 -depth 24 -localhost no

echo "✅ TigerVNC桌面启动完成！"
echo ""
echo "📋 使用说明："
echo "1. VNC服务器运行在 localhost:5901"
echo "2. 使用VNC客户端连接 localhost:5901"
echo "3. 运行 'vncserver -kill :1' 停止服务器"
echo "4. 或者运行 './stop-vnc.sh' 停止服务器"
echo ""

# 保持脚本运行
echo "🔄 服务器正在运行，按 Ctrl+C 停止..."
wait 