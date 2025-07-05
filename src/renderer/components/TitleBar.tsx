import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Minimize, CropSquare, Close } from '@mui/icons-material';
import { useAppStore } from '../stores/appStore';

const TitleBar: React.FC = () => {
  const { appVersion } = useAppStore();

  const handleMinimize = () => {
    window.electronAPI.window.minimize();
  };

  const handleMaximize = () => {
    window.electronAPI.window.maximize();
  };

  const handleClose = () => {
    window.electronAPI.window.close();
  };

  return (
    <Box
      className="draggable"
      sx={{
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1E1E1E',
        borderBottom: '1px solid #333',
        padding: '0 16px',
        fontSize: '14px',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        PCL2 Reforged v{appVersion}
      </Typography>

      <Box className="non-draggable" sx={{ display: 'flex' }}>
        <IconButton
          size="small"
          onClick={handleMinimize}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <Minimize fontSize="small" />
        </IconButton>
        
        <IconButton
          size="small"
          onClick={handleMaximize}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          <CropSquare fontSize="small" />
        </IconButton>
        
        <IconButton
          size="small"
          onClick={handleClose}
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            padding: '4px',
            '&:hover': {
              backgroundColor: '#E53E3E',
              color: 'white',
            },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default TitleBar; 