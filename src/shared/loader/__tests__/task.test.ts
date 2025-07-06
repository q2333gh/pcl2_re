import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoaderTask } from '../task';
import { LoadState } from '../types';

describe('LoaderTask', () => {
  let task: LoaderTask<string, number>;

  beforeEach(() => {
    task = new LoaderTask('Test Task', (task) => {
      // 模拟异步操作
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          task.output = task.input?.length || 0;
          resolve();
        }, 100);
      });
    });
  });

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      expect(task.name).toBe('Test Task');
      expect(task.state).toBe(LoadState.Waiting);
      expect(task.input).toBeNull();
      expect(task.output).toBeNull();
      expect(task.isAborted).toBe(false);
    });

    it('应该正确执行任务', async () => {
      const promise = task.waitForExit('hello');
      
      expect(task.state).toBe(LoadState.Loading);
      expect(task.input).toBe('hello');
      
      await promise;
      
      expect(task.state).toBe(LoadState.Finished);
      expect(task.output).toBe(5);
    });

    it('应该正确处理输入委托', async () => {
      const inputDelegate = vi.fn(() => 'test');
      const taskWithDelegate = new LoaderTask('Delegate Task', (task) => {
        task.output = task.input?.length || 0;
      }, { inputDelegate });

      await taskWithDelegate.waitForExit();
      
      expect(inputDelegate).toHaveBeenCalled();
      expect(taskWithDelegate.output).toBe(4);
    });
  });

  describe('中断功能', () => {
    it('应该正确中断任务', async () => {
      const longTask = new LoaderTask('Long Task', (task) => {
        return new Promise<void>((resolve) => {
          setTimeout(resolve, 1000);
        });
      });

      const promise = longTask.waitForExit();
      
      // 立即中断
      longTask.abort();
      
      await expect(promise).rejects.toThrow('加载器执行已中断。');
      expect(longTask.state).toBe(LoadState.Aborted);
      expect(longTask.isAborted).toBe(true);
    });

    it('应该在任务执行过程中检查中断状态', async () => {
      let checkCount = 0;
      const interruptibleTask = new LoaderTask('Interruptible Task', (task) => {
        return new Promise<void>((resolve, reject) => {
          const interval = setInterval(() => {
            checkCount++;
            if (task.isAborted) {
              clearInterval(interval);
              reject(new Error('任务已被中断'));
            }
          }, 10);
          
          setTimeout(() => {
            clearInterval(interval);
            resolve();
          }, 200);
        });
      });

      const promise = interruptibleTask.waitForExit();
      
      // 延迟中断
      setTimeout(() => interruptibleTask.abort(), 50);
      
      await expect(promise).rejects.toThrow('加载器执行已中断。');
      expect(checkCount).toBeGreaterThan(0);
    });
  });

  describe('重载超时', () => {
    it('应该正确处理重载超时', async () => {
      const taskWithTimeout = new LoaderTask('Timeout Task', (task) => {
        task.output = task.input?.length || 0;
      }, { reloadTimeout: 1000 });

      // 第一次执行
      await taskWithTimeout.waitForExit('hello');
      expect(taskWithTimeout.output).toBe(5);

      // 立即再次执行相同输入，应该使用缓存
      const startTime = Date.now();
      await taskWithTimeout.waitForExit('hello');
      const endTime = Date.now();
      
      // 应该很快完成，因为使用了缓存
      expect(endTime - startTime).toBeLessThan(100);
    });

    it('应该在超时后重新执行', async () => {
      const taskWithTimeout = new LoaderTask('Timeout Task', (task) => {
        task.output = task.input?.length || 0;
      }, { reloadTimeout: 50 });

      // 第一次执行
      await taskWithTimeout.waitForExit('hello');
      expect(taskWithTimeout.output).toBe(5);

      // 等待超时
      await new Promise(resolve => setTimeout(resolve, 60));

      // 再次执行，应该重新计算
      await taskWithTimeout.waitForExit('hello');
      expect(taskWithTimeout.output).toBe(5);
    });
  });

  describe('强制重启', () => {
    it('应该支持强制重启', async () => {
      let executionCount = 0;
      const countingTask = new LoaderTask('Counting Task', (task) => {
        executionCount++;
        task.output = executionCount;
      });

      // 第一次执行
      await countingTask.waitForExit('test');
      expect(executionCount).toBe(1);

      // 强制重启
      await countingTask.waitForExit('test', true);
      expect(executionCount).toBe(2);
    });
  });

  describe('错误处理', () => {
    it('应该正确处理执行错误', async () => {
      const errorTask = new LoaderTask('Error Task', (task) => {
        throw new Error('测试错误');
      });

      const promise = errorTask.waitForExit('test');
      
      await expect(promise).rejects.toThrow('测试错误');
      expect(errorTask.state).toBe(LoadState.Failed);
      expect(errorTask.error?.message).toBe('测试错误');
    });

    it('应该正确处理异步错误', async () => {
      const asyncErrorTask = new LoaderTask('Async Error Task', (task) => {
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => reject(new Error('异步错误')), 50);
        });
      });

      const promise = asyncErrorTask.waitForExit('test');
      
      await expect(promise).rejects.toThrow('异步错误');
      expect(asyncErrorTask.state).toBe(LoadState.Failed);
    });
  });

  describe('进度更新', () => {
    it('应该正确更新进度', async () => {
      const progressTask = new LoaderTask('Progress Task', (task) => {
        return new Promise<void>((resolve) => {
          task.progress = 0.25;
          setTimeout(() => {
            task.progress = 0.5;
            setTimeout(() => {
              task.progress = 0.75;
              setTimeout(() => {
                task.progress = 1;
                resolve();
              }, 10);
            }, 10);
          }, 10);
        });
      });

      const progressSpy = vi.fn();
      progressTask.onProgressChange(progressSpy);

      await progressTask.waitForExit('test');

      expect(progressSpy).toHaveBeenCalledTimes(4);
      expect(progressSpy).toHaveBeenCalledWith({ newProgress: 0.25, oldProgress: -1 });
      expect(progressSpy).toHaveBeenCalledWith({ newProgress: 0.5, oldProgress: 0.25 });
      expect(progressSpy).toHaveBeenCalledWith({ newProgress: 0.75, oldProgress: 0.5 });
      expect(progressSpy).toHaveBeenCalledWith({ newProgress: 1, oldProgress: 0.75 });
    });
  });

  describe('工具方法', () => {
    it('应该支持动态设置委托函数', async () => {
      const task = new LoaderTask('Dynamic Task', (task) => {
        task.output = 0;
      });

      task.setLoadDelegate((task) => {
        task.output = task.input?.length || 0;
      });

      await task.waitForExit('hello');
      expect(task.output).toBe(5);
    });

    it('应该支持设置输入委托', async () => {
      const task = new LoaderTask('Input Delegate Task', (task) => {
        task.output = task.input?.length || 0;
      });

      task.setInputDelegate(() => 'delegated');

      await task.waitForExit();
      expect(task.output).toBe(9);
    });

    it('应该支持设置重载超时', async () => {
      const task = new LoaderTask('Timeout Task', (task) => {
        task.output = task.input?.length || 0;
      });

      task.setReloadTimeout(500);

      // 第一次执行
      await task.waitForExit('hello');
      
      // 立即再次执行，应该使用缓存
      const startTime = Date.now();
      await task.waitForExit('hello');
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
}); 