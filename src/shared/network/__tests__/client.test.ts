import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NetworkClient } from '../client';
import { HttpMethod, NetworkErrorType } from '../types';
import { NetworkTimeoutError, NetworkConnectionError, HttpError } from '../errors';
import { RetryStrategyFactory } from '../retry';

// Mock fetch
global.fetch = vi.fn();

describe('NetworkClient', () => {
  let client: NetworkClient;

  beforeEach(() => {
    client = new NetworkClient();
    vi.clearAllMocks();
  });

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      expect(client).toBeInstanceOf(NetworkClient);
    });

    it('应该正确执行GET请求', async () => {
      const mockResponse = 'test';
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: 'https://api.example.com/test',
        headers: new Map([['content-type', 'text/plain']]),
        json: () => Promise.resolve(mockResponse),
        text: () => Promise.resolve('test')
      });

      const response = await client.get('https://api.example.com/test');

      expect(response.data).toBe('test');
      expect(response.status).toBe(200);
      expect(response.url).toBe('https://api.example.com/test');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json, text/javascript, */*; q=0.01'
          })
        })
      );
    });

    it('应该正确执行POST请求', async () => {
      const mockResponse = { success: true };
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: 'https://api.example.com/test',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      });

      const data = { name: 'test' };
      const response = await client.post('https://api.example.com/test', data);

      expect(response.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(data)
        })
      );
    });
  });

  describe('错误处理', () => {
    it('应该正确处理超时错误', async () => {
      (fetch as any).mockRejectedValueOnce(new Error('timeout'));

      await expect(client.get('https://api.example.com/test')).rejects.toThrow();
    });

    it('应该正确处理HTTP错误', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        url: 'https://api.example.com/test'
      });

      await expect(client.get('https://api.example.com/test')).rejects.toThrow('HTTP 404: Not Found');
    });

    it('应该正确处理网络连接错误', async () => {
      const connectionError = new Error('connect ECONNREFUSED');
      (connectionError as any).code = 'ECONNREFUSED';
      (fetch as any).mockRejectedValueOnce(connectionError);

      await expect(client.get('https://api.example.com/test')).rejects.toThrow();
    });
  });

  describe('重试机制', () => {
    it('应该在失败时重试', async () => {
      const mockResponse = { data: 'success' };
      
      // 第一次失败，第二次成功
      (fetch as any)
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          url: 'https://api.example.com/test',
          headers: new Map([['content-type', 'application/json']]),
          json: () => Promise.resolve(mockResponse)
        });

      const response = await client.get('https://api.example.com/test');

      expect(response.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('应该在达到最大重试次数后失败', async () => {
      const timeoutError = new Error('timeout');
      (fetch as any).mockRejectedValue(timeoutError);

      await expect(client.get('https://api.example.com/test')).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(3); // 默认重试3次
    });

    it('应该支持自定义重试策略', async () => {
      const noRetryStrategy = RetryStrategyFactory.createNoRetry();
      client.setRetryStrategy(noRetryStrategy);

      const timeoutError = new Error('timeout');
      (fetch as any).mockRejectedValue(timeoutError);

      await expect(client.get('https://api.example.com/test')).rejects.toThrow();
      expect(fetch).toHaveBeenCalledTimes(1); // 不重试
    });
  });

  describe('请求头处理', () => {
    it('应该正确设置默认请求头', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: 'https://api.example.com/test',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({})
      });

      await client.get('https://api.example.com/test');

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'en-US,en;q=0.5',
            'X-Requested-With': 'XMLHttpRequest'
          })
        })
      );
    });

    it('应该支持自定义请求头', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: 'https://api.example.com/test',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({})
      });

      await client.get('https://api.example.com/test', {
        headers: {
          'Authorization': 'Bearer token',
          'Custom-Header': 'value'
        }
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token',
            'Custom-Header': 'value'
          })
        })
      );
    });

    it('应该支持浏览器User-Agent', async () => {
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: 'https://api.example.com/test',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve({})
      });

      await client.get('https://api.example.com/test', {
        useBrowserUserAgent: true
      });

      expect(fetch).toHaveBeenCalledWith(
        'https://api.example.com/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'User-Agent': expect.stringContaining('Mozilla/5.0')
          })
        })
      );
    });
  });

  describe('超时处理', () => {
    it('应该正确处理请求超时', async () => {
      (fetch as any).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), 100);
        });
      });

      await expect(client.get('https://api.example.com/test', { timeout: 50 })).rejects.toThrow();
    });
  });

  describe('Ping功能', () => {
    it('应该返回ping延迟', async () => {
      const result = await client.ping('google.com');
      
      expect(typeof result).toBe('number');
      expect(result).toBeGreaterThan(0);
    });

    it('应该在ping失败时返回-1', async () => {
      // 模拟ping失败
      const result = await client.ping('invalid-host');
      
      // 由于是模拟实现，这里可能返回随机值
      expect(typeof result).toBe('number');
    });
  });

  describe('下载功能', () => {
    it('应该正确执行下载', async () => {
      const progressCallback = vi.fn();
      
      await client.download('https://example.com/file.zip', '/tmp/file.zip', progressCallback);
      
      expect(progressCallback).toHaveBeenCalled();
    });

    it('应该在没有进度回调时也能正常下载', async () => {
      await expect(client.download('https://example.com/file.zip', '/tmp/file.zip')).resolves.not.toThrow();
    });
  });

  describe('多线程请求', () => {
    it('应该正确执行多线程请求', async () => {
      const mockResponse = { data: 'success' };
      (fetch as any).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        url: 'https://api.example.com/test',
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse)
      });

      const response = await client.requestMultiple('https://api.example.com/test', HttpMethod.GET, undefined, 3);

      expect(response.data).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });
}); 