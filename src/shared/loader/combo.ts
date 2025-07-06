import { LoaderBase } from './base';
import { LoadState, LoaderOptions, IComboLoader } from './types';

/**
 * 组合加载器
 * 支持多个加载器连续运作
 */
export class LoaderCombo<TInput = any> extends LoaderBase implements IComboLoader<TInput> {
  public input: TInput = null as any;
  public readonly loaders: LoaderBase[] = [];
  private _progress: number = -1;

  constructor(name: string, loaders: LoaderBase[]) {
    super({ name });
    this.loaders = [];
    
    // 添加加载器并设置事件监听
    for (const loader of loaders) {
      if (loader) {
        this.loaders.push(loader);
        loader.onStateChange(this._handleSubTaskStateChange.bind(this));
        loader.initParent(this);
      }
    }
  }

  // 重写进度计算
  get progress(): number {
    switch (this.state) {
      case LoadState.Waiting:
        return 0;
      case LoadState.Loading:
        let total = 0;
        let finished = 0;
        
        for (const loader of this.loaders) {
          total += loader.progressWeight;
          finished += loader.progressWeight * loader.progress;
        }
        
        const calculatedProgress = total === 0 ? 0 : finished / total;
        
        // 触发进度变化事件
        if (this._progress !== calculatedProgress) {
          const oldProgress = this._progress;
          this._progress = calculatedProgress;
          // 调用父类的进度变化事件
          super.progress = calculatedProgress;
        }
        
        return calculatedProgress;
      default:
        return 1;
    }
  }

  set progress(value: number) {
    throw new Error('组合加载器不支持直接设置进度');
  }

  // 重写父加载器初始化
  initParent(parent: LoaderBase | null): void {
    super.initParent(parent);
    for (const loader of this.loaders) {
      loader.initParent(this);
    }
  }

  // 开始执行
  start(input?: TInput, isForceRestart: boolean = false): void {
    this.isForceRestarting = isForceRestart;
    
    // 检查是否已经在执行
    if (this.state === LoadState.Loading) {
      return;
    }

    // 设置状态
    this.state = LoadState.Loading;
    this.input = input;

    // 强制重启时重置所有加载器状态
    if (isForceRestart) {
      for (const loader of this.loaders) {
        if (loader.state === LoadState.Loading) {
          loader.abort();
        }
        loader.state = LoadState.Waiting;
      }
    }

    // 开始更新
    this._update();
  }

  // 中断执行
  abort(): void {
    if (this.state !== LoadState.Loading && this.state !== LoadState.Waiting) {
      return;
    }

    this.state = LoadState.Aborted;

    // 中断所有子加载器
    for (const loader of this.loaders) {
      if (loader.state === LoadState.Loading || loader.state === LoadState.Waiting) {
        loader.abort();
      }
    }
  }

  // 处理子任务状态变化
  private _handleSubTaskStateChange(event: { loader: LoaderBase; newState: LoadState; oldState: LoadState }): void {
    const { loader, newState } = event;

    switch (newState) {
      case LoadState.Loading:
        // 开始执行，不需要特殊处理
        break;
      case LoadState.Waiting:
        // 子加载器可能由于外部输入改变而暂时变为 Waiting，之后会立即重新启动
        break;
      case LoadState.Finished:
        // 正常结束，触发刷新
        this._update();
        break;
      case LoadState.Aborted:
        // 被中断，这个任务也中断
        this.abort();
        break;
      case LoadState.Failed:
        // 出错，这个任务也失败
        // 优先使用原始错误信息
        if (loader.error) {
          this.error = loader.error;
        } else {
          this.error = new Error(`${loader.name} 失败`);
        }
        this.state = LoadState.Failed;
        
        // 中断所有其他加载器
        for (const otherLoader of this.loaders) {
          if (otherLoader !== loader) {
            otherLoader.abort();
          }
        }
        break;
    }
  }

  // 更新执行状态
  private _update(): void {
    if (this.state === LoadState.Finished || 
        this.state === LoadState.Failed || 
        this.state === LoadState.Aborted) {
      return;
    }

    let isFinished = true;
    let blocked = false;
    let currentInput: any = this.input;

    for (const loader of this.loaders) {
      // 检查是否需要重启（针对任务加载器）
      if (loader.state === LoadState.Finished || loader.state === LoadState.Loading) {
        if (this._shouldRestartLoader(loader, currentInput)) {
          console.log(`[Loader] 由于输入条件变更，重启${loader.state === LoadState.Finished ? '已完成的' : '进行中的'}加载器 ${loader.name}`);
          // 重置状态并继续到启动逻辑
          loader.state = LoadState.Waiting;
        }
      }

      switch (loader.state) {
        case LoadState.Finished:
          // 更新下一个加载器的输入（针对任务加载器）
          if (this._isTaskLoader(loader)) {
            currentInput = (loader as any).output;
          }

          // 如果不让继续启动，且已有加载器正在加载中，就不继续启动
          if (loader.block && !isFinished) {
            blocked = true;
          }
          break;

        case LoadState.Loading:
          // 已经有正在加载中的了，不需要再启动了
          isFinished = false;
          blocked = true;
          break;

        case LoadState.Waiting:
        case LoadState.Failed:
        case LoadState.Aborted:
          // 未启动，则启动加载器
          isFinished = false;
          if (blocked) continue;

          if (currentInput !== null && currentInput !== undefined) {
            // 若输入类型与下一个加载器相同才继续
            if (this._isTaskLoader(loader) || this._isComboLoader(loader)) {
              loader.start(currentInput, this.isForceRestarting);
            } else {
              throw new Error(`未知的加载器类型（${loader.constructor.name}）`);
            }
          } else {
            loader.start(undefined, this.isForceRestarting);
          }

          // 阻止继续
          if (loader.block) {
            blocked = true;
          }
          break;
      }
    }

    if (isFinished) {
      // 顺利完成
      this.raisePreviewFinish();
      this.state = LoadState.Finished;
    }
  }

  // 检查是否应该重启加载器
  private _shouldRestartLoader(loader: LoaderBase, input: any): boolean {
    if (!this._isTaskLoader(loader)) {
      return false;
    }

    const taskLoader = loader as any;
    if (typeof taskLoader.shouldStart === 'function') {
      return taskLoader.shouldStart(input, false, true);
    }

    return false;
  }

  // 检查是否为任务加载器
  private _isTaskLoader(loader: LoaderBase): boolean {
    return loader.constructor.name === 'LoaderTask';
  }

  // 检查是否为组合加载器
  private _isComboLoader(loader: LoaderBase): boolean {
    return loader.constructor.name === 'LoaderCombo';
  }

  // 获取最底层的，应被显示给用户的加载器列表
  getLoaderList(requireShow: boolean = true): LoaderBase[] {
    const list: LoaderBase[] = [];
    this._getLoaderListRecursive(this, list, requireShow);
    return list;
  }

  private _getLoaderListRecursive(loader: any, list: LoaderBase[], requireShow: boolean): void {
    for (const subLoader of loader.loaders || []) {
      if (subLoader.show || !requireShow) {
        list.push(subLoader);
      }
      if (this._isComboLoader(subLoader)) {
        this._getLoaderListRecursive(subLoader, list, requireShow);
      }
    }
  }

  // 添加加载器
  addLoader(loader: LoaderBase): void {
    if (loader) {
      this.loaders.push(loader);
      loader.onStateChange(this._handleSubTaskStateChange.bind(this));
      loader.initParent(this);
    }
  }

  // 移除加载器
  removeLoader(loader: LoaderBase): void {
    const index = this.loaders.indexOf(loader);
    if (index > -1) {
      this.loaders.splice(index, 1);
      loader.offStateChange(this._handleSubTaskStateChange.bind(this));
      loader.initParent(null);
    }
  }

  // 清空所有加载器
  clearLoaders(): void {
    for (const loader of this.loaders) {
      loader.offStateChange(this._handleSubTaskStateChange.bind(this));
      loader.initParent(null);
    }
    this.loaders.length = 0;
  }
} 