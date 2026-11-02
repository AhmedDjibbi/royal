import { cacheGet, cacheSet } from '../config/redis.js';

/**
 * Highly reusable Redis Cache Middleware for Express JSON routes.
 * @param {string} cacheKey - The Redis key prefix to cache responses under.
 * @param {number} durationSeconds - Expiration duration. Defaults to 3600 (1 hour).
 */
export const checkCache = (cacheKey, durationSeconds = 3600) => {
  return async (req, res, next) => {
    try {
      const data = await cacheGet(cacheKey);
      if (data) {
        // Cache Hit! return the data directly
        return res.status(200).json({ source: 'Redis Cache (Middleware)', data });
      }

      // Cache Miss! Intercept res.send to capture database query results and save to Redis
      const originalSend = res.json;
      res.json = function (body) {
        res.json = originalSend; // Restore original function
        
        // Cache the parsed body if request was successful
        if (res.statusCode === 200 && body && body.data) {
          cacheSet(cacheKey, body.data, durationSeconds);
        }
        
        return originalSend.call(this, body);
      };
      
      next();
    } catch (err) {
      console.warn(`⚠️ Cache Middleware Error for key ${cacheKey}:`, err.message);
      next(); // Fail-safe: proceed to actual controllers on caching issues
    }
  };
};
