import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  IconButton,
  Snackbar
} from '@mui/material';
import { ContentCopy, Launch } from '@mui/icons-material';
import urlService from '../services/urlService';
import logger from '../middleware/logger';

const URLShortener = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [validityMinutes, setValidityMinutes] = useState(30);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      logger.info('User attempting to shorten URL', { originalUrl, customCode, validityMinutes });

      // Validate inputs
      if (!originalUrl.trim()) {
        throw new Error('Please enter a URL to shorten');
      }

      if (validityMinutes < 1 || validityMinutes > 10080) { // Max 1 week
        throw new Error('Validity period must be between 1 and 10080 minutes (1 week)');
      }

      const result = urlService.shortenURL(
        originalUrl.trim(),
        customCode.trim() || null,
        parseInt(validityMinutes)
      );

      setResult(result);
      logger.info('URL shortened successfully', result);

      // Reset form
      setOriginalUrl('');
      setCustomCode('');
      setValidityMinutes(30);

    } catch (err) {
      const errorMessage = err.message || 'Failed to shorten URL';
      setError(errorMessage);
      logger.error('URL shortening failed', { error: errorMessage, originalUrl });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSnackbar({ open: true, message: 'Copied to clipboard!' });
      logger.info('URL copied to clipboard', { url: text });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to copy to clipboard' });
      logger.error('Failed to copy to clipboard', err);
    }
  };

  const openUrl = (url) => {
    window.open(url, '_blank');
    logger.info('URL opened in new tab', { url });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          URL Shortener
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Create short, manageable links from long URLs with custom codes and expiry times
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Original URL"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            placeholder="https://example.com/very-long-url"
            margin="normal"
            required
            error={!!error && !originalUrl.trim()}
            helperText="Enter the URL you want to shorten"
          />

          <TextField
            fullWidth
            label="Custom Short Code (Optional)"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="my-custom-code"
            margin="normal"
            helperText="Leave empty for auto-generated code. Must be alphanumeric, 3-20 characters"
          />

          <TextField
            fullWidth
            type="number"
            label="Validity Period (Minutes)"
            value={validityMinutes}
            onChange={(e) => setValidityMinutes(e.target.value)}
            margin="normal"
            inputProps={{ min: 1, max: 10080 }}
            helperText="How long the short URL should remain active (default: 30 minutes)"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Shortening...' : 'Shorten URL'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {result && (
          <Card sx={{ mb: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                URL Shortened Successfully!
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TextField
                  fullWidth
                  label="Short URL"
                  value={result.shortUrl}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <Box>
                        <IconButton onClick={() => copyToClipboard(result.shortUrl)}>
                          <ContentCopy />
                        </IconButton>
                        <IconButton onClick={() => openUrl(result.shortUrl)}>
                          <Launch />
                        </IconButton>
                      </Box>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                />
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Original URL:</strong> {result.originalUrl}
              </Typography>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Short Code:</strong> {result.shortCode}
              </Typography>
              
              <Typography variant="body2">
                <strong>Expires:</strong> {new Date(result.expiryTime).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default URLShortener;
