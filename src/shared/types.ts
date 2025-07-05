/**
 * 应用配置接口
 */
export interface AppConfig {
  version: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  autoStart: boolean;
  minimizeToTray: boolean;
}

/**
 * Minecraft 版本信息
 */
export interface MinecraftVersion {
  id: string;
  type: 'release' | 'snapshot' | 'old_beta' | 'old_alpha';
  url: string;
  time: string;
  releaseTime: string;
  sha1?: string;
  complianceLevel?: number;
}

/**
 * 版本清单
 */
export interface VersionManifest {
  latest: {
    release: string;
    snapshot: string;
  };
  versions: MinecraftVersion[];
}

/**
 * 下载任务状态
 */
export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'paused';

/**
 * 下载任务
 */
export interface DownloadTask {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  downloaded: number;
  status: DownloadStatus;
  speed: number;
  startTime?: number;
  endTime?: number;
  error?: string;
}

/**
 * 页面类型
 */
export type PageType = 'launch' | 'download' | 'versions' | 'settings' | 'about';

/**
 * 启动配置
 */
export interface LaunchConfig {
  javaPath?: string;
  maxMemory: number;
  minMemory: number;
  jvmArgs: string[];
  gameArgs: string[];
  windowWidth: number;
  windowHeight: number;
  fullscreen: boolean;
}

/**
 * 用户账户信息
 */
export interface UserAccount {
  id: string;
  username: string;
  uuid: string;
  accessToken: string;
  refreshToken?: string;
  type: 'mojang' | 'microsoft' | 'offline';
  skinUrl?: string;
} 