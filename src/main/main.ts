import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { isDev } from '@shared/utils';
import log from 'electron-log';

// 配置日志
log.transports.file.level = 'info';
log.transports.console.level = 'debug';

class Application {
  private mainWindow: BrowserWindow | null = null;

  constructor() {
    log.info('PCL2 Reforged 应用程序启动');
    log.info(`运行环境: ${isDev() ? '开发' : '生产'}`);
    log.info(`平台: ${process.platform}, 架构: ${process.arch}`);
    log.info(`Electron版本: ${process.versions.electron}`);
    log.info(`Node版本: ${process.versions.node}`);
    this.init();
  }

  private init(): void {
    log.info('开始初始化应用程序...');
    
    // 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
    app.whenReady().then(() => {
      log.info('Electron已准备就绪');
      this.createWindow();
      
      app.on('activate', () => {
        // 在 macOS 上，当点击 dock 图标且没有其他窗口打开时，
        // 通常会重新创建一个窗口
        if (BrowserWindow.getAllWindows().length === 0) {
          this.createWindow();
        }
      });
    });

    // 当所有窗口关闭时退出应用
    app.on('window-all-closed', () => {
      // 在 macOS 上，通常应用和它们的菜单栏会保持活跃状态，
      // 直到用户使用 Cmd + Q 显式退出
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    // 注册 IPC 处理器
    this.registerIpcHandlers();
  }

  private createWindow(): void {
    log.info('开始创建主窗口...');
    
    // 创建浏览器窗口
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 1000,
      minHeight: 700,
      show: false,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    log.info('主窗口创建完成');

    // 加载应用
    if (isDev()) {
      log.info('开发模式：尝试加载本地服务器');
      // 检查开发服务器是否可用
      const http = require('http');
      const checkServer = () => {
        return new Promise((resolve) => {
          const req = http.get('http://localhost:3000', (_res: any) => {
            resolve(true);
          });
          req.on('error', () => {
            resolve(false);
          });
          req.setTimeout(1000, () => {
            req.destroy();
            resolve(false);
          });
        });
      };
      
      checkServer().then((serverAvailable) => {
        if (serverAvailable) {
          log.info('开发服务器可用，加载 http://localhost:3000');
          this.mainWindow?.loadURL('http://localhost:3000');
          this.mainWindow?.webContents.openDevTools();
        } else {
          log.info('开发服务器不可用，加载构建文件');
          const indexPath = path.join(__dirname, 'renderer', 'index.html');
          this.mainWindow?.loadFile(indexPath);
        }
      });
    } else {
      const indexPath = path.join(__dirname, 'renderer', 'index.html');
      log.info(`生产模式：加载文件 ${indexPath}`);
      this.mainWindow.loadFile(indexPath);
    }

    // 监听页面加载事件
    this.mainWindow.webContents.on('did-start-loading', () => {
      log.info('页面开始加载');
    });

    this.mainWindow.webContents.on('did-finish-load', () => {
      log.info('页面加载完成');
    });

    this.mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      log.error(`页面加载失败: ${errorCode} - ${errorDescription}`);
    });

    // 当窗口准备显示时显示窗口
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      log.info('PCL2 Reforged 启动完成');
    });

    // 窗口关闭时的处理
    this.mainWindow.on('closed', () => {
      log.info('主窗口已关闭');
      this.mainWindow = null;
    });
  }

  private registerIpcHandlers(): void {
    // 窗口控制
    ipcMain.handle('window:minimize', () => {
      this.mainWindow?.minimize();
    });

    ipcMain.handle('window:maximize', () => {
      if (this.mainWindow?.isMaximized()) {
        this.mainWindow.unmaximize();
      } else {
        this.mainWindow?.maximize();
      }
    });

    ipcMain.handle('window:close', () => {
      this.mainWindow?.close();
    });

    // 应用信息
    ipcMain.handle('app:getVersion', () => {
      return app.getVersion();
    });

    log.info('IPC 处理器注册完成');
  }
}

// 创建应用实例
new Application(); 