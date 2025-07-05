import { create } from 'zustand';
import { AppConfig, PageType } from '@shared/types';

interface AppState {
  // 应用信息
  appVersion: string;
  currentPage: PageType;
  
  // 应用配置
  config: AppConfig;
  
  // UI状态
  sidebarCollapsed: boolean;
  isMaximized: boolean;
  
  // 动作
  setAppVersion: (version: string) => void;
  setCurrentPage: (page: PageType) => void;
  updateConfig: (config: Partial<AppConfig>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setIsMaximized: (maximized: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始状态
  appVersion: '1.0.0',
  currentPage: 'launch',
  config: {
    version: '1.0.0',
    theme: 'dark',
    language: 'zh-CN',
    autoStart: false,
    minimizeToTray: true,
  },
  sidebarCollapsed: false,
  isMaximized: false,
  
  // 动作
  setAppVersion: (version) => set({ appVersion: version }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  updateConfig: (newConfig) => set((state) => ({
    config: { ...state.config, ...newConfig }
  })),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setIsMaximized: (maximized) => set({ isMaximized: maximized }),
})); 