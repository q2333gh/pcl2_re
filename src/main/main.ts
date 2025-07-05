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
    this.init();
  }

  private init(): void {
    // 当 Electron 完成初始化并准备创建浏览器窗口时调用此方法
    app.whenReady().then(() => {
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
        enableRemoteModule: false,
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    // 加载应用
    if (isDev()) {
      this.mainWindow.loadURL('http://localhost:3000');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(__dirname, 'index.html'));
    }

    // 当窗口准备显示时显示窗口
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
      log.info('PCL2 Reforged 启动完成');
    });

    // 窗口关闭时的处理
    this.mainWindow.on('closed', () => {
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