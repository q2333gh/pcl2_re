import { 
  LoadState, 
  LoadingState, 
  LoaderOptions, 
  ILoader,
  LoaderEvent,
  ProgressEvent,
  LoaderEventListener,
  ProgressEventListener,
  PreviewFinishListener
} from './types';
import { generateUUID } from '../utils';

/**
 * 加载器基类
 * 提供所有加载器的通用功能和事件机制
 */
export abstract class LoaderBase implements ILoader {
  // 基础属性
  public readonly uuid: string;
  public name: string;
  public parent: LoaderBase | null = null;
  public error: Error | null = null;
  public block: boolean = true;
  public show: boolean = true;
  public isForceRestarting: boolean = false;
  public progressWeight: number = 1;

  // 状态管理
  private _state: LoadState = LoadState.Waiting;
  private _loadingState: LoadingState = LoadingState.Stop;
  private _progress: number = -1;
  private _lastFinishedTime: number = 0;

  // 事件监听器
  private _stateChangeListeners: LoaderEventListener[] = [];
  private _progressChangeListeners: ProgressEventListener[] = [];
  private _previewFinishListeners: PreviewFinishListener[] = [];

  constructor(options: LoaderOptions = {}) {
    this.uuid = generateUUID();
    this.name = options.name || `未命名任务 ${this.uuid}#`;
    this.progressWeight = options.progressWeight ?? 1;
    this.block = options.block ?? true;
    this.show = options.show ?? true;
  }

  // 状态属性
  get state(): LoadState {
    return this._state;
  }

  set state(value: LoadState) {
    if (this._state === value) return;
    
    const oldState = this._state;
    this._state = value;
    
    // 更新UI状态
    this._updateLoadingState(value);
    
    // 触发状态变化事件
    this._emitStateChange(value, oldState);
    
    // 记录完成时间
    if (value === LoadState.Finished) {
      this._lastFinishedTime = Date.now();
    }
  }

  get loadingState(): LoadingState {
    return this._loadingState;
  }

  set loadingState(value: LoadingState) {
    if (this._loadingState === value) return;
    
    const oldState = this._loadingState;
    this._loadingState = value;
    
    // 这里可以触发UI状态变化事件
    this._emitLoadingStateChange(value, oldState);
  }

  get progress(): number {
    switch (this._state) {
      case LoadState.Waiting:
        return 0;
      case LoadState.Loading:
        return this._progress === -1 ? 0.02 : this._progress;
      default:
        return 1;
    }
  }

  set progress(value: number) {
    if (this._progress === value) return;
    
    const oldProgress = this._progress;
    this._progress = value;
    
    // 触发进度变化事件
    this._emitProgressChange(value, oldProgress);
  }

  get lastFinishedTime(): number {
    return this._lastFinishedTime;
  }

  // 获取最上级父加载器
  get realParent(): LoaderBase | null {
    try {
      let parent = this.parent;
      while (parent && parent.parent) {
        parent = parent.parent;
      }
      return parent;
    } catch (error) {
      console.error('获取父加载器失败:', error);
      return null;
    }
  }

  // 抽象方法
  abstract start(input?: any, isForceRestart?: boolean): void;
  abstract abort(): void;

  // 事件监听器管理
  onStateChange(listener: LoaderEventListener): void {
    this._stateChangeListeners.push(listener);
  }

  onProgressChange(listener: ProgressEventListener): void {
    this._progressChangeListeners.push(listener);
  }

  onPreviewFinish(listener: PreviewFinishListener): void {
    this._previewFinishListeners.push(listener);
  }

  offStateChange(listener: LoaderEventListener): void {
    const index = this._stateChangeListeners.indexOf(listener);
    if (index > -1) {
      this._stateChangeListeners.splice(index, 1);
    }
  }

  offProgressChange(listener: ProgressEventListener): void {
    const index = this._progressChangeListeners.indexOf(listener);
    if (index > -1) {
      this._progressChangeListeners.splice(index, 1);
    }
  }

  offPreviewFinish(listener: PreviewFinishListener): void {
    const index = this._previewFinishListeners.indexOf(listener);
    if (index > -1) {
      this._previewFinishListeners.splice(index, 1);
    }
  }

  // 等待完成
  async waitForExit(input?: any, timeout?: number): Promise<void> {
    this.start(input);
    
    const startTime = Date.now();
    const timeoutMs = timeout || 30000; // 默认30秒超时
    
    while (this._state === LoadState.Loading) {
      await new Promise(resolve => setTimeout(resolve, 10));
      
      if (timeout && Date.now() - startTime > timeoutMs) {
        throw new Error('等待加载器执行超时。');
      }
    }
    
    if (this._state === LoadState.Finished) {
      return;
    } else if (this._state === LoadState.Aborted) {
      throw new Error('加载器执行已中断。');
    } else if (this.error) {
      throw this.error;
    } else {
      throw new Error('未知错误！');
    }
  }

  // 初始化父加载器
  initParent(parent: LoaderBase | null): void {
    this.parent = parent;
  }

  // 触发预览完成事件
  protected raisePreviewFinish(): void {
    this._previewFinishListeners.forEach(listener => {
      try {
        listener(this);
      } catch (error) {
        console.error('预览完成事件处理失败:', error);
      }
    });
  }

  // 私有方法
  private _updateLoadingState(state: LoadState): void {
    switch (state) {
      case LoadState.Loading:
        this.loadingState = LoadingState.Run;
        break;
      case LoadState.Failed:
        this.loadingState = LoadingState.Error;
        break;
      default:
        this.loadingState = LoadingState.Stop;
        break;
    }
  }

  private _emitStateChange(newState: LoadState, oldState: LoadState): void {
    const event: LoaderEvent = {
      loader: this,
      newState,
      oldState
    };
    
    this._stateChangeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('状态变化事件处理失败:', error);
      }
    });
  }

  private _emitProgressChange(newProgress: number, oldProgress: number): void {
    const event: ProgressEvent = {
      newProgress,
      oldProgress
    };
    
    this._progressChangeListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('进度变化事件处理失败:', error);
      }
    });
  }

  private _emitLoadingStateChange(newState: LoadingState, oldState: LoadingState): void {
    // 这里可以添加UI状态变化事件
    // 暂时留空，后续可以扩展
  }

  // 工具方法
  equals(other: any): boolean {
    return other instanceof LoaderBase && this.uuid === other.uuid;
  }

  toString(): string {
    return `Loader(${this.name}, ${this._state})`;
  }
} 