# PCL2 Reforged Node.js 重构计划

## 📋 项目概述

基于对原始PCL2代码的深入分析，本文档提供了将VB.NET架构重构为Node.js/TypeScript的清晰思路和实现策略。原始PCL2采用模块化设计，核心功能包括Minecraft版本管理、下载系统、启动器、Java管理等。

## 🏗️ 架构重构思路

### 核心设计原则

1. **模块化架构**: 保持原始PCL2的模块化设计理念
2. **异步优先**: 充分利用Node.js的异步特性
3. **类型安全**: 使用TypeScript确保代码质量
4. **跨平台兼容**: 支持Windows、macOS、Linux
5. **性能优化**: 利用Node.js的事件驱动模型

### 架构对比

| 原始PCL2 (VB.NET) | 重构后 (Node.js) |
|------------------|------------------|
| 同步阻塞操作 | 异步非阻塞操作 |
| 单线程UI | 事件驱动架构 |
| 强类型但语法冗长 | TypeScript类型安全 |
| Windows优先 | 跨平台支持 |
| 传统模块化 | 现代ES模块 |

## 🔧 核心模块重构

### 1. 基础模块 (Base Module)

**原始实现**: `ModBase.vb` - 全局配置、路径管理、工具函数

**重构思路**:
```typescript
// 核心配置管理
class ConfigManager {
  private config: Map<string, any>;
  
  get(key: string): any;
  set(key: string, value: any): void;
  load(): Promise<void>;
  save(): Promise<void>;
}

// 路径管理
class PathManager {
  getAppPath(): string;
  getMinecraftPath(): string;
  getTempPath(): string;
  normalizePath(path: string): string;
}

// 工具函数
class Utils {
  static getTimeTick(): number;
  static filterUserName(text: string, replacement: string): string;
  static getExceptionDetail(error: Error): string;
}
```

**关键改进**:
- 使用Map替代字典，性能更好
- 异步配置加载/保存
- 跨平台路径处理
- 统一的错误处理

### 2. 网络模块 (Network Module)

**原始实现**: `ModNet.vb` - HTTP请求、下载管理、重试机制

**重构思路**:
```typescript
// HTTP客户端
class HttpClient {
  async get(url: string, options?: RequestOptions): Promise<string>;
  async download(url: string, dest: string, options?: DownloadOptions): Promise<void>;
  async downloadWithProgress(url: string, dest: string, onProgress?: ProgressCallback): Promise<void>;
}

// 下载管理器
class DownloadManager {
  private queue: DownloadTask[];
  private maxConcurrent: number;
  
  addTask(task: DownloadTask): void;
  start(): Promise<void>;
  pause(): void;
  resume(): void;
}

// 重试机制
class RetryManager {
  async withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T>;
}
```

**关键改进**:
- 使用现代fetch API替代WebClient
- 流式下载支持大文件
- 智能重试策略
- 并发下载控制

### 3. Minecraft版本管理 (Minecraft Module)

**原始实现**: `ModMinecraft.vb` - 版本信息、文件夹管理、版本切换

**重构思路**:
```typescript
// 版本信息
interface MinecraftVersion {
  id: string;
  type: 'release' | 'snapshot' | 'beta' | 'alpha';
  releaseTime: Date;
  url: string;
  libraries: Library[];
  mainClass: string;
  arguments: LaunchArguments;
}

// 版本管理器
class VersionManager {
  private versions: Map<string, MinecraftVersion>;
  
  async loadVersionList(): Promise<MinecraftVersion[]>;
  async getVersion(id: string): Promise<MinecraftVersion>;
  async installVersion(id: string): Promise<void>;
  async validateVersion(id: string): Promise<boolean>;
}

// 文件夹管理
class MinecraftFolderManager {
  private folders: MinecraftFolder[];
  
  async scanFolders(): Promise<MinecraftFolder[]>;
  async addFolder(path: string, name?: string): Promise<void>;
  async removeFolder(path: string): Promise<void>;
  async setCurrentFolder(path: string): Promise<void>;
}
```

**关键改进**:
- 强类型版本信息
- 异步版本操作
- 智能文件夹扫描
- 版本依赖解析

### 4. 下载系统 (Download Module)

**原始实现**: `ModDownload.vb` - 文件下载、进度跟踪、校验

**重构思路**:
```typescript
// 下载任务
interface DownloadTask {
  id: string;
  url: string;
  destination: string;
  checksum?: string;
  size?: number;
  priority: number;
}

// 下载服务
class DownloadService {
  private tasks: Map<string, DownloadTask>;
  private workers: DownloadWorker[];
  
  async downloadFile(task: DownloadTask): Promise<void>;
  async downloadVersion(versionId: string): Promise<void>;
  async resumeDownload(taskId: string): Promise<void>;
  getProgress(taskId: string): DownloadProgress;
}

// 文件校验
class FileValidator {
  async validateFile(path: string, checksum: string, algorithm: 'sha1' | 'sha256'): Promise<boolean>;
  async calculateChecksum(path: string, algorithm: 'sha1' | 'sha256'): Promise<string>;
}
```

**关键改进**:
- 任务队列管理
- 断点续传支持
- 多线程下载
- 智能校验

### 5. Java环境管理 (Java Module)

**原始实现**: `ModJava.vb` - Java检测、版本管理、自动下载

**重构思路**:
```typescript
// Java版本信息
interface JavaVersion {
  path: string;
  version: string;
  major: number;
  minor: number;
  patch: number;
  isCompatible(requiredVersion: string): boolean;
}

// Java管理器
class JavaManager {
  private installedVersions: JavaVersion[];
  
  async detectInstalledVersions(): Promise<JavaVersion[]>;
  async findCompatibleJava(minecraftVersion: string): Promise<JavaVersion>;
  async downloadJava(version: string): Promise<void>;
  async validateJava(path: string): Promise<boolean>;
}
```

**关键改进**:
- 智能Java检测
- 版本兼容性检查
- 自动下载缺失版本
- 跨平台支持

### 6. 启动器 (Launch Module)

**原始实现**: `ModLaunch.vb` - 启动流程、参数生成、进程管理

**重构思路**:
```typescript
// 启动配置
interface LaunchConfig {
  version: string;
  javaPath: string;
  maxMemory: number;
  minMemory: number;
  customArgs: string[];
  serverIp?: string;
}

// 启动器
class MinecraftLauncher {
  private process?: ChildProcess;
  
  async launch(config: LaunchConfig): Promise<ChildProcess>;
  async generateArguments(config: LaunchConfig): Promise<string[]>;
  async waitForGameWindow(): Promise<void>;
  async terminate(): Promise<void>;
}

// 参数生成器
class ArgumentGenerator {
  generateJvmArgs(config: LaunchConfig): string[];
  generateGameArgs(version: MinecraftVersion, config: LaunchConfig): string[];
  generateLibraryArgs(libraries: Library[]): string[];
}
```

**关键改进**:
- 异步启动流程
- 智能参数生成
- 进程监控
- 优雅关闭

### 7. 模组管理 (Mod Module)

**原始实现**: `ModMod.vb` - 模组检测、安装、冲突检查

**重构思路**:
```typescript
// 模组信息
interface ModInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  dependencies: ModDependency[];
  conflicts: string[];
}

// 模组管理器
class ModManager {
  async scanMods(versionPath: string): Promise<ModInfo[]>;
  async installMod(modPath: string, versionPath: string): Promise<void>;
  async removeMod(modId: string, versionPath: string): Promise<void>;
  async checkConflicts(mods: ModInfo[]): Promise<ModConflict[]>;
}
```

**关键改进**:
- 智能模组检测
- 依赖解析
- 冲突检查
- 批量操作

## 🔄 数据流重构

### 原始PCL2数据流
```
UI → 同步调用 → 业务逻辑 → 文件系统/网络
```

### 重构后数据流
```
UI → 异步调用 → 事件总线 → 业务逻辑 → 文件系统/网络
```

### 事件驱动架构
```typescript
// 事件总线
class EventBus {
  emit(event: string, data: any): void;
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
}

// 事件类型
enum Events {
  DOWNLOAD_PROGRESS = 'download:progress',
  VERSION_INSTALLED = 'version:installed',
  LAUNCH_STARTED = 'launch:started',
  LAUNCH_FINISHED = 'launch:finished',
  ERROR_OCCURRED = 'error:occurred'
}
```

## 📊 性能优化策略

### 1. 异步操作优化
- 使用Promise.all进行并发操作
- 实现请求缓存减少重复下载
- 流式处理大文件

### 2. 内存管理
- 及时释放不需要的资源
- 使用WeakMap避免内存泄漏
- 实现对象池减少GC压力

### 3. 并发控制
- 限制同时下载数量
- 实现任务优先级队列
- 智能重试机制

## 🧪 测试策略

### 1. 单元测试
```typescript
describe('VersionManager', () => {
  it('should load version list', async () => {
    const manager = new VersionManager();
    const versions = await manager.loadVersionList();
    expect(versions).toBeInstanceOf(Array);
    expect(versions.length).toBeGreaterThan(0);
  });
});
```

### 2. 集成测试
```typescript
describe('MinecraftLauncher', () => {
  it('should launch minecraft successfully', async () => {
    const launcher = new MinecraftLauncher();
    const config = { version: '1.20.4', maxMemory: 4096 };
    const process = await launcher.launch(config);
    expect(process.pid).toBeDefined();
  });
});
```

### 3. 端到端测试
```typescript
describe('Complete Workflow', () => {
  it('should download and launch minecraft', async () => {
    // 完整流程测试
  });
});
```

## 🔧 开发工具链

### 1. 构建工具
- **Vite**: 快速开发和构建
- **TypeScript**: 类型安全
- **ESLint**: 代码规范
- **Prettier**: 代码格式化

### 2. 测试工具
- **Jest**: 单元测试
- **Supertest**: API测试
- **Playwright**: E2E测试

### 3. 监控工具
- **Winston**: 日志管理
- **Prometheus**: 性能监控
- **Sentry**: 错误追踪

## 📈 迁移路线图

### 阶段1: 基础架构 (2周)
- [ ] 项目结构搭建
- [ ] 基础工具类实现
- [ ] 配置管理系统
- [ ] 日志系统

### 阶段2: 核心服务 (4周)
- [ ] 网络服务重构
- [ ] 文件系统服务
- [ ] 版本管理服务
- [ ] 下载服务

### 阶段3: 业务逻辑 (6周)
- [ ] Minecraft版本管理
- [ ] Java环境管理
- [ ] 启动器实现
- [ ] 模组管理

### 阶段4: 集成测试 (2周)
- [ ] 单元测试覆盖
- [ ] 集成测试
- [ ] 性能测试
- [ ] 端到端测试

### 阶段5: 优化部署 (2周)
- [ ] 性能优化
- [ ] 错误处理完善
- [ ] 文档编写
- [ ] 部署配置

## 🎯 成功指标

### 技术指标
- 测试覆盖率 > 90%
- 启动时间 < 5秒
- 内存使用 < 200MB
- 下载速度提升 30%

### 业务指标
- 功能完整性 100%
- 用户体验提升
- 跨平台兼容性
- 错误率降低 50%

## 🔮 未来扩展

### 1. 插件系统
```typescript
interface Plugin {
  name: string;
  version: string;
  init(): Promise<void>;
  destroy(): Promise<void>;
}
```

### 2. 云同步
- 配置云同步
- 模组包云存储
- 多设备同步

### 3. 社区功能
- 模组推荐
- 整合包分享
- 用户评价系统

---

*本文档将根据开发进展持续更新* 