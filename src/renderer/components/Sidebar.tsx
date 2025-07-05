import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider 
} from '@mui/material';
import { 
  PlayArrow,
  CloudDownload,
  Folder,
  Settings,
  Info
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '../stores/appStore';
import { PageType } from '@shared/types';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ReactNode;
  path: string;
}

const navItems: NavItem[] = [
  {
    id: 'launch',
    label: '启动游戏',
    icon: <PlayArrow />,
    path: '/launch',
  },
  {
    id: 'download',
    label: '下载管理',
    icon: <CloudDownload />,
    path: '/download',
  },
  {
    id: 'versions',
    label: '版本管理',
    icon: <Folder />,
    path: '/versions',
  },
  {
    id: 'settings',
    label: '设置',
    icon: <Settings />,
    path: '/settings',
  },
  {
    id: 'about',
    label: '关于',
    icon: <Info />,
    path: '/about',
  },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setCurrentPage } = useAppStore();

  const handleNavigation = (item: NavItem) => {
    navigate(item.path);
    setCurrentPage(item.id);
  };

  return (
    <Box
      sx={{
        width: 240,
        height: '100%',
        backgroundColor: '#1A1A1A',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box
          sx={{
            background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
            borderRadius: 2,
            p: 2,
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Box sx={{ fontWeight: 'bold', fontSize: '18px' }}>PCL2</Box>
          <Box sx={{ fontSize: '12px', opacity: 0.9 }}>Reforged</Box>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#333' }} />

      <List sx={{ flex: 1, py: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item)}
                sx={{
                  mx: 1,
                  borderRadius: 1,
                  backgroundColor: isActive ? 'rgba(76, 175, 80, 0.2)' : 'transparent',
                  color: isActive ? '#4CAF50' : 'rgba(255, 255, 255, 0.7)',
                  '&:hover': {
                    backgroundColor: isActive 
                      ? 'rgba(76, 175, 80, 0.3)' 
                      : 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    color: 'inherit',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};

export default Sidebar; 