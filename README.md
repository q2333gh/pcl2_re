# PCL2 Reforged

使用现代化技术栈重构的Plain Craft Launcher 2，采用Electron + TypeScript + React架构。
# run
./release/linux-unpacked/pcl2-reforged --no-sandbox


## 📋 项目概述

PCL2 Reforged是对原始PCL2项目的现代化重构，目标是：

- 跨平台 win linux mac
- 🚀 更好的用户体验和性能
- 🛠️ 更易于维护的代码架构
- 🎨 现代化的UI设计
- 🔧 更强的扩展性和可定制性

## 🏗️ 技术栈

- **前端框架**: React 18 + TypeScript
- **桌面应用**: Electron
- **UI库**: Material-UI (MUI)
- **状态管理**: Zustand
- **构建工具**: Vite
- **代码规范**: ESLint + Prettier

## 📁 项目结构

```
pcl2_re/
├── src/
│   ├── main/                 # 主进程代码
│   │   ├── main.ts          # 主进程入口
│   │   └── preload.ts       # 预加载脚本
│   ├── renderer/            # 渲染进程代码
│   │   ├── components/      # React组件
│   │   ├── pages/          # 页面组件
│   │   ├── stores/         # 状态管理
│   │   ├── styles/         # 样式文件
│   │   ├── App.tsx         # 主应用组件
│   │   └── index.tsx       # 渲染进程入口
│   └── shared/             # 共享代码
│       ├── types.ts        # 类型定义
│       └── utils.ts        # 工具函数
├── vite.config.ts           # 渲染进程Vite配置
├── vite.main.config.ts       # 主进程Vite配置
├── tsconfig.json           # TypeScript配置
└── package.json           # 项目配置
```

## 🚀 开发指南

### 环境要求

- Node.js   v22
- yarn 

### 安装依赖

```bash
cd pcl2_re
yarn
```

### 开发模式

```bash
yarn dev
```

这将同时启动主进程和渲染进程的开发服务器，支持热重载。

### 构建生产版本

```bash
yarn build
```

### 打包应用

```bash
yarn dist
```

## 📝 开发状态

项目当前处于早期开发阶段，基础框架已搭建完成。

### ✅ 已完成

- [x] 项目基础架构搭建
- [x] Electron + React 开发环境配置
- [x] 基础UI框架和组件
- [x] 页面路由和导航
- [x] 状态管理架构
- [x] **加载器系统 (ModLoader)** - 基于TDD重构的模块化加载器
  - 支持任务加载器、组合加载器
  - 事件驱动架构，支持进度、状态、错误事件
  - 完整的单元测试覆盖
- [x] **网络模块 (ModNet)** - 现代化的网络请求封装
  - 统一的HTTP客户端，支持GET/POST/PUT/DELETE
  - 智能重试机制，支持多种重试策略
  - 完善的错误处理和分类
  - 文件下载、Ping测试、多线程请求
  - 完整的单元测试和文档

### 🚧 开发中

参见 [TODO.md](./TODO.md) 获取详细的开发计划。

## 🎨 设计理念

### 现代化架构

- **模块化设计**: 采用清晰的模块分离，主进程负责系统API，渲染进程负责UI
- **类型安全**: 全面使用TypeScript，提供完整的类型检查
- **响应式设计**: 支持不同屏幕尺寸和分辨率

### 用户体验

- **流畅动画**: 使用Material-UI提供的动画组件
- **暗色主题**: 符合现代应用的设计趋势
- **快速响应**: 优化的构建配置和代码分割

## 📚 文档

- [开发TODO](./TODO.md) - 详细的开发计划和进度
- [技术架构](./docs/ARCHITECTURE.md) - 技术架构设计文档
- [贡献指南](./docs/CONTRIBUTING.md) - 如何参与项目开发

## 📄 许可证

MIT License

## 🙏 致谢

感谢原始PCL2项目的开发者们，为Minecraft社区提供了优秀的启动器工具。 