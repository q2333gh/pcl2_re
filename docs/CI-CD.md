# CI/CD 指南

本文档介绍PCL2 Reforged项目的持续集成和持续部署流程。

## 🚀 自动化构建和发布

### GitHub Actions 工作流

项目包含三个主要的GitHub Actions工作流：

#### 1. CI 工作流 (`.github/workflows/ci.yml`)

**触发条件：**
- 推送到 `main` 或 `develop` 分支
- 创建Pull Request到 `main` 或 `develop` 分支

**功能：**
- 多Node.js版本测试 (18, 20, 22)
- TypeScript类型检查
- ESLint代码规范检查
- 构建产物验证

#### 2. 开发构建工作流 (`.github/workflows/build-dev.yml`)

**触发条件：**
- 推送到 `main` 或 `develop` 分支
- 创建Pull Request到 `main` 或 `develop` 分支

**功能：**
- 多平台构建 (Windows, Linux, macOS)
- 上传构建产物为Artifacts
- PR自动评论构建信息
- 7天保留期

#### 3. 发布工作流 (`.github/workflows/build.yml`)

**触发条件：**
- 推送版本标签 (如 `v1.0.0`)
- 手动触发 (workflow_dispatch)

**功能：**
- 多平台构建 (Windows, Linux, macOS)
- 自动创建GitHub Release
- 上传构建产物到Releases页面

## 🔄 持续构建

### 每次推送构建

项目配置了持续构建流程，每次代码推送都会自动构建：

#### 开发构建
- **触发**: 推送到 `main` 或 `develop` 分支
- **功能**: 多平台构建，上传为Artifacts
- **保留**: 7天
- **用途**: 开发测试、PR验证

#### 发布构建
- **触发**: 推送版本标签
- **功能**: 创建GitHub Release
- **保留**: 永久
- **用途**: 正式发布

### 构建流程

```
代码推送 → 开发构建 → Artifacts上传 → PR评论
    ↓
版本标签 → 发布构建 → GitHub Release → 用户下载
```

## 📦 发布流程

### 自动发布

1. **创建版本标签**
   ```bash
   # 使用发布脚本
   ./scripts/release.sh patch  # 补丁版本 (1.0.0 -> 1.0.1)
   ./scripts/release.sh minor  # 次要版本 (1.0.0 -> 1.1.0)
   ./scripts/release.sh major  # 主要版本 (1.0.0 -> 2.0.0)
   ```

2. **手动创建标签**
   ```bash
   git tag -a v1.0.0 -m "Release 1.0.0"
   git push origin v1.0.0
   ```

### 发布脚本功能

`scripts/release.sh` 脚本提供以下功能：

- ✅ 工作目录状态检查
- ✅ 分支检查 (建议在main分支发布)
- ✅ 自动拉取最新代码
- ✅ 运行测试和构建
- ✅ 自动版本更新
- ✅ 创建Git标签
- ✅ 推送到远程仓库

### 使用示例

```bash
# 发布补丁版本
./scripts/release.sh patch

# 发布次要版本
./scripts/release.sh minor

# 发布主要版本
./scripts/release.sh major
```

## 🔧 本地构建

### 开发环境

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm run dev

# 快速启动 (使用构建文件)
pnpm run dev:quick
```

### 生产构建

```bash
# 构建所有平台
pnpm run build

# 构建特定平台
pnpm run dist:win    # Windows
pnpm run dist:linux  # Linux
pnpm run dist:mac    # macOS
```

## 📋 构建产物

### 文件结构

```
release/
├── PCL2 Reforged-1.0.0-win-x64.exe          # Windows便携版
├── PCL2 Reforged-1.0.0-linux-x64.AppImage   # Linux AppImage
├── PCL2 Reforged-1.0.0-linux-x64.tar.gz     # Linux压缩包
└── PCL2 Reforged-1.0.0-mac-x64.dmg          # macOS安装包
```

### 平台支持

| 平台 | 格式 | 说明 |
|------|------|------|
| Windows | `.exe` | 便携版，无需安装 |
| Linux | `.AppImage` | 通用Linux发行版 |
| Linux | `.tar.gz` | 压缩包，手动解压 |
| macOS | `.dmg` | 安装包 |

## 🛠️ 故障排除

### 常见问题

#### 1. Linux构建失败

**问题：** 图标文件错误导致构建失败

**解决方案：**
- CI脚本会自动创建占位图标
- 手动添加 `assets/icon.png` 文件 (512x512 PNG)

#### 2. Windows构建失败

**问题：** Wine环境问题

**解决方案：**
- 确保在Windows环境中构建
- 检查electron-builder配置

#### 3. 版本冲突

**问题：** 版本号已存在

**解决方案：**
- 使用发布脚本自动管理版本
- 手动更新 `package.json` 中的版本号

### 调试技巧

1. **查看构建日志**
   ```bash
   pnpm run build 2>&1 | tee build.log
   ```

2. **检查构建产物**
   ```bash
   ls -la dist/
   ls -la release/
   ```

3. **验证应用**
   ```bash
   # 测试构建的应用
   pnpm run dev:quick
   ```

## 📚 相关文档

- [项目架构](./ARCHITECTURE.md)
- [开发指南](./DEVELOPMENT.md)
- [贡献指南](./CONTRIBUTING.md)

## 🔗 相关链接

- [GitHub Actions文档](https://docs.github.com/en/actions)
- [Electron Builder文档](https://www.electron.build/)
- [Vite文档](https://vitejs.dev/) 