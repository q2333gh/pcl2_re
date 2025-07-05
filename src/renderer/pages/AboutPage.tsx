import React from 'react';
import { Box, Typography, Card, CardContent, Divider } from '@mui/material';
import { useAppStore } from '../stores/appStore';

const AboutPage: React.FC = () => {
  const { appVersion } = useAppStore();

  return (
    <Box className="fade-in" sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
        关于 PCL2 Reforged
      </Typography>

      <Card sx={{ mb: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
                borderRadius: 2,
                p: 3,
                display: 'inline-block',
                mb: 2,
              }}
            >
              <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold' }}>
                PCL2
              </Typography>
              <Typography variant="h6" sx={{ color: 'white', opacity: 0.9 }}>
                Reforged
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
              Plain Craft Launcher 2 - Reforged
            </Typography>
            <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              版本 {appVersion}
            </Typography>
          </Box>

          <Divider sx={{ borderColor: '#333', my: 3 }} />

          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            项目信息
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 2 }}>
            这是使用现代化技术栈重构的PCL2启动器，采用Electron + TypeScript + React技术栈开发。
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 3 }}>
            目标是提供更好的用户体验、更稳定的性能和更易于维护的代码架构。
          </Typography>

          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            技术栈
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {['Electron', 'TypeScript', 'React', 'Material-UI', 'Zustand', 'Webpack'].map((tech) => (
              <Box
                key={tech}
                sx={{
                  px: 2,
                  py: 0.5,
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  borderRadius: 1,
                  color: '#4CAF50',
                  fontSize: '14px',
                }}
              >
                {tech}
              </Box>
            ))}
          </Box>

          <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
            开发状态
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            当前版本为早期开发版本，框架基础已搭建完成，核心功能正在开发中。
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AboutPage; 