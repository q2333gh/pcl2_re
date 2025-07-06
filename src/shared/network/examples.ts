import { 
  NetworkClient, 
  RetryStrategyFactory, 
  NetworkTimeoutError, 
  NetworkConnectionError, 
  HttpError 
} from './index';

/**
 * 网络模块使用示例
 */
export class NetworkExamples {
  private client: NetworkClient;

  constructor() {
    this.client = new NetworkClient({
      timeout: 30000,
      retryCount: 3,
      headers: {
        'User-Agent': 'PCL2-Network-Client/1.0'
      }
    });
  }

  /**
   * 基础GET请求示例
   */
  async basicGetExample(): Promise<void> {
    try {
      console.log('=== 基础GET请求示例 ===');
      
      const response = await this.client.get('https://jsonplaceholder.typicode.com/posts/1');
      console.log('响应数据:', response.data);
      console.log('状态码:', response.status);
      console.log('响应头:', response.headers);
    } catch (error) {
      console.error('GET请求失败:', error);
    }
  }

  /**
   * POST请求示例
   */
  async postExample(): Promise<void> {
    try {
      console.log('=== POST请求示例 ===');
      
      const postData = {
        title: '测试标题',
        body: '测试内容',
        userId: 1
      };

      const response = await this.client.post(
        'https://jsonplaceholder.typicode.com/posts',
        postData,
        {
          contentType: 'application/json'
        }
      );

      console.log('创建成功:', response.data);
    } catch (error) {
      console.error('POST请求失败:', error);
    }
  }

  /**
   * 自定义重试策略示例
   */
  async retryStrategyExample(): Promise<void> {
    console.log('=== 重试策略示例 ===');

    // 使用指数退避重试策略
    const exponentialStrategy = RetryStrategyFactory.createExponentialBackoff(5, 1000, 10000);
    this.client.setRetryStrategy(exponentialStrategy);

    try {
      const response = await this.client.get('https://httpstat.us/500');
      console.log('请求成功:', response.data);
    } catch (error) {
      console.log('请求失败，已重试5次:', error.message);
    }

    // 恢复默认重试策略
    this.client.setRetryStrategy(RetryStrategyFactory.createDefault());
  }

  /**
   * 错误处理示例
   */
  async errorHandlingExample(): Promise<void> {
    console.log('=== 错误处理示例 ===');

    const testUrls = [
      'https://httpstat.us/404',  // HTTP错误
      'https://invalid-domain-12345.com',  // 连接错误
      'https://httpstat.us/200?sleep=5000'  // 超时错误
    ];

    for (const url of testUrls) {
      try {
        console.log(`测试URL: ${url}`);
        const response = await this.client.get(url, { timeout: 2000 });
        console.log('请求成功:', response.status);
      } catch (error) {
        if (error instanceof HttpError) {
          console.log(`HTTP错误 ${error.status}: ${error.message}`);
        } else if (error instanceof NetworkConnectionError) {
          console.log(`连接错误: ${error.message}`);
        } else if (error instanceof NetworkTimeoutError) {
          console.log(`超时错误: ${error.message}`);
        } else {
          console.log(`未知错误: ${error.message}`);
        }
      }
    }
  }

  /**
   * 文件下载示例
   */
  async downloadExample(): Promise<void> {
    console.log('=== 文件下载示例 ===');

    try {
      await this.client.download(
        'https://httpbin.org/bytes/1024',
        '/tmp/test-download.bin',
        (progress, downloaded, total) => {
          console.log(`下载进度: ${(progress * 100).toFixed(1)}% (${downloaded}/${total})`);
        }
      );
      console.log('文件下载完成');
    } catch (error) {
      console.error('文件下载失败:', error);
    }
  }

  /**
   * Ping测试示例
   */
  async pingExample(): Promise<void> {
    console.log('=== Ping测试示例 ===');

    const hosts = ['google.com', 'github.com', 'invalid-host-test.com'];

    for (const host of hosts) {
      const delay = await this.client.ping(host, 5000);
      if (delay > 0) {
        console.log(`${host}: ${delay}ms`);
      } else {
        console.log(`${host}: 连接失败`);
      }
    }
  }

  /**
   * 多线程请求示例
   */
  async multipleRequestExample(): Promise<void> {
    console.log('=== 多线程请求示例 ===');

    try {
      const response = await this.client.requestMultiple(
        'https://jsonplaceholder.typicode.com/posts/1',
        'GET',
        undefined,
        3
      );
      console.log('多线程请求成功:', response.data);
    } catch (error) {
      console.error('多线程请求失败:', error);
    }
  }

  /**
   * 自定义请求头示例
   */
  async customHeadersExample(): Promise<void> {
    console.log('=== 自定义请求头示例 ===');

    try {
      const response = await this.client.get(
        'https://httpbin.org/headers',
        {
          headers: {
            'X-Custom-Header': 'PCL2-Test',
            'Authorization': 'Bearer test-token',
            'Accept-Language': 'zh-CN,zh;q=0.9'
          }
        }
      );
      console.log('请求头信息:', response.data);
    } catch (error) {
      console.error('自定义请求头失败:', error);
    }
  }

  /**
   * 浏览器User-Agent示例
   */
  async browserUserAgentExample(): Promise<void> {
    console.log('=== 浏览器User-Agent示例 ===');

    try {
      const response = await this.client.get(
        'https://httpbin.org/user-agent',
        {
          useBrowserUserAgent: true
        }
      );
      console.log('User-Agent:', response.data);
    } catch (error) {
      console.error('浏览器User-Agent失败:', error);
    }
  }

  /**
   * 运行所有示例
   */
  async runAllExamples(): Promise<void> {
    console.log('开始运行网络模块示例...\n');

    await this.basicGetExample();
    console.log();

    await this.postExample();
    console.log();

    await this.retryStrategyExample();
    console.log();

    await this.errorHandlingExample();
    console.log();

    await this.downloadExample();
    console.log();

    await this.pingExample();
    console.log();

    await this.multipleRequestExample();
    console.log();

    await this.customHeadersExample();
    console.log();

    await this.browserUserAgentExample();
    console.log();

    console.log('所有示例运行完成！');
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  const examples = new NetworkExamples();
  examples.runAllExamples().catch(console.error);
} 