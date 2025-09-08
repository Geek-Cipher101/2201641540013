import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Alert
} from '@mui/material';
import { Launch, ContentCopy, Refresh } from '@mui/icons-material';
import urlService from '../services/urlService';
import logger from '../middleware/logger';

const URLStatistics = () => {
  const [urls, setUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadURLs();
  }, []);

  const loadURLs = () => {
    try {
      const allUrls = urlService.getAllURLs();
      setUrls(allUrls);
      logger.info('URLs loaded for statistics', { count: allUrls.length });
    } catch (error) {
      logger.error('Failed to load URLs for statistics', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      logger.info('URL copied to clipboard from statistics', { url: text });
    } catch (err) {
      logger.error('Failed to copy to clipboard from statistics', err);
    }
  };

  const openUrl = (url) => {
    window.open(url, '_blank');
    logger.info('URL opened from statistics', { url });
  };

  const getDetailedStats = (shortCode) => {
    const stats = urlService.getURLStats(shortCode);
    setSelectedUrl(stats);
    logger.info('Detailed stats viewed', { shortCode });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusChip = (url) => {
    if (url.isExpired) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    return <Chip label="Active" color="success" size="small" />;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading statistics...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            URL Statistics
          </Typography>
          <IconButton onClick={loadURLs} title="Refresh">
            <Refresh />
          </IconButton>
        </Box>

        {urls.length === 0 ? (
          <Alert severity="info">
            No shortened URLs found. Create some URLs first to see statistics.
          </Alert>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              All Shortened URLs ({urls.length})
            </Typography>
            
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Short Code</TableCell>
                    <TableCell>Original URL</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Clicks</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urls.map((url) => (
                    <TableRow key={url.shortCode} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {url.shortCode}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 300, 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={url.originalUrl}
                        >
                          {url.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(url.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(url.expiryTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {url.clicks}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(url)}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small" 
                            onClick={() => copyToClipboard(url.shortUrl)}
                            title="Copy short URL"
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => openUrl(url.shortUrl)}
                            title="Open short URL"
                          >
                            <Launch fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => getDetailedStats(url.shortCode)}
                            title="View detailed stats"
                          >
                            📊
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedUrl && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Detailed Statistics for: {selectedUrl.shortCode}
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        URL Information
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Short URL:</strong> {selectedUrl.shortUrl}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Original URL:</strong> {selectedUrl.originalUrl}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Created:</strong> {formatDate(selectedUrl.createdAt)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Expires:</strong> {formatDate(selectedUrl.expiryTime)}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Validity Period:</strong> {selectedUrl.validityMinutes} minutes
                      </Typography>
                      <Typography variant="body2">
                        <strong>Total Clicks:</strong> {selectedUrl.clicks}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Click History
                      </Typography>
                      {selectedUrl.clickHistory.length > 0 ? (
                        <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                          {selectedUrl.clickHistory.slice(0, 10).map((click, index) => (
                            <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                              {formatDate(click.timestamp)} - {click.referrer || 'Direct'}
                            </Typography>
                          ))}
                          {selectedUrl.clickHistory.length > 10 && (
                            <Typography variant="body2" color="text.secondary">
                              ... and {selectedUrl.clickHistory.length - 10} more clicks
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No clicks recorded yet
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Paper>
    </Container>
  );
};

export default URLStatistics;
