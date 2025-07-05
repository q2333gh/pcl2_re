import { contextBridge, ipcRenderer } from 'electron';

// 定义暴露给渲染进程的API
const electronAPI = {
  // 窗口控制
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
  },

  // 应用信息
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
  },

  // 系统信息
  system: {
    platform: process.platform,
    arch: process.arch,
  },
};

// 将API暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
} 