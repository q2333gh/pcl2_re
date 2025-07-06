import { 
  IMcVersion, 
  McVersionInfo, 
  McVersionState, 
  McVersionCardType, 
  VersionIsolationMode 
} from './types';
import { delay } from '../utils';

/**
 * Minecraft版本类实现
 */
export class McVersion implements IMcVersion {
  private _name: string;
  private _path: string;
  private _info: string;
  private _state: McVersionState;
  private _logo: string;
  private _isStar: boolean;
  private _displayType: McVersionCardType;
  private _releaseTime: Date;
  private _inheritVersion?: string;
  private _jsonObject?: any;
  private _jsonVersion?: any;
  private _version: McVersionInfo;
  private _isLoaded: boolean = false;
  private _pathIndie?: string;

  constructor(config: {
    name: string;
    path: string;
    info?: string;
    state?: McVersionState;
    logo?: string;
    isStar?: boolean;
    displayType?: McVersionCardType;
    releaseTime?: Date;
    inheritVersion?: string;
    jsonObject?: any;
    jsonVersion?: any;
  }) {
    this._name = config.name;
    this._path = config.path;
    this._info = config.info || '该版本未被加载，请向作者反馈此问题';
    this._state = config.state || McVersionState.Error;
    this._logo = config.logo || '';
    this._isStar = config.isStar || false;
    this._displayType = config.displayType || McVersionCardType.Auto;
    this._releaseTime = config.releaseTime || new Date(1970, 0, 1);
    this._inheritVersion = config.inheritVersion;
    this._jsonObject = config.jsonObject;
    this._jsonVersion = config.jsonVersion;
    
    // 初始化版本信息
    this._version = {
      mcName: '',
      hasFabric: false,
      hasForge: false,
      hasLiteLoader: false,
      hasNeoForge: false,
      hasOptiFine: false,
      hasQuilt: false
    };
  }

  get name(): string {
    return this._name;
  }

  get path(): string {
    return this._path;
  }

  get pathIndie(): string {
    if (this._pathIndie === undefined) {
      this._pathIndie = this._calculatePathIndie();
    }
    return this._pathIndie;
  }

  get modable(): boolean {
    if (!this.isLoaded) {
      this.load();
    }
    return this._version.hasFabric || 
           this._version.hasForge || 
           this._version.hasLiteLoader || 
           this._version.hasNeoForge ||
           this._displayType === McVersionCardType.API;
  }

  get info(): string {
    return this._info;
  }

  set info(value: string) {
    this._info = value;
  }

  get state(): McVersionState {
    return this._state;
  }

  set state(value: McVersionState) {
    this._state = value;
  }

  get logo(): string {
    return this._logo;
  }

  set logo(value: string) {
    this._logo = value;
  }

  get isStar(): boolean {
    return this._isStar;
  }

  set isStar(value: boolean) {
    this._isStar = value;
  }

  get displayType(): McVersionCardType {
    return this._displayType;
  }

  set displayType(value: McVersionCardType) {
    this._displayType = value;
  }

  get releaseTime(): Date {
    return this._releaseTime;
  }

  set releaseTime(value: Date) {
    this._releaseTime = value;
  }

  get inheritVersion(): string | undefined {
    return this._inheritVersion;
  }

  set inheritVersion(value: string | undefined) {
    this._inheritVersion = value;
  }

  get version(): McVersionInfo {
    if (!this.isLoaded) {
      this.load();
    }
    return { ...this._version }; // 返回副本，避免外部修改
  }

  set version(value: McVersionInfo) {
    this._version = value;
  }

  get isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * 加载版本信息
   */
  load(): void {
    if (this._isLoaded) return;

    try {
      this._parseVersionInfo();
      this._isLoaded = true;
    } catch (error) {
      console.error(`[Minecraft] 加载版本信息失败: ${this.name}`, error);
      this._state = McVersionState.Error;
    }
  }

  /**
   * 卸载版本信息
   */
  unload(): void {
    this._isLoaded = false;
    this._version = {
      mcName: '',
      hasFabric: false,
      hasForge: false,
      hasLiteLoader: false,
      hasNeoForge: false,
      hasOptiFine: false,
      hasQuilt: false
    };
    // 重置路径缓存
    this._pathIndie = undefined;
  }

  /**
   * 比较两个版本是否相等
   */
  equals(other: IMcVersion): boolean {
    if (!other) return false;
    return this.name === other.name && 
           this.path === other.path && 
           this.state === other.state;
  }

  /**
   * 转换为字符串
   */
  toString(): string {
    return this.path;
  }

  /**
   * 计算版本隔离路径
   */
  private _calculatePathIndie(): string {
    // 这里应该根据版本隔离配置来决定是否使用隔离路径
    // 暂时返回原路径，后续可以根据配置实现
    return this._path;
  }

  /**
   * 解析版本信息
   */
  private _parseVersionInfo(): void {
    if (!this._jsonObject) {
      this._loadJsonObject();
    }

    if (!this._jsonObject) {
      throw new Error('无法加载版本JSON文件');
    }

    // 解析Minecraft版本号
    this._version.mcName = this._extractMcVersion();

    // 解析Mod加载器信息
    this._parseModLoaders();
  }

  /**
   * 加载JSON对象
   */
  private _loadJsonObject(): void {
    // 这里应该从文件系统加载version.json
    // 暂时使用模拟数据
    this._jsonObject = {
      id: this._name,
      type: 'release',
      releaseTime: this._releaseTime.toISOString(),
      libraries: []
    };
  }

  /**
   * 提取Minecraft版本号
   */
  private _extractMcVersion(): string {
    if (!this._jsonObject) return '';

    // 从各种可能的字段中提取版本号
    const possibleSources = [
      () => this._jsonObject.clientVersion,
      () => this._jsonObject.id,
      () => this._extractFromLibraries(),
      () => this._extractFromInheritVersion(),
      () => this._extractFromName()
    ];

    for (const source of possibleSources) {
      const version = source();
      if (version && this._isValidVersion(version)) {
        return version;
      }
    }

    // 如果所有方法都失败，尝试从名称中提取
    const nameVersion = this._extractFromName();
    if (nameVersion) {
      return nameVersion;
    }

    return this._name; // 最后回退到文件夹名
  }

  /**
   * 从库文件中提取版本号
   */
  private _extractFromLibraries(): string | null {
    if (!this._jsonObject?.libraries) return null;

    const librariesStr = JSON.stringify(this._jsonObject.libraries);
    
    // 检查Forge
    const forgeMatch = librariesStr.match(/net\.minecraftforge:forge:([^"]+)/);
    if (forgeMatch) return forgeMatch[1];

    // 检查Fabric
    const fabricMatch = librariesStr.match(/fabricmc:intermediary:([^"]+)/);
    if (fabricMatch) return fabricMatch[1];

    // 检查Quilt
    const quiltMatch = librariesStr.match(/quiltmc:intermediary:([^"]+)/);
    if (quiltMatch) return quiltMatch[1];

    return null;
  }

  /**
   * 从继承版本中提取版本号
   */
  private _extractFromInheritVersion(): string | null {
    if (!this._inheritVersion) return null;
    // 从继承版本中提取纯版本号，去掉后缀
    const versionMatch = this._inheritVersion.match(/(1\.[0-9]+(\.[0-9]+)?)/);
    return versionMatch ? versionMatch[1] : this._inheritVersion;
  }

  /**
   * 从名称中提取版本号
   */
  private _extractFromName(): string | null {
    const versionMatch = this._name.match(/(1\.[0-9]+(\.[0-9]+)?)/);
    return versionMatch ? versionMatch[1] : null;
  }

  /**
   * 验证版本号格式
   */
  private _isValidVersion(version: string): boolean {
    return /^1\.[0-9]+(\.[0-9]+)?/.test(version);
  }

  /**
   * 解析Mod加载器信息
   */
  private _parseModLoaders(): void {
    if (!this._jsonObject?.libraries) return;

    const librariesStr = JSON.stringify(this._jsonObject.libraries);

    // 检查Fabric
    this._version.hasFabric = /fabricmc:/.test(librariesStr);

    // 检查Forge
    this._version.hasForge = /net\.minecraftforge:forge:/.test(librariesStr);

    // 检查NeoForge
    this._version.hasNeoForge = /net\.neoforged:/.test(librariesStr);

    // 检查LiteLoader
    this._version.hasLiteLoader = /com\.mumfrey:liteloader:/.test(librariesStr);

    // 检查OptiFine
    this._version.hasOptiFine = /optifine:OptiFine:/.test(librariesStr);

    // 检查Quilt
    this._version.hasQuilt = /quiltmc:intermediary:/.test(librariesStr);
  }

  /**
   * 获取版本配置
   */
  toConfig(): {
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
  } {
    return {
      name: this._name,
      path: this._path,
      info: this._info,
      state: this._state,
      logo: this._logo,
      isStar: this._isStar,
      displayType: this._displayType,
      releaseTime: this._releaseTime,
      inheritVersion: this._inheritVersion,
      jsonObject: this._jsonObject,
      jsonVersion: this._jsonVersion
    };
  }

  /**
   * 从配置创建版本实例
   */
  static fromConfig(config: {
    name: string;
    path: string;
    info?: string;
    state?: McVersionState;
    logo?: string;
    isStar?: boolean;
    displayType?: McVersionCardType;
    releaseTime?: Date;
    inheritVersion?: string;
    jsonObject?: any;
    jsonVersion?: any;
  }): McVersion {
    return new McVersion(config);
  }
} 