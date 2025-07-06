/**
 * 网络请求方法枚举
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

/**
 * 网络请求配置选项
 */
export interface NetworkOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
  encoding?: string;
  useBrowserUserAgent?: boolean;
  accept?: string;
  contentType?: string;
}

/**
 * 网络响应接口
 */
export interface NetworkResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  url: string;
}

/**
 * 网络错误类型
 */
export enum NetworkErrorType {
  Timeout = 'timeout',
  Connection = 'connection',
  Http = 'http',
  Unknown = 'unknown'
}

/**
 * 网络错误接口
 */
export interface NetworkError extends Error {
  type: NetworkErrorType;
  status?: number;
  url?: string;
  originalError?: Error;
}

/**
 * 下载进度回调
 */
export type DownloadProgressCallback = (progress: number, downloaded: number, total: number) => void;

/**
 * 网络请求回调
 */
export type NetworkCallback<T = any> = (response: NetworkResponse<T>, error?: NetworkError) => void;

/**
 * 重试策略接口
 */
export interface RetryStrategy {
  shouldRetry(error: NetworkError, attempt: number): boolean;
  getDelay(attempt: number): number;
  getMaxAttempts(): number;
}

/**
 * 默认重试策略
 */
export interface DefaultRetryStrategy extends RetryStrategy {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

/**
 * 网络客户端接口
 */
export interface INetworkClient {
  get<T = any>(url: string, options?: NetworkOptions): Promise<NetworkResponse<T>>;
  post<T = any>(url: string, data?: any, options?: NetworkOptions): Promise<NetworkResponse<T>>;
  put<T = any>(url: string, data?: any, options?: NetworkOptions): Promise<NetworkResponse<T>>;
  delete<T = any>(url: string, options?: NetworkOptions): Promise<NetworkResponse<T>>;
  download(url: string, localPath: string, progressCallback?: DownloadProgressCallback): Promise<void>;
  ping(host: string, timeout?: number): Promise<number>;
}

/**
 * 网络文件信息
 */
export interface NetFile {
  urls: string[];
  localPath: string;
  check?: FileChecker;
  useBrowserUserAgent?: boolean;
}

/**
 * 文件检查器接口
 */
export interface FileChecker {
  isJson?: boolean;
  validateFile?(path: string): Promise<boolean>;
  getExpectedSize?(): number;
  getExpectedHash?(): string;
}

/**
 * 网络请求统计
 */
export interface NetworkStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  lastRequestTime?: Date;
} 