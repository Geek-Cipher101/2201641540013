import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import urlService from '../services/urlService';
import logger from '../middleware/logger';

const RedirectHandler = () => {
  const { shortCode } = useParams();
  const [status, setStatus] = useState('loading'); // loading, redirecting, error, expired
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!shortCode) {
      setStatus('error');
      setMessage('No short code provided');
      return;
    }

    logger.info('Redirect attempt', { shortCode });

    const originalUrl = urlService.redirectURL(shortCode);
    
    if (originalUrl) {
      setStatus('redirecting');
      setMessage(`Redirecting to ${originalUrl}...`);
      
      // Redirect after a brief delay to show the message
      setTimeout(() => {
        window.location.href = originalUrl;
      }, 1500);
    } else {
      // Check if URL exists but is expired
      const urlEntry = urlService.getURL(shortCode);
      if (urlEntry === null) {
        // Check if it exists in storage but is expired
        const allUrls = urlService.getAllURLs();
        const expiredUrl = allUrls.find(url => url.shortCode === shortCode && url.isExpired);
        
        if (expiredUrl) {
          setStatus('expired');
          setMessage('This short URL has expired and is no longer valid.');
          logger.warn('Redirect failed - URL expired', { shortCode });
        } else {
          setStatus('error');
          setMessage('Short URL not found. Please check the URL and try again.');
          logger.warn('Redirect failed - URL not found', { shortCode });
        }
      }
    }
  }, [shortCode]);

  const getStatusContent = () => {
    switch (status) {
      case 'loading':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress />
            <Typography>Processing redirect...</Typography>
          </Box>
        );
      
      case 'redirecting':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CircularProgress color="success" />
            <Typography color="success.main">{message}</Typography>
          </Box>
        );
      
      case 'expired':
        return (
          <Alert severity="warning" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Link Expired
            </Typography>
            <Typography>
              {message}
            </Typography>
          </Alert>
        );
      
      case 'error':
      default:
        return (
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              Link Not Found
            </Typography>
            <Typography>
              {message}
            </Typography>
          </Alert>
        );
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
      {getStatusContent()}
    </Container>
  );
};

export default RedirectHandler;
