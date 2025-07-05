import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Chip,
} from '@mui/material';
import { PlayArrow, AccountCircle, Settings as SettingsIcon } from '@mui/icons-material';

const LaunchPage: React.FC = () => {
  const [launching, setLaunching] = React.useState(false);

  const handleLaunch = () => {
    setLaunching(true);
    // 模拟启动过程
    setTimeout(() => {
      setLaunching(false);
    }, 3000);
  };

  return (
    <Box className="fade-in" sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'white' }}>
        启动游戏
      </Typography>

      <Grid container spacing={3}>
        {/* 主要启动区域 */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                当前版本
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    backgroundColor: '#4CAF50',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                    1.20
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    Minecraft 1.20.4
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    Vanilla • 最新正式版
                  </Typography>
                </Box>
                <Chip 
                  label="已安装" 
                  color="success" 
                  size="small" 
                  sx={{ ml: 'auto' }}
                />
              </Box>

              {launching && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, color: 'rgba(255, 255, 255, 0.7)' }}>
                    正在启动游戏...
                  </Typography>
                  <LinearProgress 
                    sx={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#4CAF50',
                      },
                    }} 
                  />
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={handleLaunch}
                disabled={launching}
                sx={{
                  backgroundColor: '#4CAF50',
                  '&:hover': {
                    backgroundColor: '#45A049',
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(76, 175, 80, 0.3)',
                  },
                  borderRadius: 2,
                  py: 1.5,
                  px: 4,
                  fontSize: '16px',
                  fontWeight: 'bold',
                }}
              >
                {launching ? '启动中...' : '启动游戏'}
              </Button>
            </CardContent>
          </Card>

          {/* 快速操作 */}
          <Card sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                快速操作
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<SettingsIcon />}
                    sx={{
                      borderColor: '#333',
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      },
                    }}
                  >
                    版本设置
                  </Button>
                </Grid>
                <Grid item xs={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AccountCircle />}
                    sx={{
                      borderColor: '#333',
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&:hover': {
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                      },
                    }}
                  >
                    账户管理
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 侧边信息栏 */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3, backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                账户信息
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccountCircle sx={{ fontSize: 40, color: '#4CAF50' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ color: 'white' }}>
                    未登录
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                    点击登录账户
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ backgroundColor: '#1E1E1E', border: '1px solid #333' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
                系统信息
              </Typography>
              <Box sx={{ space: 2 }}>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  Java: OpenJDK 17.0.2
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1 }}>
                  内存: 4GB / 16GB
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  存储: 512GB 可用
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LaunchPage; 