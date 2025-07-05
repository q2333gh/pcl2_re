import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TitleBar from './components/TitleBar';
import Sidebar from './components/Sidebar';
import LaunchPage from './pages/LaunchPage';
import DownloadPage from './pages/DownloadPage';
import VersionsPage from './pages/VersionsPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';
import { useAppStore } from './stores/appStore';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { setAppVersion } = useAppStore();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 获取应用版本
        const version = await window.electronAPI.app.getVersion();
        setAppVersion(version);
        
        // 模拟初始化过程
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [setAppVersion]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        }}
      >
        <Typography variant="h3" sx={{ mb: 4, color: 'white', fontWeight: 'bold' }}>
          PCL2 Reforged
        </Typography>
        <CircularProgress size={40} sx={{ color: 'white' }} />
        <Typography variant="body1" sx={{ mt: 2, color: 'white', opacity: 0.8 }}>
          正在初始化...
        </Typography>
      </Box>
    );
  }

  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TitleBar />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flex: 1,
              overflow: 'auto',
              background: theme => theme.palette.background.default,
            }}
          >
            <Routes>
              <Route path="/" element={<LaunchPage />} />
              <Route path="/launch" element={<LaunchPage />} />
              <Route path="/download" element={<DownloadPage />} />
              <Route path="/versions" element={<VersionsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
};

export default App; 