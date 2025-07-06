import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoaderBase } from '../base';
import { LoadState, LoadingState } from '../types';

// 创建一个测试用的具体加载器类
class TestLoader extends LoaderBase {
  start(input?: any, isForceRestart?: boolean): void {
    this.state = LoadState.Loading;
    // 模拟异步操作
    setTimeout(() => {
      if (this.state === LoadState.Loading) {
        this.state = LoadState.Finished;
      }
    }, 100);
  }

  abort(): void {
    this.state = LoadState.Aborted;
  }
}

describe('LoaderBase', () => {
  let loader: TestLoader;

  beforeEach(() => {
    loader = new TestLoader({ name: 'Test Loader' });
  });

  describe('基础属性', () => {
    it('应该正确初始化基础属性', () => {
      expect(loader.uuid).toBeDefined();
      expect(loader.name).toBe('Test Loader');
      expect(loader.state).toBe(LoadState.Waiting);
      expect(loader.loadingState).toBe(LoadingState.Stop);
      expect(loader.progress).toBe(0);
      expect(loader.progressWeight).toBe(1);
      expect(loader.block).toBe(true);
      expect(loader.show).toBe(true);
      expect(loader.error).toBeNull();
    });

    it('应该支持自定义选项', () => {
      const customLoader = new TestLoader({
        name: 'Custom Loader',
        progressWeight: 2,
        block: false,
        show: false
      });

      expect(customLoader.name).toBe('Custom Loader');
      expect(customLoader.progressWeight).toBe(2);
      expect(customLoader.block).toBe(false);
      expect(customLoader.show).toBe(false);
    });
  });

  describe('状态管理', () => {
    it('应该正确更新状态', () => {
      const stateChangeSpy = vi.fn();
      loader.onStateChange(stateChangeSpy);

      loader.state = LoadState.Loading;
      expect(loader.state).toBe(LoadState.Loading);
      expect(stateChangeSpy).toHaveBeenCalledWith({
        loader,
        newState: LoadState.Loading,
        oldState: LoadState.Waiting
      });
    });

    it('应该正确更新UI状态', () => {
      loader.state = LoadState.Loading;
      expect(loader.loadingState).toBe(LoadingState.Run);

      loader.state = LoadState.Failed;
      expect(loader.loadingState).toBe(LoadingState.Error);

      loader.state = LoadState.Finished;
      expect(loader.loadingState).toBe(LoadingState.Stop);
    });

    it('应该正确计算进度', () => {
      expect(loader.progress).toBe(0); // Waiting状态

      loader.state = LoadState.Loading;
      expect(loader.progress).toBe(0.02); // 默认进度

      loader.progress = 0.5;
      expect(loader.progress).toBe(0.5);

      loader.state = LoadState.Finished;
      expect(loader.progress).toBe(1); // 完成状态
    });
  });

  describe('事件系统', () => {
    it('应该正确触发状态变化事件', () => {
      const listener = vi.fn();
      loader.onStateChange(listener);

      loader.state = LoadState.Loading;
      expect(listener).toHaveBeenCalledWith({
        loader,
        newState: LoadState.Loading,
        oldState: LoadState.Waiting
      });
    });

    it('应该正确触发进度变化事件', () => {
      const listener = vi.fn();
      loader.onProgressChange(listener);

      loader.progress = 0.5;
      expect(listener).toHaveBeenCalledWith({
        newProgress: 0.5,
        oldProgress: -1
      });
    });

    it('应该正确触发预览完成事件', () => {
      const listener = vi.fn();
      loader.onPreviewFinish(listener);

      loader.raisePreviewFinish();
      expect(listener).toHaveBeenCalledWith(loader);
    });

    it('应该正确移除事件监听器', () => {
      const listener = vi.fn();
      loader.onStateChange(listener);
      loader.offStateChange(listener);

      loader.state = LoadState.Loading;
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('父加载器管理', () => {
    it('应该正确设置父加载器', () => {
      const parent = new TestLoader({ name: 'Parent' });
      loader.initParent(parent);

      expect(loader.parent).toBe(parent);
    });

    it('应该正确获取最上级父加载器', () => {
      const grandParent = new TestLoader({ name: 'GrandParent' });
      const parent = new TestLoader({ name: 'Parent' });
      
      parent.initParent(grandParent);
      loader.initParent(parent);

      expect(loader.realParent).toBe(grandParent);
    });
  });

  describe('等待完成', () => {
    it('应该正确等待完成', async () => {
      const promise = loader.waitForExit();
      
      // 启动加载器
      loader.start();
      
      await promise;
      expect(loader.state).toBe(LoadState.Finished);
    });

    it('应该在超时时抛出错误', async () => {
      const promise = loader.waitForExit(undefined, 50);
      
      // 不启动加载器，让它超时
      await expect(promise).rejects.toThrow('等待加载器执行超时。');
    });

    it('应该在中断时抛出错误', async () => {
      const promise = loader.waitForExit();
      
      loader.start();
      loader.abort();
      
      await expect(promise).rejects.toThrow('加载器执行已中断。');
    });
  });

  describe('工具方法', () => {
    it('应该正确比较加载器', () => {
      const other = new TestLoader({ name: 'Other' });
      expect(loader.equals(loader)).toBe(true);
      expect(loader.equals(other)).toBe(false);
    });

    it('应该正确转换为字符串', () => {
      expect(loader.toString()).toContain('Test Loader');
      expect(loader.toString()).toContain('waiting');
    });
  });
}); 