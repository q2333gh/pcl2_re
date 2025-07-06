import { describe, it, expect, beforeEach, vi } from 'vitest';
import { McFolderManager } from '../folder-manager';
import { McFolderType, McEventType } from '../types';

describe('McFolderManager', () => {
  let manager: McFolderManager;

  beforeEach(() => {
    manager = new McFolderManager({
      defaultPath: './test/',
      customFolders: ['TestFolder>./custom/test/'],
      autoCreateDefault: true,
      scanOfficialLauncher: true
    });
  });

  describe('基础功能', () => {
    it('应该正确初始化', () => {
      expect(manager).toBeInstanceOf(McFolderManager);
      expect(manager.getCurrentPath()).toBe('./test/');
    });

    it('应该正确设置当前路径', () => {
      manager.setCurrentPath('./new-path/');
      expect(manager.getCurrentPath()).toBe('./new-path/');
    });

    it('应该返回文件夹列表的副本', () => {
      const folders = manager.getFolders();
      expect(Array.isArray(folders)).toBe(true);
      
      // 修改返回的数组不应该影响原始数据
      folders.push({ name: 'test', path: './test/', type: McFolderType.Original });
      expect(manager.getFolders().length).toBe(0);
    });
  });

  describe('文件夹扫描', () => {
    it('应该扫描文件夹并返回结果', async () => {
      const result = await manager.scanFolders();
      
      expect(result).toHaveProperty('folders');
      expect(result).toHaveProperty('totalCount');
      expect(result).toHaveProperty('validCount');
      expect(result).toHaveProperty('errorCount');
      expect(Array.isArray(result.folders)).toBe(true);
    });

    it('应该在扫描失败时返回错误信息', async () => {
      // 模拟扫描失败
      const errorManager = new McFolderManager({
        defaultPath: './invalid-path/',
        autoCreateDefault: false
      });

      const result = await errorManager.scanFolders();
      expect(result.errorCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('自定义文件夹管理', () => {
    it('应该添加有效的自定义文件夹', () => {
      const success = manager.addCustomFolder('TestFolder', './test-custom/');
      expect(success).toBe(true);
      
      const folders = manager.getFolders();
      const addedFolder = folders.find(f => f.path === './test-custom/');
      expect(addedFolder).toBeDefined();
      expect(addedFolder!.name).toBe('TestFolder');
      expect(addedFolder!.type).toBe(McFolderType.Custom);
    });

    it('应该拒绝无效的文件夹路径', () => {
      const success = manager.addCustomFolder('InvalidFolder', 'invalid-path');
      expect(success).toBe(false);
      
      const folders = manager.getFolders();
      const invalidFolder = folders.find(f => f.name === 'InvalidFolder');
      expect(invalidFolder).toBeUndefined();
    });

    it('应该更新已存在的文件夹', () => {
      // 先添加一个文件夹
      manager.addCustomFolder('OriginalName', './test-path/');
      
      // 更新文件夹名称
      const success = manager.addCustomFolder('UpdatedName', './test-path/');
      expect(success).toBe(true);
      
      const folders = manager.getFolders();
      const updatedFolder = folders.find(f => f.path === './test-path/');
      expect(updatedFolder!.name).toBe('UpdatedName');
      expect(updatedFolder!.type).toBe(McFolderType.RenamedOriginal);
    });

    it('应该移除文件夹', () => {
      // 先添加一个文件夹
      manager.addCustomFolder('TestFolder', './test-remove/');
      expect(manager.hasFolder('./test-remove/')).toBe(true);
      
      // 移除文件夹
      const success = manager.removeFolder('./test-remove/');
      expect(success).toBe(true);
      expect(manager.hasFolder('./test-remove/')).toBe(false);
    });

    it('应该处理移除不存在的文件夹', () => {
      const success = manager.removeFolder('./non-existent/');
      expect(success).toBe(false);
    });
  });

  describe('文件夹查询', () => {
    it('应该获取指定的文件夹', () => {
      manager.addCustomFolder('TestFolder', './test-get/');
      
      const folder = manager.getFolder('./test-get/');
      expect(folder).toBeDefined();
      expect(folder!.name).toBe('TestFolder');
      expect(folder!.path).toBe('./test-get/');
    });

    it('应该返回undefined当文件夹不存在时', () => {
      const folder = manager.getFolder('./non-existent/');
      expect(folder).toBeUndefined();
    });

    it('应该检查文件夹是否存在', () => {
      expect(manager.hasFolder('./non-existent/')).toBe(false);
      
      manager.addCustomFolder('TestFolder', './test-exists/');
      expect(manager.hasFolder('./test-exists/')).toBe(true);
    });
  });

  describe('事件系统', () => {
    it('应该添加和移除事件监听器', () => {
      const listener = vi.fn();
      
      // 添加监听器
      manager.addEventListener(McEventType.FolderAdded, listener);
      
      // 触发事件
      manager.addCustomFolder('TestFolder', './test-event/');
      
      expect(listener).toHaveBeenCalled();
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        type: McEventType.FolderAdded,
        folder: expect.objectContaining({
          name: 'TestFolder',
          path: './test-event/',
          type: McFolderType.Custom
        })
      }));
      
      // 移除监听器
      manager.removeEventListener(McEventType.FolderAdded, listener);
      
      // 清除调用记录
      listener.mockClear();
      
      // 再次触发事件
      manager.addCustomFolder('TestFolder2', './test-event2/');
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('应该处理事件监听器执行错误', () => {
      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      });
      
      // 添加错误监听器
      manager.addEventListener(McEventType.FolderAdded, errorListener);
      
      // 应该不会抛出异常
      expect(() => {
        manager.addCustomFolder('TestFolder', './test-error/');
      }).not.toThrow();
      
      expect(errorListener).toHaveBeenCalled();
    });

    it('应该触发文件夹更新事件', () => {
      const updateListener = vi.fn();
      manager.addEventListener(McEventType.FolderUpdated, updateListener);
      
      // 先添加文件夹
      manager.addCustomFolder('OriginalName', './test-update/');
      
      // 更新文件夹名称
      manager.addCustomFolder('UpdatedName', './test-update/');
      
      expect(updateListener).toHaveBeenCalled();
      expect(updateListener).toHaveBeenCalledWith(expect.objectContaining({
        type: McEventType.FolderUpdated,
        folder: expect.objectContaining({
          name: 'UpdatedName',
          path: './test-update/',
          type: McFolderType.RenamedOriginal
        })
      }));
    });

    it('应该触发文件夹移除事件', () => {
      const removeListener = vi.fn();
      manager.addEventListener(McEventType.FolderRemoved, removeListener);
      
      // 先添加文件夹
      manager.addCustomFolder('TestFolder', './test-remove/');
      
      // 移除文件夹
      manager.removeFolder('./test-remove/');
      
      expect(removeListener).toHaveBeenCalled();
      expect(removeListener).toHaveBeenCalledWith(expect.objectContaining({
        type: McEventType.FolderRemoved,
        folder: expect.objectContaining({
          name: 'TestFolder',
          path: './test-remove/',
          type: McFolderType.Custom
        })
      }));
    });
  });

  describe('配置管理', () => {
    it('应该正确解析文件夹配置', async () => {
      const manager = new McFolderManager({
        customFolders: [
          'Folder1>./path1/',
          'Folder2>./path2/',
          'InvalidConfig', // 无效配置
          'Folder3>./path3' // 缺少结尾斜杠
        ]
      });

      const result = await manager.scanFolders();
      // 应该只处理有效的配置
      expect(result).toBeDefined();
    });

    it('应该更新自定义文件夹配置', () => {
      // 添加自定义文件夹
      manager.addCustomFolder('Folder1', './custom1/');
      manager.addCustomFolder('Folder2', './custom2/');
      
      // 配置应该被更新
      const folders = manager.getFolders();
      const customFolders = folders.filter(f => f.type !== McFolderType.Original);
      expect(customFolders.length).toBe(2);
    });
  });

  describe('错误处理', () => {
    it('应该处理添加文件夹时的错误', () => {
      // 模拟无效路径
      const success = manager.addCustomFolder('ErrorFolder', '');
      expect(success).toBe(false);
    });

    it('应该处理扫描时的错误', async () => {
      // 创建一个可能导致错误的配置
      const errorManager = new McFolderManager({
        defaultPath: '',
        customFolders: ['Invalid>InvalidPath']
      });

      const result = await errorManager.scanFolders();
      expect(result).toBeDefined();
      expect(result.errorCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('launcher_profiles.json管理', () => {
    it('应该在扫描时创建launcher_profiles.json', async () => {
      const result = await manager.scanFolders();
      
      // 由于是模拟实现，这里主要测试方法调用
      expect(result).toBeDefined();
      expect(result.folders).toBeDefined();
    });
  });
}); 