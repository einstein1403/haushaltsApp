// Simple in-memory cache implementation
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  set(key, value, ttlSeconds = 300) { // Default 5 minutes
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }

    // Set the value
    this.cache.set(key, {
      value,
      createdAt: Date.now(),
      ttl: ttlSeconds * 1000
    });

    // Set expiration timer
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttlSeconds * 1000);

    this.timers.set(key, timer);
  }

  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() - item.createdAt > item.ttl) {
      this.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    // Clear timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }

    // Remove from cache
    this.cache.delete(key);
  }

  clear() {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }

    this.cache.clear();
    this.timers.clear();
  }

  size() {
    return this.cache.size;
  }

  // Get cache statistics
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: process.memoryUsage()
    };
  }
}

// Cache middleware factory
const cacheMiddleware = (ttlSeconds = 300, keyGenerator = null) => {
  return (req, res, next) => {
    // Generate cache key
    const key = keyGenerator 
      ? keyGenerator(req) 
      : `${req.method}:${req.path}:${JSON.stringify(req.query)}:${req.user?.id || 'anonymous'}`;

    // Try to get from cache
    const cached = cache.get(key);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.json(cached);
    }

    // Store original json method
    const originalJson = res.json;

    // Override json method to cache response
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(key, data, ttlSeconds);
        res.set('X-Cache', 'MISS');
      }
      
      // Call original method
      return originalJson.call(this, data);
    };

    next();
  };
};

// Invalidation helpers
const invalidateUserCache = (userId) => {
  const keys = Array.from(cache.cache.keys());
  keys.forEach(key => {
    if (key.includes(`users`) || key.includes(`:${userId}:`)) {
      cache.delete(key);
    }
  });
};

const invalidateTaskCache = () => {
  const keys = Array.from(cache.cache.keys());
  keys.forEach(key => {
    if (key.includes('tasks') || key.includes('stats')) {
      cache.delete(key);
    }
  });
};

// Create cache instance
const cache = new MemoryCache();

module.exports = {
  cache,
  cacheMiddleware,
  invalidateUserCache,
  invalidateTaskCache
};