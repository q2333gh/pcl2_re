import { RetryStrategy, DefaultRetryStrategy, NetworkError } from './types';
import { NetworkErrorFactory } from './errors';

/**
 * 默认重试策略实现
 */
export class DefaultRetryStrategyImpl implements DefaultRetryStrategy {
  public maxAttempts: number;
  public baseDelay: number;
  public maxDelay: number;
  public backoffMultiplier: number;

  constructor(options: Partial<DefaultRetryStrategy> = {}) {
    this.maxAttempts = options.maxAttempts ?? 3;
    this.baseDelay = options.baseDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 10000;
    this.backoffMultiplier = options.backoffMultiplier ?? 2;
  }

  shouldRetry(error: NetworkError, attempt: number): boolean {
    if (attempt >= this.maxAttempts) {
      return false;
    }

    return NetworkErrorFactory.isRetryable(error);
  }

  getDelay(attempt: number): number {
    const delay = this.baseDelay * Math.pow(this.backoffMultiplier, attempt - 1);
    return Math.min(delay, this.maxDelay);
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}

/**
 * 指数退避重试策略
 */
export class ExponentialBackoffStrategy implements RetryStrategy {
  private maxAttempts: number;
  private baseDelay: number;
  private maxDelay: number;

  constructor(maxAttempts: number = 3, baseDelay: number = 1000, maxDelay: number = 10000) {
    this.maxAttempts = maxAttempts;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  shouldRetry(error: NetworkError, attempt: number): boolean {
    if (attempt >= this.maxAttempts) {
      return false;
    }

    return NetworkErrorFactory.isRetryable(error);
  }

  getDelay(attempt: number): number {
    const delay = this.baseDelay * Math.pow(2, attempt - 1);
    return Math.min(delay, this.maxDelay);
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}

/**
 * 固定延迟重试策略
 */
export class FixedDelayStrategy implements RetryStrategy {
  private maxAttempts: number;
  private delay: number;

  constructor(maxAttempts: number = 3, delay: number = 1000) {
    this.maxAttempts = maxAttempts;
    this.delay = delay;
  }

  shouldRetry(error: NetworkError, attempt: number): boolean {
    if (attempt >= this.maxAttempts) {
      return false;
    }

    return NetworkErrorFactory.isRetryable(error);
  }

  getDelay(attempt: number): number {
    return this.delay;
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}

/**
 * 重试策略工厂
 */
export class RetryStrategyFactory {
  /**
   * 创建默认重试策略
   */
  static createDefault(): RetryStrategy {
    return new DefaultRetryStrategyImpl();
  }

  /**
   * 创建指数退避重试策略
   */
  static createExponentialBackoff(maxAttempts?: number, baseDelay?: number, maxDelay?: number): RetryStrategy {
    return new ExponentialBackoffStrategy(maxAttempts, baseDelay, maxDelay);
  }

  /**
   * 创建固定延迟重试策略
   */
  static createFixedDelay(maxAttempts?: number, delay?: number): RetryStrategy {
    return new FixedDelayStrategy(maxAttempts, delay);
  }

  /**
   * 创建不重试策略
   */
  static createNoRetry(): RetryStrategy {
    return {
      shouldRetry: () => false,
      getDelay: () => 0,
      getMaxAttempts: () => 1
    };
  }
} 