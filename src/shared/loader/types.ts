/**
 * 加载器状态枚举
 */
export enum LoadState {
  Waiting = 'waiting',
  Loading = 'loading',
  Finished = 'finished',
  Failed = 'failed',
  Aborted = 'aborted'
}

/**
 * 加载器状态的中文描述
 */
export const LoadStateLabels: Record<LoadState, string> = {
  [LoadState.Waiting]: '等待中',
  [LoadState.Loading]: '加载中',
  [LoadState.Finished]: '已完成',
  [LoadState.Failed]: '失败',
  [LoadState.Aborted]: '已中断'
};

/**
 * UI加载状态枚举
 */
export enum LoadingState {
  Stop = 'stop',
  Run = 'run',
  Error = 'error'
}

/**
 * 加载器事件类型
 */
export interface LoaderEvent {
  loader: LoaderBase;
  newState: LoadState;
  oldState: LoadState;
}

/**
 * 进度变化事件类型
 */
export interface ProgressEvent {
  newProgress: number;
  oldProgress: number;
}

/**
 * 加载器配置选项
 */
export interface LoaderOptions {
  name?: string;
  progressWeight?: number;
  block?: boolean;
  show?: boolean;
  reloadTimeout?: number;
  threadPriority?: ThreadPriority;
}

/**
 * 线程优先级枚举
 */
export enum ThreadPriority {
  Lowest = 'lowest',
  BelowNormal = 'below-normal',
  Normal = 'normal',
  AboveNormal = 'above-normal',
  Highest = 'highest'
}

/**
 * 加载器基类接口
 */
export interface ILoader {
  readonly uuid: string;
  readonly name: string;
  readonly state: LoadState;
  readonly progress: number;
  readonly progressWeight: number;
  readonly error: Error | null;
  readonly block: boolean;
  readonly show: boolean;
  readonly isForceRestarting: boolean;
  
  start(input?: any, isForceRestart?: boolean): void;
  abort(): void;
  waitForExit(input?: any, timeout?: number): Promise<void>;
}

/**
 * 任务加载器接口
 */
export interface ITaskLoader<TInput = any, TOutput = any> extends ILoader {
  input: TInput;
  output: TOutput;
  readonly isAborted: boolean;
}

/**
 * 组合加载器接口
 */
export interface IComboLoader<TInput = any> extends ILoader {
  input: TInput;
  readonly loaders: ILoader[];
}

/**
 * 加载器事件监听器类型
 */
export type LoaderEventListener = (event: LoaderEvent) => void;
export type ProgressEventListener = (event: ProgressEvent) => void;
export type PreviewFinishListener = (loader: LoaderBase) => void; 