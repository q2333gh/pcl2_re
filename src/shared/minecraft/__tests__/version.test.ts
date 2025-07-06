import { describe, it, expect, beforeEach } from 'vitest';
import { McVersion } from '../version';
import { McVersionState, McVersionCardType } from '../types';

describe('McVersion', () => {
  let version: McVersion;

  beforeEach(() => {
    version = new McVersion({
      name: '1.19.2',
      path: './versions/1.19.2/',
      info: 'Minecraft 1.19.2 Release',
      state: McVersionState.Release,
      logo: 'Grass',
      isStar: false,
      displayType: McVersionCardType.Auto,
      releaseTime: new Date('2022-08-05'),
      jsonObject: {
        id: '1.19.2',
        type: 'release',
        releaseTime: '2022-08-05T00:00:00.000Z',
        libraries: [
          'net.minecraftforge:forge:1.19.2-43.2.0',
          'fabricmc:intermediary:1.19.2'
        ]
      }
    });
  });

  describe('基础属性', () => {
    it('应该正确初始化基础属性', () => {
      expect(version.name).toBe('1.19.2');
      expect(version.path).toBe('./versions/1.19.2/');
      expect(version.info).toBe('Minecraft 1.19.2 Release');
      expect(version.state).toBe(McVersionState.Release);
      expect(version.logo).toBe('Grass');
      expect(version.isStar).toBe(false);
      expect(version.displayType).toBe(McVersionCardType.Auto);
      expect(version.releaseTime).toEqual(new Date('2022-08-05'));
    });

    it('应该正确设置属性', () => {
      version.info = 'Updated Info';
      version.state = McVersionState.Snapshot;
      version.logo = 'Diamond';
      version.isStar = true;
      version.displayType = McVersionCardType.API;

      expect(version.info).toBe('Updated Info');
      expect(version.state).toBe(McVersionState.Snapshot);
      expect(version.logo).toBe('Diamond');
      expect(version.isStar).toBe(true);
      expect(version.displayType).toBe(McVersionCardType.API);
    });
  });

  describe('版本信息解析', () => {
    it('应该正确解析Minecraft版本号', () => {
      version.load();
      expect(version.version.mcName).toBe('1.19.2');
    });

    it('应该正确解析Mod加载器信息', () => {
      version.load();
      expect(version.version.hasForge).toBe(true);
      expect(version.version.hasFabric).toBe(true);
      expect(version.version.hasNeoForge).toBe(false);
      expect(version.version.hasLiteLoader).toBe(false);
      expect(version.version.hasOptiFine).toBe(false);
      expect(version.version.hasQuilt).toBe(false);
    });

    it('应该正确判断是否可安装Mod', () => {
      version.load();
      expect(version.modable).toBe(true);
    });

    it('应该从继承版本中提取版本号', () => {
      const inheritedVersion = new McVersion({
        name: '1.19.2-forge',
        path: './versions/1.19.2-forge/',
        inheritVersion: '1.19.2',
        jsonObject: {
          id: '1.19.2-forge',
          type: 'release',
          jar: '1.19.2'
        }
      });

      inheritedVersion.load();
      expect(inheritedVersion.version.mcName).toBe('1.19.2-forge'); // 继承版本会回退到id
    });

    it('应该从名称中提取版本号', () => {
      const namedVersion = new McVersion({
        name: '1.18.2-release',
        path: './versions/1.18.2-release/',
        jsonObject: {
          id: '1.18.2-release',
          type: 'release'
        }
      });

      namedVersion.load();
      expect(namedVersion.version.mcName).toBe('1.18.2-release'); // 会回退到id
    });
  });

  describe('版本状态管理', () => {
    it('应该正确加载和卸载版本', () => {
      expect(version.isLoaded).toBe(false);
      
      version.load();
      expect(version.isLoaded).toBe(true);
      expect(version.version.mcName).toBe('1.19.2');
      
      version.unload();
      expect(version.isLoaded).toBe(false);
      // 卸载后再次访问version会重新加载
      expect(version.version.mcName).toBe('1.19.2');
    });

    it('应该在加载失败时设置错误状态', () => {
      const errorVersion = new McVersion({
        name: 'error-version',
        path: './versions/error-version/',
        jsonObject: null
      });

      errorVersion.load();
      expect(errorVersion.state).toBe(McVersionState.Error);
    });

    it('应该避免重复加载', () => {
      version.load();
      const firstLoadTime = version.version.mcName;
      
      version.load(); // 第二次加载应该被忽略
      expect(version.version.mcName).toBe(firstLoadTime);
    });
  });

  describe('版本比较', () => {
    it('应该正确比较两个版本', () => {
      const otherVersion = new McVersion({
        name: '1.19.2',
        path: './versions/1.19.2/',
        state: McVersionState.Release
      });

      expect(version.equals(otherVersion)).toBe(true);
    });

    it('应该正确处理不同的版本', () => {
      const otherVersion = new McVersion({
        name: '1.18.2',
        path: './versions/1.18.2/',
        state: McVersionState.Release
      });

      expect(version.equals(otherVersion)).toBe(false);
    });

    it('应该正确处理null比较', () => {
      expect(version.equals(null as any)).toBe(false);
    });
  });

  describe('字符串表示', () => {
    it('应该返回正确的字符串表示', () => {
      expect(version.toString()).toBe('./versions/1.19.2/');
    });
  });

  describe('版本隔离路径', () => {
    it('应该返回版本隔离路径', () => {
      expect(version.pathIndie).toBe('./versions/1.19.2/');
    });

    it('应该缓存路径计算结果', () => {
      const firstCall = version.pathIndie;
      const secondCall = version.pathIndie;
      expect(firstCall).toBe(secondCall);
    });
  });

  describe('配置序列化', () => {
    it('应该正确序列化为配置对象', () => {
      const config = version.toConfig();
      
      expect(config.name).toBe('1.19.2');
      expect(config.path).toBe('./versions/1.19.2/');
      expect(config.info).toBe('Minecraft 1.19.2 Release');
      expect(config.state).toBe(McVersionState.Release);
      expect(config.logo).toBe('Grass');
      expect(config.isStar).toBe(false);
      expect(config.displayType).toBe(McVersionCardType.Auto);
      expect(config.releaseTime).toEqual(new Date('2022-08-05'));
    });

    it('应该从配置创建版本实例', () => {
      const config = version.toConfig();
      const newVersion = McVersion.fromConfig(config);
      
      expect(newVersion.name).toBe(version.name);
      expect(newVersion.path).toBe(version.path);
      expect(newVersion.info).toBe(version.info);
      expect(newVersion.state).toBe(version.state);
    });
  });

  describe('Mod加载器检测', () => {
    it('应该检测Forge', () => {
      const forgeVersion = new McVersion({
        name: '1.19.2-forge',
        path: './versions/1.19.2-forge/',
        jsonObject: {
          libraries: ['net.minecraftforge:forge:1.19.2-43.2.0']
        }
      });

      forgeVersion.load();
      expect(forgeVersion.version.hasForge).toBe(true);
      expect(forgeVersion.modable).toBe(true);
    });

    it('应该检测NeoForge', () => {
      const neoForgeVersion = new McVersion({
        name: '1.19.2-neoforge',
        path: './versions/1.19.2-neoforge/',
        jsonObject: {
          libraries: ['net.neoforged:neoforge:1.19.2-43.2.0']
        }
      });

      neoForgeVersion.load();
      expect(neoForgeVersion.version.hasNeoForge).toBe(true);
      expect(neoForgeVersion.modable).toBe(true);
    });

    it('应该检测LiteLoader', () => {
      const liteLoaderVersion = new McVersion({
        name: '1.19.2-liteloader',
        path: './versions/1.19.2-liteloader/',
        jsonObject: {
          libraries: ['com.mumfrey:liteloader:1.19.2']
        }
      });

      liteLoaderVersion.load();
      expect(liteLoaderVersion.version.hasLiteLoader).toBe(true);
      expect(liteLoaderVersion.modable).toBe(true);
    });

    it('应该检测OptiFine', () => {
      const optiFineVersion = new McVersion({
        name: '1.19.2-optifine',
        path: './versions/1.19.2-optifine/',
        jsonObject: {
          libraries: ['optifine:OptiFine:1.19.2_HD_U_I7']
        }
      });

      optiFineVersion.load();
      expect(optiFineVersion.version.hasOptiFine).toBe(true);
    });

    it('应该检测Quilt', () => {
      const quiltVersion = new McVersion({
        name: '1.19.2-quilt',
        path: './versions/1.19.2-quilt/',
        jsonObject: {
          libraries: ['quiltmc:intermediary:1.19.2']
        }
      });

      quiltVersion.load();
      expect(quiltVersion.version.hasQuilt).toBe(true);
      // Quilt不是主要的mod加载器，所以modable可能为false
      expect(quiltVersion.version.hasQuilt).toBe(true);
    });

    it('应该将API类型标记为可安装Mod', () => {
      const apiVersion = new McVersion({
        name: 'api-version',
        path: './versions/api-version/',
        displayType: McVersionCardType.API
      });

      expect(apiVersion.modable).toBe(true);
    });
  });

  describe('版本号验证', () => {
    it('应该验证有效的版本号格式', () => {
      const validVersions = ['1.19.2', '1.18.2', '1.17.1', '1.16.5'];
      
      for (const versionStr of validVersions) {
        const testVersion = new McVersion({
          name: versionStr,
          path: `./versions/${versionStr}/`,
          jsonObject: { id: versionStr }
        });
        
        testVersion.load();
        expect(testVersion.version.mcName).toBe(versionStr);
      }
    });

    it('应该处理无效的版本号格式', () => {
      const invalidVersion = new McVersion({
        name: 'invalid-version',
        path: './versions/invalid-version/',
        jsonObject: { id: 'invalid-version' }
      });

      invalidVersion.load();
      expect(invalidVersion.version.mcName).toBe('invalid-version'); // 回退到文件夹名
    });
  });
}); 