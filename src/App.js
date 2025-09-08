import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import Navigation from './components/Navigation';
import URLShortener from './components/URLShortener';
import URLStatistics from './components/URLStatistics';
import RedirectHandler from './components/RedirectHandler';
import logger from './middleware/logger';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  React.useEffect(() => {
    logger.info('Application started');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<URLShortener />} />
            <Route path="/statistics" element={<URLStatistics />} />
            <Route path="/:shortCode" element={<RedirectHandler />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
