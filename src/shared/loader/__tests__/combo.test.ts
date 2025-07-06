import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoaderCombo } from '../combo';
import { LoaderTask } from '../task';
import { LoadState } from '../types';

describe('LoaderCombo', () => {
  let combo: LoaderCombo<string>;

  beforeEach(() => {
    const task1 = new LoaderTask('Task 1', (task) => {
      task.output = task.input?.toUpperCase();
    });
    
    const task2 = new LoaderTask('Task 2', (task) => {
      task.output = `${task.input} - processed`;
    });

    combo = new LoaderCombo('Test Combo', [task1, task2]);
  });

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      expect(combo.name).toBe('Test Combo');
      expect(combo.state).toBe(LoadState.Waiting);
      expect(combo.loaders).toHaveLength(2);
      expect(combo.progress).toBe(0);
    });

    it('应该正确执行组合任务', async () => {
      const promise = combo.waitForExit('hello');
      
      expect(combo.state).toBe(LoadState.Loading);
      expect(combo.input).toBe('hello');
      
      await promise;
      
      expect(combo.state).toBe(LoadState.Finished);
      expect((combo.loaders[0] as any).output).toBe('HELLO');
      expect((combo.loaders[1] as any).output).toBe('HELLO - processed');
    });

    it('应该正确计算组合进度', async () => {
      const progressSpy = vi.fn();
      combo.onProgressChange(progressSpy);

      const promise = combo.waitForExit('test');
      
      // 等待一段时间让进度更新
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(progressSpy).toHaveBeenCalled();
      expect(combo.progress).toBeGreaterThan(0);
      
      await promise;
      expect(combo.progress).toBe(1);
    });
  });

  describe('加载器管理', () => {
    it('应该正确添加加载器', () => {
      const newTask = new LoaderTask('New Task', (task) => {
        task.output = task.input?.length;
      });

      combo.addLoader(newTask);
      
      expect(combo.loaders).toHaveLength(3);
      expect(combo.loaders[2]).toBe(newTask);
      expect(newTask.parent).toBe(combo);
    });

    it('应该正确移除加载器', () => {
      const taskToRemove = combo.loaders[0];
      
      combo.removeLoader(taskToRemove);
      
      expect(combo.loaders).toHaveLength(1);
      expect(combo.loaders).not.toContain(taskToRemove);
      expect(taskToRemove.parent).toBeNull();
    });

    it('应该正确清空所有加载器', () => {
      combo.clearLoaders();
      
      expect(combo.loaders).toHaveLength(0);
    });
  });

  describe('中断功能', () => {
    it('应该正确中断所有子加载器', async () => {
      const longTask1 = new LoaderTask('Long Task 1', (task) => {
        return new Promise<void>(resolve => setTimeout(resolve, 1000));
      });
      
      const longTask2 = new LoaderTask('Long Task 2', (task) => {
        return new Promise<void>(resolve => setTimeout(resolve, 1000));
      });

      const longCombo = new LoaderCombo('Long Combo', [longTask1, longTask2]);
      
      const promise = longCombo.waitForExit('test');
      
      // 立即中断
      longCombo.abort();
      
      await expect(promise).rejects.toThrow('加载器执行已中断。');
      expect(longCombo.state).toBe(LoadState.Aborted);
      expect(longTask1.state).toBe(LoadState.Aborted);
      expect(longTask2.state).toBe(LoadState.Aborted);
    });
  });

  describe('错误处理', () => {
    it('应该正确处理子加载器错误', async () => {
      const errorTask = new LoaderTask('Error Task', (task) => {
        throw new Error('子任务错误');
      });
      
      const normalTask = new LoaderTask('Normal Task', (task) => {
        task.output = 'success';
      });

      const errorCombo = new LoaderCombo('Error Combo', [errorTask, normalTask]);
      
      const promise = errorCombo.waitForExit('test');
      
      await expect(promise).rejects.toThrow('子任务错误');
      expect(errorCombo.state).toBe(LoadState.Failed);
      expect(errorCombo.error?.message).toBe('子任务错误');
      expect(normalTask.state).toBe(LoadState.Aborted);
    });

    it('应该正确处理异步错误', async () => {
      const asyncErrorTask = new LoaderTask('Async Error Task', (task) => {
        return new Promise<void>((resolve, reject) => {
          setTimeout(() => reject(new Error('异步错误')), 50);
        });
      });

      const asyncErrorCombo = new LoaderCombo('Async Error Combo', [asyncErrorTask]);
      
      const promise = asyncErrorCombo.waitForExit('test');
      
      await expect(promise).rejects.toThrow('异步错误');
      expect(asyncErrorCombo.state).toBe(LoadState.Failed);
    });
  });

  describe('强制重启', () => {
    it('应该支持强制重启', async () => {
      let executionCount = 0;
      const countingTask = new LoaderTask('Counting Task', (task) => {
        executionCount++;
        task.output = executionCount;
      });

      const countingCombo = new LoaderCombo('Counting Combo', [countingTask]);
      
      // 第一次执行
      await countingCombo.waitForExit('test');
      expect(executionCount).toBe(1);

      // 强制重启
      await countingCombo.waitForExit('test');
      countingCombo.start('test', true);
      await countingCombo.waitForExit('test');
      expect(executionCount).toBe(2);
    });
  });

  describe('数据流传递', () => {
    it('应该正确传递数据流', async () => {
      const task1 = new LoaderTask('Data Task 1', (task) => {
        task.output = task.input?.toUpperCase();
      });
      
      const task2 = new LoaderTask('Data Task 2', (task) => {
        task.output = `${task.input} - processed`;
      });
      
      const task3 = new LoaderTask('Data Task 3', (task) => {
        task.output = `Final: ${task.input}`;
      });

      const dataCombo = new LoaderCombo('Data Combo', [task1, task2, task3]);
      
      await dataCombo.waitForExit('hello');
      
      expect(task1.output).toBe('HELLO');
      expect(task2.output).toBe('HELLO - processed');
      expect(task3.output).toBe('Final: HELLO - processed');
    });
  });

  describe('阻塞机制', () => {
    it('应该正确处理阻塞加载器', async () => {
      const blockingTask = new LoaderTask('Blocking Task', (task) => {
        return new Promise<void>(resolve => setTimeout(resolve, 200));
      }, { block: true });
      
      const nonBlockingTask = new LoaderTask('Non-Blocking Task', (task) => {
        task.output = 'non-blocking';
      }, { block: false });

      const blockingCombo = new LoaderCombo('Blocking Combo', [blockingTask, nonBlockingTask]);
      
      const startTime = Date.now();
      await blockingCombo.waitForExit('test');
      const endTime = Date.now();
      
      // 应该等待阻塞任务完成
      expect(endTime - startTime).toBeGreaterThan(150);
      expect(blockingTask.state).toBe(LoadState.Finished);
      expect(nonBlockingTask.state).toBe(LoadState.Finished);
    });
  });

  describe('获取加载器列表', () => {
    it('应该正确获取加载器列表', () => {
      const nestedTask1 = new LoaderTask('Nested Task 1', (task) => {
        task.output = 'nested1';
      });
      
      const nestedTask2 = new LoaderTask('Nested Task 2', (task) => {
        task.output = 'nested2';
      });
      
      const nestedCombo = new LoaderCombo('Nested Combo', [nestedTask1, nestedTask2]);
      const mainCombo = new LoaderCombo('Main Combo', [combo as any, nestedCombo as any]);
      
      const loaderList = mainCombo.getLoaderList();
      
      expect(loaderList).toHaveLength(6); // 2 from combo + 2 from nestedCombo + 2 from mainCombo
      expect(loaderList).toContain(combo.loaders[0]);
      expect(loaderList).toContain(combo.loaders[1]);
      expect(loaderList).toContain(nestedTask1);
      expect(loaderList).toContain(nestedTask2);
    });

    it('应该正确处理显示过滤', () => {
      const hiddenTask = new LoaderTask('Hidden Task', (task) => {
        task.output = 'hidden';
      }, { show: false });
      
      const visibleTask = new LoaderTask('Visible Task', (task) => {
        task.output = 'visible';
      }, { show: true });

      const visibilityCombo = new LoaderCombo('Visibility Combo', [hiddenTask, visibleTask]);
      
      const visibleList = visibilityCombo.getLoaderList(true);
      const allList = visibilityCombo.getLoaderList(false);
      
      expect(visibleList).toHaveLength(1);
      expect(visibleList).toContain(visibleTask);
      expect(allList).toHaveLength(2);
      expect(allList).toContain(hiddenTask);
      expect(allList).toContain(visibleTask);
    });
  });

  describe('进度权重', () => {
    it('应该正确计算加权进度', async () => {
      const fastTask = new LoaderTask('Fast Task', (task) => {
        task.output = 'fast';
      }, { progressWeight: 1 });
      
      const slowTask = new LoaderTask('Slow Task', (task) => {
        return new Promise<void>(resolve => setTimeout(resolve, 100));
      }, { progressWeight: 3 });

      const weightedCombo = new LoaderCombo('Weighted Combo', [fastTask, slowTask]);
      
      const promise = weightedCombo.waitForExit('test');
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 慢任务应该占更大的进度权重
      expect(weightedCombo.progress).toBeGreaterThan(0.25);
      
      await promise;
      expect(weightedCombo.progress).toBe(1);
    });
  });
}); 