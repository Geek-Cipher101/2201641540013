import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link, BarChart } from '@mui/icons-material';

const Navigation = () => {
  const location = useLocation();

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<Link />}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
          >
            Shorten URL
          </Button>
          
          <Button
            color="inherit"
            component={RouterLink}
            to="/statistics"
            startIcon={<BarChart />}
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
