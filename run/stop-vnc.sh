#!/bin/bash

echo "🛑 停止TigerVNC服务器..."
vncserver -kill :1
echo "✅ VNC服务器已停止" 