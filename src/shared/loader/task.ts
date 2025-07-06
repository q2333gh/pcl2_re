import { LoaderBase } from './base';
import { LoadState, LoaderOptions, ThreadPriority, ITaskLoader } from './types';

/**
 * 任务加载器
 * 用于异步执行并监控单一函数
 */
export class LoaderTask<TInput = any, TOutput = any> extends LoaderBase implements ITaskLoader<TInput, TOutput> {
  // 输入输出
  public input: TInput = null as any;
  public output: TOutput = null as any;

  // 执行相关
  private loadDelegate: (task: LoaderTask<TInput, TOutput>) => void | Promise<void>;
  private inputDelegate?: () => TInput;
  private threadPriority: ThreadPriority = ThreadPriority.Normal;
  private reloadTimeout: number = -1;
  private lastRunningPromise: Promise<void> | null = null;
  private abortController: AbortController | null = null;

  constructor(
    name: string,
    loadDelegate: (task: LoaderTask<TInput, TOutput>) => void | Promise<void>,
    options: LoaderOptions & {
      inputDelegate?: () => TInput;
      reloadTimeout?: number;
    } = {}
  ) {
    super({ name, ...options });
    this.loadDelegate = loadDelegate;
    this.inputDelegate = options.inputDelegate;
    this.reloadTimeout = options.reloadTimeout ?? -1;
    this.threadPriority = options.threadPriority ?? ThreadPriority.Normal;
  }

  // 获取输入
  private startGetInput(input?: TInput): TInput {
    if (input !== undefined && input !== null) {
      return input;
    }
    
    if (this.inputDelegate) {
      return this.inputDelegate();
    }
    
    return this.input;
  }

  // 检查是否应该开始执行
  shouldStart(input: TInput, isForceRestart: boolean = false, ignoreReloadTimeout: boolean = false): boolean {
    // 强制重启
    if (isForceRestart) return true;

    // 输入不同
    if (input !== this.input) return true;

    // 检查重载超时
    if (!ignoreReloadTimeout && 
        this.reloadTimeout > 0 && 
        this.lastFinishedTime > 0 && 
        Date.now() - this.lastFinishedTime < this.reloadTimeout) {
      return false;
    }

    // 如果正在加载或已完成，且没有超时，则不重试
    if ((this.state === LoadState.Loading || this.state === LoadState.Finished) && 
        (ignoreReloadTimeout || this.reloadTimeout === -1 || this.lastFinishedTime === 0 || 
         Date.now() - this.lastFinishedTime < this.reloadTimeout)) {
      return false;
    }

    return true;
  }

  // 开始执行
  start(input?: TInput, isForceRestart: boolean = false): void {
    try {
      const actualInput = this.startGetInput(input);
      
      if (!this.shouldStart(actualInput, isForceRestart)) {
        return;
      }

      // 如果正在执行，先中断
      if (this.state === LoadState.Loading) {
        this.abort();
        // 等待中断完成
        this.state = LoadState.Waiting;
      }

      this.input = actualInput;
      this.isForceRestarting = isForceRestart;
      this.state = LoadState.Loading;
      this.progress = -1;
      this.error = null;

      // 创建新的AbortController
      this.abortController = new AbortController();

      // 执行任务
      this.lastRunningPromise = this._executeTask();
    } catch (error) {
      this.error = error instanceof Error ? error : new Error(String(error));
      this.state = LoadState.Failed;
    }
  }

  // 中断执行
  abort(): void {
    if (this.state !== LoadState.Loading) return;

    this.state = LoadState.Aborted;
    
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  // 检查是否被中断
  get isAborted(): boolean {
    return this.state === LoadState.Aborted || 
           (this.abortController?.signal.aborted ?? false);
  }

  // 私有方法：执行任务
  private async _executeTask(): Promise<void> {
    try {
      // 模拟异步执行
      await new Promise<void>((resolve, reject) => {
        // 检查是否被中断
        if (this.isAborted) {
          reject(new Error('任务已被中断'));
          return;
        }

        // 执行委托函数
        const result = this.loadDelegate(this);
        
        if (result instanceof Promise) {
          result.then(resolve).catch(reject);
        } else {
          resolve();
        }
      });

      // 检查是否被中断
      if (this.isAborted) {
        return;
      }

      // 触发预览完成事件
      this.raisePreviewFinish();
      
      // 标记为完成
      this.state = LoadState.Finished;
      
    } catch (error) {
      if (this.isAborted) {
        return;
      }
      
      this.error = error instanceof Error ? error : new Error(String(error));
      this.state = LoadState.Failed;
    } finally {
      this.lastRunningPromise = null;
    }
  }

  // 等待完成
  async waitForExit(input?: TInput, timeout?: number): Promise<void> {
    this.start(input);
    
    if (this.lastRunningPromise) {
      const startTime = Date.now();
      const timeoutMs = timeout || 30000;
      
      try {
        await Promise.race([
          this.lastRunningPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('等待加载器执行超时。')), timeoutMs)
          )
        ]);
      } catch (error) {
        if (error instanceof Error && error.message === '等待加载器执行超时。') {
          throw error;
        }
        // 其他错误会被状态处理
      }
    }
    
    // 检查最终状态
    if (this.state === LoadState.Finished) {
      return;
    } else if (this.state === LoadState.Aborted) {
      throw new Error('加载器执行已中断。');
    } else if (this.error) {
      throw this.error;
    } else {
      throw new Error('未知错误！');
    }
  }

  // 工具方法
  setLoadDelegate(delegate: (task: LoaderTask<TInput, TOutput>) => void | Promise<void>): void {
    this.loadDelegate = delegate;
  }

  setInputDelegate(delegate: () => TInput): void {
    this.inputDelegate = delegate;
  }

  setReloadTimeout(timeout: number): void {
    this.reloadTimeout = timeout;
  }
} 