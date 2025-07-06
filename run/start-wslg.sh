#!/bin/bash

# WSLg桌面启动脚本 - 独立窗口模式
echo "🚀 启动WSLg桌面环境..."

# 设置环境变量
export DISPLAY=:0
export XDG_RUNTIME_DIR=/tmp/runtime-root
mkdir -p /tmp/runtime-root
chmod 700 /tmp/runtime-root

# 检查WSLg是否可用
if [ ! -d "/mnt/wslg" ]; then
    echo "❌ WSLg不可用，请升级到WSL2并启用WSLg"
    exit 1
fi

echo "✅ WSLg检测成功"
echo "🖥️  启动XFCE4桌面..."

# 启动XFCE4桌面
xfce4-session &

echo "✅ 桌面启动完成！"
echo ""
echo "📋 使用说明："
echo "1. 桌面窗口应该出现在Windows桌面上"
echo "2. 就像VMware虚拟机一样，是独立的窗口"
echo "3. 可以调整窗口大小、最小化、最大化"
echo "4. 在桌面中可以运行Linux图形应用程序"
echo "5. 按 Ctrl+C 停止桌面"
echo ""

# 等待用户中断
trap "echo '🛑 正在停止桌面...'; pkill -f xfce4-session; exit" INT
wait 