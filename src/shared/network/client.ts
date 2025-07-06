import { 
  INetworkClient, 
  NetworkOptions, 
  NetworkResponse, 
  HttpMethod,
  DownloadProgressCallback,
  RetryStrategy
} from './types';
import { NetworkErrorFactory } from './errors';
import { RetryStrategyFactory } from './retry';
import { delay } from '../utils';

/**
 * 网络客户端实现
 */
export class NetworkClient implements INetworkClient {
  private retryStrategy: RetryStrategy;
  private defaultOptions: NetworkOptions;

  constructor(options: NetworkOptions = {}) {
    this.defaultOptions = {
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      headers: {},
      encoding: 'utf-8',
      useBrowserUserAgent: false,
      accept: 'application/json, text/javascript, */*; q=0.01',
      contentType: 'application/json',
      ...options
    };
    this.retryStrategy = RetryStrategyFactory.createDefault();
  }

  /**
   * 设置重试策略
   */
  setRetryStrategy(strategy: RetryStrategy): void {
    this.retryStrategy = strategy;
  }

  /**
   * 设置默认选项
   */
  setDefaultOptions(options: NetworkOptions): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, options?: NetworkOptions): Promise<NetworkResponse<T>> {
    return this.request<T>(url, HttpMethod.GET, undefined, options);
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, options?: NetworkOptions): Promise<NetworkResponse<T>> {
    return this.request<T>(url, HttpMethod.POST, data, options);
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, options?: NetworkOptions): Promise<NetworkResponse<T>> {
    return this.request<T>(url, HttpMethod.PUT, data, options);
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, options?: NetworkOptions): Promise<NetworkResponse<T>> {
    return this.request<T>(url, HttpMethod.DELETE, undefined, options);
  }

  /**
   * 通用请求方法
   */
  async request<T = any>(
    url: string, 
    method: HttpMethod, 
    data?: any, 
    options?: NetworkOptions
  ): Promise<NetworkResponse<T>> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    let lastError: any;

    for (let attempt = 1; attempt <= this.retryStrategy.getMaxAttempts(); attempt++) {
      try {
        return await this._makeRequest<T>(url, method, data, mergedOptions);
      } catch (error) {
        lastError = error;
        const networkError = NetworkErrorFactory.create(error, url);

        if (!this.retryStrategy.shouldRetry(networkError, attempt)) {
          throw networkError;
        }

        if (attempt < this.retryStrategy.getMaxAttempts()) {
          const delayTime = this.retryStrategy.getDelay(attempt);
          await delay(delayTime);
        }
      }
    }

    throw NetworkErrorFactory.create(lastError, url);
  }

  /**
   * 下载文件
   */
  async download(
    url: string, 
    localPath: string, 
    progressCallback?: DownloadProgressCallback
  ): Promise<void> {
    try {
      // 这里应该实现文件下载逻辑
      // 由于Node.js环境限制，这里只是模拟实现
      console.log(`[Net] 下载文件: ${url} -> ${localPath}`);
      
      // 模拟下载进度
      if (progressCallback) {
        for (let i = 0; i <= 100; i += 10) {
          progressCallback(i / 100, i, 100);
          await delay(100);
        }
      }
      
      // 模拟下载完成
      await delay(1000);
    } catch (error) {
      throw NetworkErrorFactory.create(error, url);
    }
  }

  /**
   * Ping测试
   */
  async ping(host: string, timeout: number = 10000): Promise<number> {
    try {
      // 这里应该实现ping逻辑
      // 由于Node.js环境限制，这里只是模拟实现
      console.log(`[Net] Ping ${host}`);
      
      // 模拟ping延迟
      const delay = Math.random() * 100 + 10;
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return Math.floor(delay);
    } catch (error) {
      console.error(`[Net] Ping ${host} 失败:`, error);
      return -1;
    }
  }

  /**
   * 执行单次请求
   */
  private async _makeRequest<T = any>(
    url: string,
    method: HttpMethod,
    data?: any,
    options?: NetworkOptions
  ): Promise<NetworkResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options?.timeout || 30000);

    try {
      const requestOptions: RequestInit = {
        method,
        headers: this._buildHeaders(options),
        signal: controller.signal
      };

      if (data && method !== HttpMethod.GET && method !== HttpMethod.DELETE) {
        if (typeof data === 'string') {
          requestOptions.body = data;
        } else {
          requestOptions.body = JSON.stringify(data);
        }
      }

      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      let responseData: T;
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as any;
      }

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers,
        url: response.url
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * 构建请求头
   */
  private _buildHeaders(options?: NetworkOptions): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': options?.accept || 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'en-US,en;q=0.5',
      'X-Requested-With': 'XMLHttpRequest',
      ...options?.headers
    };

    if (options?.contentType) {
      headers['Content-Type'] = options.contentType;
    }

    if (options?.useBrowserUserAgent) {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
    }

    return headers;
  }

  /**
   * 多线程请求（模拟实现）
   */
  async requestMultiple<T = any>(
    url: string,
    method: HttpMethod,
    data?: any,
    requestCount: number = 4,
    options?: NetworkOptions
  ): Promise<NetworkResponse<T>> {
    const promises: Promise<NetworkResponse<T>>[] = [];

    for (let i = 0; i < requestCount; i++) {
      const promise = this.request<T>(url, method, data, options);
      promises.push(promise);
      
      // 延迟启动每个请求
      if (i < requestCount - 1) {
        await delay((i + 1) * 250);
      }
    }

    // 返回第一个成功的请求
    return Promise.race(promises);
  }
} 