import { 
  McFolder, 
  McFolderType, 
  McFolderManagerConfig, 
  McFolderScanResult,
  McEventType,
  McEventData,
  McEventListener
} from './types';
import { delay } from '../utils';

/**
 * Minecraft文件夹管理器
 */
export class McFolderManager {
  private folders: McFolder[] = [];
  private config: McFolderManagerConfig;
  private eventListeners: Map<McEventType, McEventListener[]> = new Map();

  constructor(config: McFolderManagerConfig = {}) {
    this.config = {
      defaultPath: './',
      customFolders: [],
      autoCreateDefault: true,
      scanOfficialLauncher: true,
      ...config
    };
  }

  /**
   * 获取所有文件夹
   */
  getFolders(): McFolder[] {
    return [...this.folders];
  }

  /**
   * 获取当前Minecraft文件夹路径
   */
  getCurrentPath(): string {
    return this.config.defaultPath || './';
  }

  /**
   * 设置当前Minecraft文件夹路径
   */
  setCurrentPath(path: string): void {
    this.config.defaultPath = path;
  }

  /**
   * 扫描Minecraft文件夹
   */
  async scanFolders(): Promise<McFolderScanResult> {
    const cacheFolders: McFolder[] = [];
    let errorCount = 0;

    try {
      // 扫描当前文件夹
      await this._scanCurrentFolder(cacheFolders);

      // 扫描官方启动器文件夹
      if (this.config.scanOfficialLauncher) {
        await this._scanOfficialLauncherFolder(cacheFolders);
      }

      // 扫描自定义文件夹
      await this._scanCustomFolders(cacheFolders);

      // 如果没有可用文件夹，创建默认文件夹
      if (cacheFolders.length === 0 && this.config.autoCreateDefault) {
        await this._createDefaultFolder(cacheFolders);
      }

      // 更新launcher_profiles.json
      await this._updateLauncherProfiles(cacheFolders);

      // 更新文件夹列表
      const oldFolders = [...this.folders];
      this.folders = cacheFolders;

      // 触发事件
      this._triggerFolderEvents(oldFolders, this.folders);

      return {
        folders: this.folders,
        totalCount: this.folders.length,
        validCount: this.folders.length,
        errorCount
      };

    } catch (error) {
      console.error('[Minecraft] 扫描文件夹失败:', error);
      return {
        folders: this.folders,
        totalCount: this.folders.length,
        validCount: this.folders.length,
        errorCount: errorCount + 1
      };
    }
  }

  /**
   * 添加自定义文件夹
   */
  addCustomFolder(name: string, path: string): boolean {
    try {
      // 检查路径是否有效
      if (!this._isValidMinecraftPath(path)) {
        console.warn(`[Minecraft] 无效的Minecraft文件夹路径: ${path}`);
        return false;
      }

      // 检查是否已存在
      const existingFolder = this.folders.find(f => f.path === path);
      if (existingFolder) {
        existingFolder.name = name;
        existingFolder.type = McFolderType.RenamedOriginal;
        this._triggerEvent(McEventType.FolderUpdated, { folder: existingFolder });
        return true;
      }

      // 添加新文件夹
      const newFolder: McFolder = {
        name,
        path,
        type: McFolderType.Custom
      };

      this.folders.push(newFolder);
      this._triggerEvent(McEventType.FolderAdded, { folder: newFolder });

      // 更新配置
      this._updateCustomFoldersConfig();

      return true;
    } catch (error) {
      console.error(`[Minecraft] 添加自定义文件夹失败: ${path}`, error);
      return false;
    }
  }

  /**
   * 移除文件夹
   */
  removeFolder(path: string): boolean {
    const index = this.folders.findIndex(f => f.path === path);
    if (index === -1) return false;

    const folder = this.folders[index];
    this.folders.splice(index, 1);
    this._triggerEvent(McEventType.FolderRemoved, { folder });

    // 更新配置
    this._updateCustomFoldersConfig();

    return true;
  }

  /**
   * 获取文件夹信息
   */
  getFolder(path: string): McFolder | undefined {
    return this.folders.find(f => f.path === path);
  }

  /**
   * 检查文件夹是否存在
   */
  hasFolder(path: string): boolean {
    return this.folders.some(f => f.path === path);
  }

  /**
   * 添加事件监听器
   */
  addEventListener(type: McEventType, listener: McEventListener): void {
    if (!this.eventListeners.has(type)) {
      this.eventListeners.set(type, []);
    }
    this.eventListeners.get(type)!.push(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(type: McEventType, listener: McEventListener): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 扫描当前文件夹
   */
  private async _scanCurrentFolder(cacheFolders: McFolder[]): Promise<void> {
    try {
      const currentPath = this.config.defaultPath || './';
      
      // 检查当前路径是否有versions文件夹
      if (this._hasVersionsFolder(currentPath)) {
        cacheFolders.push({
          name: '当前文件夹',
          path: currentPath,
          type: McFolderType.Original
        });
      }

      // 扫描子文件夹
      const subFolders = await this._getSubFolders(currentPath);
      for (const folder of subFolders) {
        if (this._hasVersionsFolder(folder) || folder.endsWith('.minecraft')) {
          cacheFolders.push({
            name: '当前文件夹',
            path: folder + '/',
            type: McFolderType.Original
          });
        }
      }
    } catch (error) {
      console.error('[Minecraft] 扫描当前文件夹失败:', error);
    }
  }

  /**
   * 扫描官方启动器文件夹
   */
  private async _scanOfficialLauncherFolder(cacheFolders: McFolder[]): Promise<void> {
    try {
      // 获取官方启动器路径
      const officialPath = this._getOfficialLauncherPath();
      
      if (officialPath && this._hasVersionsFolder(officialPath)) {
        // 检查是否与当前文件夹重复
        const isDuplicate = cacheFolders.some(f => f.path === officialPath);
        if (!isDuplicate) {
          cacheFolders.push({
            name: '官方启动器文件夹',
            path: officialPath,
            type: McFolderType.Original
          });
        }
      }
    } catch (error) {
      console.error('[Minecraft] 扫描官方启动器文件夹失败:', error);
    }
  }

  /**
   * 扫描自定义文件夹
   */
  private async _scanCustomFolders(cacheFolders: McFolder[]): Promise<void> {
    if (!this.config.customFolders) return;

    for (const folderConfig of this.config.customFolders) {
      try {
        const [name, path] = this._parseFolderConfig(folderConfig);
        if (!name || !path) continue;

        // 检查路径是否有效
        if (!this._isValidMinecraftPath(path)) {
          console.warn(`[Minecraft] 无效的Minecraft文件夹: ${folderConfig}`);
          continue;
        }

        // 检查是否已存在
        const existingFolder = cacheFolders.find(f => f.path === path);
        if (existingFolder) {
          existingFolder.name = name;
          existingFolder.type = McFolderType.RenamedOriginal;
        } else {
          cacheFolders.push({
            name,
            path,
            type: McFolderType.Custom
          });
        }
      } catch (error) {
        console.error(`[Minecraft] 扫描自定义文件夹失败: ${folderConfig}`, error);
      }
    }
  }

  /**
   * 创建默认文件夹
   */
  private async _createDefaultFolder(cacheFolders: McFolder[]): Promise<void> {
    try {
      const defaultPath = (this.config.defaultPath || './') + '.minecraft/versions/';
      
      // 创建目录
      await this._createDirectory(defaultPath);
      
      cacheFolders.push({
        name: '当前文件夹',
        path: defaultPath.replace('/versions/', '/'),
        type: McFolderType.Original
      });
    } catch (error) {
      console.error('[Minecraft] 创建默认文件夹失败:', error);
    }
  }

  /**
   * 更新launcher_profiles.json
   */
  private async _updateLauncherProfiles(folders: McFolder[]): Promise<void> {
    for (const folder of folders) {
      try {
        await this._createLauncherProfiles(folder.path);
      } catch (error) {
        console.error(`[Minecraft] 更新launcher_profiles.json失败: ${folder.path}`, error);
      }
    }
  }

  /**
   * 创建launcher_profiles.json文件
   */
  private async _createLauncherProfiles(folderPath: string): Promise<void> {
    const profilesPath = folderPath + 'launcher_profiles.json';
    
    // 检查文件是否已存在
    if (await this._fileExists(profilesPath)) {
      return;
    }

    const profilesContent = {
      profiles: {
        PCL: {
          icon: 'Grass',
          name: 'PCL',
          lastVersionId: 'latest-release',
          type: 'latest-release',
          lastUsed: new Date().toISOString()
        }
      },
      selectedProfile: 'PCL',
      clientToken: '23323323323323323323323323323333'
    };

    // 写入文件
    await this._writeFile(profilesPath, JSON.stringify(profilesContent, null, 2));
    console.log(`[Minecraft] 已创建launcher_profiles.json: ${folderPath}`);
  }

  /**
   * 检查是否有versions文件夹
   */
  private _hasVersionsFolder(path: string): boolean {
    // 模拟检查，实际应该检查文件系统
    return path.includes('versions') || path.includes('.minecraft');
  }

  /**
   * 获取子文件夹
   */
  private async _getSubFolders(path: string): Promise<string[]> {
    // 模拟获取子文件夹，实际应该读取文件系统
    return [];
  }

  /**
   * 获取官方启动器路径
   */
  private _getOfficialLauncherPath(): string | null {
    // 模拟获取官方启动器路径
    // 实际应该根据操作系统获取
    return null;
  }

  /**
   * 解析文件夹配置
   */
  private _parseFolderConfig(config: string): [string, string] {
    const parts = config.split('>');
    if (parts.length !== 2) return ['', ''];
    
    const name = parts[0].trim();
    const path = parts[1].trim();
    
    if (!name || !path || !path.endsWith('/')) {
      return ['', ''];
    }
    
    return [name, path];
  }

  /**
   * 检查Minecraft路径是否有效
   */
  private _isValidMinecraftPath(path: string): boolean {
    // 模拟路径验证，实际应该检查文件系统权限和结构
    return path.length > 0 && path.endsWith('/');
  }

  /**
   * 创建目录
   */
  private async _createDirectory(path: string): Promise<void> {
    // 模拟创建目录，实际应该使用文件系统API
    console.log(`[Minecraft] 创建目录: ${path}`);
  }

  /**
   * 检查文件是否存在
   */
  private async _fileExists(path: string): Promise<boolean> {
    // 模拟文件存在检查，实际应该使用文件系统API
    return false;
  }

  /**
   * 写入文件
   */
  private async _writeFile(path: string, content: string): Promise<void> {
    // 模拟写入文件，实际应该使用文件系统API
    console.log(`[Minecraft] 写入文件: ${path}`);
  }

  /**
   * 更新自定义文件夹配置
   */
  private _updateCustomFoldersConfig(): void {
    const customFolders = this.folders
      .filter(f => f.type !== McFolderType.Original)
      .map(f => `${f.name}>${f.path}`);
    
    this.config.customFolders = customFolders;
  }

  /**
   * 触发文件夹事件
   */
  private _triggerFolderEvents(oldFolders: McFolder[], newFolders: McFolder[]): void {
    // 检查添加的文件夹
    for (const folder of newFolders) {
      if (!oldFolders.find(f => f.path === folder.path)) {
        this._triggerEvent(McEventType.FolderAdded, { folder });
      }
    }

    // 检查移除的文件夹
    for (const folder of oldFolders) {
      if (!newFolders.find(f => f.path === folder.path)) {
        this._triggerEvent(McEventType.FolderRemoved, { folder });
      }
    }
  }

  /**
   * 触发事件
   */
  private _triggerEvent(type: McEventType, data: Partial<McEventData>): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const eventData: McEventData = {
        type,
        timestamp: new Date(),
        ...data
      };
      
      for (const listener of listeners) {
        try {
          listener(eventData);
        } catch (error) {
          console.error(`[Minecraft] 事件监听器执行失败: ${type}`, error);
        }
      }
    }
  }
} 