# PCL2 后端核心实现分层与功能组合分析

本分析基于对 PCL2 后端主要模块的源码解读，聚焦于功能分层、类与函数的组合方式，帮助理解其整体架构和可扩展性。

---

## 1. 基础层（Base Modules）

### 1.1 ModBase
**文件位置：** `Plain Craft Launcher 2/Modules/Base/ModBase.vb`

- **全局常量与配置**：如版本号、路径、语言、设置对象等。
- **工具函数**：如数学运算、颜色处理、注册表读写、文件操作等。
- **自定义类型**：如 MyColor、MyRect、EqualableList。
- **全局状态管理**：如程序启动时间、唯一标识、缓存路径等。

### 1.2 ModLoader
**文件位置：** `Plain Craft Launcher 2/Modules/Base/ModLoader.vb`

- **LoaderBase 抽象基类**：统一所有加载器的生命周期、状态、进度、事件。
- **事件机制**：支持 UI 线程和工作线程的状态变更通知。
- **进度与异常管理**：进度权重、错误传递、强制重启等。
- **组合加载器**：支持 LoaderCombo 组合多个 LoaderBase 实现复杂流程。

### 1.3 ModNet
**文件位置：** `Plain Craft Launcher 2/Modules/Base/ModNet.vb`

- **网络请求封装**：如 Ping、WebClient/WebRequest 多策略重试、超时处理。
- **下载与数据获取**：统一网络访问入口，支持多线程和备用源。

### 1.4 ModValidate
**文件位置：** `Plain Craft Launcher 2/Modules/Base/ModValidate.vb`

- **输入验证体系**：Validate 抽象基类，派生多种规则（如非空、正则、整数、长度、URL等）。
- **组合校验**：支持多规则链式校验，返回首个错误信息。

---

## 2. Minecraft 相关核心模块

### 2.1 ModMinecraft
**文件位置：** `Plain Craft Launcher 2/Modules/Minecraft/ModMinecraft.vb`

- **Minecraft 文件夹管理**：多实例支持，自动发现、同步、创建 profiles。
- **版本管理**：McVersion 类，负责版本信息、状态、切换、缓存。
- **配置同步**：与设置系统 Setup 交互，保证多文件夹/多版本一致性。

### 2.2 ModLaunch
**文件位置：** `Plain Craft Launcher 2/Modules/Minecraft/ModLaunch.vb`

- **启动流程主控**：McLaunchStart 负责启动前检查、版本切换、UI 状态、加载器链路。
- **启动参数与进程管理**：构建参数、解压 Natives、内存优化、进程监控、异常处理。
- **多 Loader 组合**：启动流程由多个 LoaderTask/LoaderCombo 串联，便于扩展和插拔。

### 2.3 ModDownload
**文件位置：** `Plain Craft Launcher 2/Modules/Minecraft/ModDownload.vb`

- **文件下载与校验**：支持主 Jar、资源索引、支持库、资源文件的分步下载与校验。
- **下载任务链**：每类文件下载由 LoaderTask/LoaderCombo 组合，支持后台更新、断点续传。
- **多源策略**：支持官方与镜像源切换，自动降级。

### 2.4 ModJava
**文件位置：** `Plain Craft Launcher 2/Modules/Minecraft/ModJava.vb`

- **Java 环境管理**：自动发现、校验、缓存、序列化/反序列化 Java 运行环境。
- **多版本支持**：区分 JRE/JDK、32/64 位、用户导入与自动发现。
- **环境变量检测**：自动适配 Path/JAVA_HOME。

### 2.5 ModMod
**文件位置：** `Plain Craft Launcher 2/Modules/Minecraft/ModMod.vb`

- **Mod 文件管理**：支持多状态（可用/禁用/不可用）、多属性（名称、描述、作者、依赖等）。
- **依赖与元数据解析**：自动提取 ModId、依赖、版本等信息。
- **状态判定与懒加载**：按需加载文件元信息，提升性能。

### 2.6 ModCrash
**文件位置：** `Plain Craft Launcher 2/Modules/Minecraft/ModCrash.vb`

- **崩溃日志分析**：自动收集、分类、导入、分析 Minecraft 崩溃日志。
- **多格式支持**：支持 crash-report、latest.log、extra log 等多种日志类型。
- **报告生成与导出**：为后续 UI/用户交互提供结构化分析结果。

---

## 3. 组合与扩展机制

- **Loader 体系**：所有耗时/异步任务均以 LoaderBase 派生类实现，支持嵌套、组合、事件驱动。
- **任务链路**：如启动、下载、版本管理等核心流程均由 LoaderTask/LoaderCombo 串联，便于插拔和扩展。
- **全局配置与状态**：通过 Setup、全局变量、事件机制实现模块间解耦与协作。
- **异常与日志**：统一 Log、Hint、异常传递，便于调试和用户反馈。

---

## 4. 总结

PCL2 后端采用高度模块化、事件驱动和任务链式组合的架构。各功能通过 Loader 体系解耦，便于扩展和维护。每个核心模块聚焦单一职责，通过全局配置和事件机制协作，保证了系统的健壮性和灵活性。
