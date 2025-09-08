import logger from '../middleware/logger';

class URLService {
  constructor() {
    this.urls = this.loadURLs();
    this.baseUrl = window.location.origin;
  }

  loadURLs() {
    try {
      const stored = localStorage.getItem('shortened_urls');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      logger.error('Failed to load URLs from storage', e);
      return {};
    }
  }

  saveURLs() {
    try {
      localStorage.setItem('shortened_urls', JSON.stringify(this.urls));
      logger.info('URLs saved to storage');
    } catch (e) {
      logger.error('Failed to save URLs to storage', e);
    }
  }

  generateShortCode(customCode = null) {
    if (customCode) {
      // Validate custom shortcode
      if (!/^[a-zA-Z0-9]+$/.test(customCode)) {
        throw new Error('Custom shortcode must be alphanumeric');
      }
      if (customCode.length < 3 || customCode.length > 20) {
        throw new Error('Custom shortcode must be between 3-20 characters');
      }
      if (this.urls[customCode]) {
        throw new Error('Custom shortcode already exists');
      }
      return customCode;
    }

    // Generate random shortcode
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    do {
      result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.urls[result]); // Ensure uniqueness

    return result;
  }

  validateURL(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  shortenURL(originalUrl, customCode = null, validityMinutes = 30) {
    logger.info('Attempting to shorten URL', { originalUrl, customCode, validityMinutes });

    // Validate URL
    if (!this.validateURL(originalUrl)) {
      const error = 'Invalid URL format';
      logger.error(error, { originalUrl });
      throw new Error(error);
    }

    // Generate shortcode
    const shortCode = this.generateShortCode(customCode);
    
    // Calculate expiry time
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + validityMinutes);

    // Create URL entry
    const urlEntry = {
      originalUrl,
      shortCode,
      createdAt: new Date().toISOString(),
      expiryTime: expiryTime.toISOString(),
      validityMinutes,
      clicks: 0,
      clickHistory: []
    };

    this.urls[shortCode] = urlEntry;
    this.saveURLs();

    logger.info('URL shortened successfully', { shortCode, originalUrl });

    return {
      shortCode,
      shortUrl: `${this.baseUrl}/${shortCode}`,
      originalUrl,
      expiryTime: expiryTime.toISOString(),
      validityMinutes
    };
  }

  getURL(shortCode) {
    const urlEntry = this.urls[shortCode];
    
    if (!urlEntry) {
      logger.warn('Short URL not found', { shortCode });
      return null;
    }

    // Check if expired
    if (new Date() > new Date(urlEntry.expiryTime)) {
      logger.warn('Short URL expired', { shortCode, expiryTime: urlEntry.expiryTime });
      return null;
    }

    return urlEntry;
  }

  redirectURL(shortCode) {
    const urlEntry = this.getURL(shortCode);
    
    if (!urlEntry) {
      return null;
    }

    // Record click
    const clickData = {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || 'direct'
    };

    urlEntry.clicks++;
    urlEntry.clickHistory.push(clickData);
    
    this.saveURLs();
    
    logger.info('URL accessed', { shortCode, originalUrl: urlEntry.originalUrl });

    return urlEntry.originalUrl;
  }

  getAllURLs() {
    return Object.values(this.urls).map(url => ({
      ...url,
      shortUrl: `${this.baseUrl}/${url.shortCode}`,
      isExpired: new Date() > new Date(url.expiryTime)
    }));
  }

  getURLStats(shortCode) {
    const urlEntry = this.urls[shortCode];
    
    if (!urlEntry) {
      return null;
    }

    return {
      ...urlEntry,
      shortUrl: `${this.baseUrl}/${shortCode}`,
      isExpired: new Date() > new Date(urlEntry.expiryTime),
      clicksByHour: this.getClicksByHour(urlEntry.clickHistory),
      clicksByDay: this.getClicksByDay(urlEntry.clickHistory)
    };
  }

  getClicksByHour(clickHistory) {
    const hourlyClicks = {};
    
    clickHistory.forEach(click => {
      const hour = new Date(click.timestamp).getHours();
      hourlyClicks[hour] = (hourlyClicks[hour] || 0) + 1;
    });

    return hourlyClicks;
  }

  getClicksByDay(clickHistory) {
    const dailyClicks = {};
    
    clickHistory.forEach(click => {
      const day = new Date(click.timestamp).toDateString();
      dailyClicks[day] = (dailyClicks[day] || 0) + 1;
    });

    return dailyClicks;
  }
}

const urlService = new URLService();
export default urlService;
