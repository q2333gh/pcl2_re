/**
 * Minecraft文件夹类型枚举
 */
export enum McFolderType {
  Original = 'original',
  RenamedOriginal = 'renamed_original',
  Custom = 'custom'
}

/**
 * Minecraft版本状态枚举
 */
export enum McVersionState {
  Error = 'error',
  Fool = 'fool',
  Old = 'old',
  Snapshot = 'snapshot',
  Release = 'release',
  Beta = 'beta',
  Alpha = 'alpha'
}

/**
 * Minecraft版本卡片类型枚举
 */
export enum McVersionCardType {
  Auto = 'auto',
  Hidden = 'hidden',
  Normal = 'normal',
  API = 'api'
}

/**
 * Minecraft文件夹信息
 */
export interface McFolder {
  name: string;
  path: string;
  type: McFolderType;
}

/**
 * Minecraft版本信息
 */
export interface McVersionInfo {
  mcName: string;
  hasFabric: boolean;
  hasForge: boolean;
  hasLiteLoader: boolean;
  hasNeoForge: boolean;
  hasOptiFine: boolean;
  hasQuilt: boolean;
}

/**
 * Minecraft版本配置
 */
export interface McVersionConfig {
  name: string;
  path: string;
  info: string;
  state: McVersionState;
  logo: string;
  isStar: boolean;
  displayType: McVersionCardType;
  releaseTime: Date;
  inheritVersion?: string;
  jsonObject?: any;
  jsonVersion?: any;
}

/**
 * Minecraft版本类
 */
export interface IMcVersion {
  readonly name: string;
  readonly path: string;
  readonly pathIndie: string;
  readonly modable: boolean;
  info: string;
  state: McVersionState;
  logo: string;
  isStar: boolean;
  displayType: McVersionCardType;
  releaseTime: Date;
  inheritVersion?: string;
  version: McVersionInfo;
  isLoaded: boolean;
  load(): void;
  unload(): void;
  equals(other: IMcVersion): boolean;
  toString(): string;
}

/**
 * Minecraft文件夹管理器配置
 */
export interface McFolderManagerConfig {
  defaultPath?: string;
  customFolders?: string[];
  autoCreateDefault?: boolean;
  scanOfficialLauncher?: boolean;
}

/**
 * Minecraft版本管理器配置
 */
export interface McVersionManagerConfig {
  cacheVersion: number;
  autoLoadVersions?: boolean;
  versionIsolation?: VersionIsolationConfig;
}

/**
 * 版本隔离配置
 */
export interface VersionIsolationConfig {
  enabled: boolean;
  mode: VersionIsolationMode;
  autoDetect: boolean;
}

/**
 * 版本隔离模式枚举
 */
export enum VersionIsolationMode {
  Disabled = 0,
  ModableOnly = 1,
  NonReleaseOnly = 2,
  NonReleaseOrModable = 3,
  All = 4
}

/**
 * Minecraft启动配置
 */
export interface McLaunchConfig {
  version: IMcVersion;
  folder: McFolder;
  javaPath?: string;
  memoryMin?: number;
  memoryMax?: number;
  arguments?: string[];
  serverAddress?: string;
  serverPort?: number;
  username?: string;
  uuid?: string;
  accessToken?: string;
  clientToken?: string;
  profileType?: string;
}

/**
 * Minecraft启动结果
 */
export interface McLaunchResult {
  success: boolean;
  processId?: number;
  error?: string;
  output?: string;
}

/**
 * Minecraft版本扫描结果
 */
export interface McVersionScanResult {
  versions: IMcVersion[];
  totalCount: number;
  loadedCount: number;
  errorCount: number;
}

/**
 * Minecraft文件夹扫描结果
 */
export interface McFolderScanResult {
  folders: McFolder[];
  totalCount: number;
  validCount: number;
  errorCount: number;
}

/**
 * Minecraft版本缓存信息
 */
export interface McVersionCache {
  version: number;
  lastUpdate: Date;
  versions: Map<string, McVersionConfig>;
}

/**
 * Minecraft事件类型
 */
export enum McEventType {
  FolderAdded = 'folder_added',
  FolderRemoved = 'folder_removed',
  FolderUpdated = 'folder_updated',
  VersionAdded = 'version_added',
  VersionRemoved = 'version_removed',
  VersionUpdated = 'version_updated',
  VersionLoaded = 'version_loaded',
  VersionUnloaded = 'version_unloaded',
  CurrentVersionChanged = 'current_version_changed'
}

/**
 * Minecraft事件数据
 */
export interface McEventData {
  type: McEventType;
  folder?: McFolder;
  version?: IMcVersion;
  oldVersion?: IMcVersion;
  timestamp: Date;
}

/**
 * Minecraft事件监听器
 */
export type McEventListener = (event: McEventData) => void;

/**
 * Minecraft模块统计信息
 */
export interface McModuleStats {
  totalFolders: number;
  totalVersions: number;
  loadedVersions: number;
  starredVersions: number;
  lastScanTime?: Date;
  cacheSize: number;
} 