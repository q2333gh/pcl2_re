# Assets 目录

此目录包含应用程序的静态资源文件。

## 图标文件

- `icon.png` - 应用程序图标 (512x512 PNG)
- `icon.icns` - macOS图标文件 (可选)

## 图标要求

### Linux
- 格式: PNG
- 尺寸: 512x512 像素
- 用途: AppImage, deb包

### Windows
- 格式: PNG 或 ICO
- 尺寸: 256x256 像素
- 用途: 可执行文件图标

### macOS
- 格式: ICNS
- 尺寸: 512x512 像素
- 用途: DMG安装包

## 自动生成

如果图标文件不存在，CI脚本会自动生成占位图标。

## 自定义图标

1. 准备512x512像素的PNG图标
2. 重命名为 `icon.png`
3. 放置在此目录中
4. 重新构建应用

```bash
# 重新构建
pnpm run build
pnpm run dist:linux  # 或其他平台
``` 