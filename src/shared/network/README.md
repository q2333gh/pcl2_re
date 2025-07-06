# PCL2 网络模块

基于TDD重构的PCL2网络模块，提供统一的网络请求封装、错误处理、重试机制和文件下载功能。

## 特性

- **统一的网络客户端**: 支持GET、POST、PUT、DELETE等HTTP方法
- **智能重试机制**: 支持多种重试策略（指数退避、固定延迟、不重试）
- **完善的错误处理**: 区分超时、连接、HTTP等不同类型的错误
- **灵活的配置**: 支持自定义请求头、超时时间、编码等
- **文件下载**: 支持带进度回调的文件下载
- **Ping测试**: 支持网络连通性测试
- **多线程请求**: 支持并发请求以提高成功率

## 快速开始

### 基础使用

```typescript
import { NetworkClient } from './network';

const client = new NetworkClient();

// GET请求
const response = await client.get('https://api.example.com/data');
console.log(response.data);

// POST请求
const result = await client.post('https://api.example.com/submit', {
  name: 'test',
  value: 123
});
```

### 自定义配置

```typescript
const client = new NetworkClient({
  timeout: 30000,
  retryCount: 3,
  headers: {
    'Authorization': 'Bearer token'
  },
  useBrowserUserAgent: true
});
```

## API 参考

### NetworkClient

#### 构造函数

```typescript
new NetworkClient(options?: NetworkOptions)
```

#### 方法

##### get<T>(url: string, options?: NetworkOptions): Promise<NetworkResponse<T>>

执行GET请求。

```typescript
const response = await client.get('https://api.example.com/users');
```

##### post<T>(url: string, data?: any, options?: NetworkOptions): Promise<NetworkResponse<T>>

执行POST请求。

```typescript
const response = await client.post('https://api.example.com/users', {
  name: 'John',
  email: 'john@example.com'
});
```

##### put<T>(url: string, data?: any, options?: NetworkOptions): Promise<NetworkResponse<T>>

执行PUT请求。

##### delete<T>(url: string, options?: NetworkOptions): Promise<NetworkResponse<T>>

执行DELETE请求。

##### download(url: string, localPath: string, progressCallback?: DownloadProgressCallback): Promise<void>

下载文件。

```typescript
await client.download(
  'https://example.com/file.zip',
  '/tmp/file.zip',
  (progress, downloaded, total) => {
    console.log(`下载进度: ${progress * 100}%`);
  }
);
```

##### ping(host: string, timeout?: number): Promise<number>

测试网络连通性，返回延迟时间（毫秒），失败返回-1。

```typescript
const delay = await client.ping('google.com');
if (delay > 0) {
  console.log(`延迟: ${delay}ms`);
} else {
  console.log('连接失败');
}
```

### 重试策略

#### 默认重试策略

```typescript
import { RetryStrategyFactory } from './network';

const strategy = RetryStrategyFactory.createDefault();
client.setRetryStrategy(strategy);
```

#### 指数退避重试策略

```typescript
const strategy = RetryStrategyFactory.createExponentialBackoff(3, 1000, 10000);
client.setRetryStrategy(strategy);
```

#### 固定延迟重试策略

```typescript
const strategy = RetryStrategyFactory.createFixedDelay(3, 2000);
client.setRetryStrategy(strategy);
```

#### 不重试策略

```typescript
const strategy = RetryStrategyFactory.createNoRetry();
client.setRetryStrategy(strategy);
```

### 错误处理

网络模块提供了完善的错误处理机制：

```typescript
import { NetworkErrorType, NetworkTimeoutError, NetworkConnectionError, HttpError } from './network';

try {
  const response = await client.get('https://api.example.com/data');
} catch (error) {
  if (error instanceof NetworkTimeoutError) {
    console.log('请求超时');
  } else if (error instanceof NetworkConnectionError) {
    console.log('连接失败');
  } else if (error instanceof HttpError) {
    console.log(`HTTP错误: ${error.status}`);
  }
}
```

## 配置选项

### NetworkOptions

```typescript
interface NetworkOptions {
  timeout?: number;           // 超时时间（毫秒）
  retryCount?: number;        // 重试次数
  retryDelay?: number;        // 重试延迟（毫秒）
  headers?: Record<string, string>;  // 自定义请求头
  encoding?: string;          // 编码格式
  useBrowserUserAgent?: boolean;     // 是否使用浏览器User-Agent
  accept?: string;            // Accept头
  contentType?: string;       // Content-Type头
}
```

## 与原始PCL2的对比

### 原始PCL2 ModNet

- 使用VB.NET实现
- 基于WebClient和WebRequest
- 固定的重试逻辑
- 简单的错误处理

### 重构后的网络模块

- 使用TypeScript实现，类型安全
- 基于现代fetch API
- 灵活的重试策略
- 完善的错误分类和处理
- 更好的可测试性和可维护性

## 迁移指南

### 从原始PCL2迁移

1. **替换网络请求方法**:
   ```vb
   ' 原始PCL2
   Dim result = NetGetCodeByClient(url, Encoding.UTF8)
   ```
   ```typescript
   // 重构后
   const response = await client.get(url);
   const result = response.data;
   ```

2. **替换文件下载**:
   ```vb
   ' 原始PCL2
   NetDownloadByLoader(url, localPath)
   ```
   ```typescript
   // 重构后
   await client.download(url, localPath);
   ```

3. **替换Ping测试**:
   ```vb
   ' 原始PCL2
   Dim delay = Ping(host, 10000)
   ```
   ```typescript
   // 重构后
   const delay = await client.ping(host, 10000);
   ```

## 测试

运行网络模块的测试：

```bash
yarn test src/shared/network/__tests__/
```

## 注意事项

1. **环境限制**: 在Node.js环境中，某些功能（如ping、文件下载）使用模拟实现
2. **浏览器兼容性**: 在浏览器环境中，需要确保支持fetch API
3. **错误处理**: 建议总是使用try-catch包装网络请求
4. **重试策略**: 根据实际需求选择合适的重试策略，避免过度重试 