import { NetworkError, NetworkErrorType } from './types';

/**
 * 网络超时错误
 */
export class NetworkTimeoutError extends Error implements NetworkError {
  public readonly type = NetworkErrorType.Timeout;
  public readonly url?: string;
  public readonly originalError?: Error;

  constructor(message: string, url?: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkTimeoutError';
    this.url = url;
    this.originalError = originalError;
  }
}

/**
 * 网络连接错误
 */
export class NetworkConnectionError extends Error implements NetworkError {
  public readonly type = NetworkErrorType.Connection;
  public readonly url?: string;
  public readonly originalError?: Error;

  constructor(message: string, url?: string, originalError?: Error) {
    super(message);
    this.name = 'NetworkConnectionError';
    this.url = url;
    this.originalError = originalError;
  }
}

/**
 * HTTP错误
 */
export class HttpError extends Error implements NetworkError {
  public readonly type = NetworkErrorType.Http;
  public readonly status: number;
  public readonly url?: string;
  public readonly originalError?: Error;

  constructor(message: string, status: number, url?: string, originalError?: Error) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.url = url;
    this.originalError = originalError;
  }
}

/**
 * 网络错误工厂
 */
export class NetworkErrorFactory {
  /**
   * 创建网络错误
   */
  static create(error: any, url?: string): NetworkError {
    if (error instanceof NetworkTimeoutError || 
        error instanceof NetworkConnectionError || 
        error instanceof HttpError) {
      return error;
    }

    // 检查是否为超时错误
    if (error.name === 'AbortError' || 
        error.message?.includes('timeout') || 
        error.message?.includes('Timeout')) {
      return new NetworkTimeoutError(
        `请求超时: ${error.message}`,
        url,
        error
      );
    }

    // 检查是否为HTTP错误
    if (error.status || error.statusCode) {
      return new HttpError(
        `HTTP错误 ${error.status || error.statusCode}: ${error.message}`,
        error.status || error.statusCode,
        url,
        error
      );
    }

    // 检查是否为连接错误
    if (error.code === 'ENOTFOUND' || 
        error.code === 'ECONNREFUSED' || 
        error.message?.includes('connect') ||
        error.message?.includes('network')) {
      return new NetworkConnectionError(
        `连接失败: ${error.message}`,
        url,
        error
      );
    }

    // 默认未知错误
    const networkError = new Error(error.message || '未知网络错误') as NetworkError;
    networkError.type = NetworkErrorType.Unknown;
    networkError.url = url;
    networkError.originalError = error;
    return networkError;
  }

  /**
   * 检查错误是否可重试
   */
  static isRetryable(error: NetworkError): boolean {
    switch (error.type) {
      case NetworkErrorType.Timeout:
        return true;
      case NetworkErrorType.Connection:
        return true;
      case NetworkErrorType.Http:
        // 5xx错误可以重试，4xx错误不重试（除了408和429）
        if (error.status) {
          return error.status >= 500 || error.status === 408 || error.status === 429;
        }
        return false;
      default:
        return false;
    }
  }
} 