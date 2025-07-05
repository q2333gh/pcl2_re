import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { Settings } from '@mui/icons-material';

const SettingsPage: React.FC = () => {
  return (
    <Box className="fade-in" sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
        设置
      </Typography>

      <Card sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
        <CardContent sx={{ textAlign: 'center', py: 8 }}>
          <Settings sx={{ fontSize: 64, color: '#4CAF50', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
            设置功能正在开发中
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            即将支持启动器设置、游戏设置、主题配置等功能
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SettingsPage; 