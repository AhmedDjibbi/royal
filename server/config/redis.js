import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redisClient = null;
let isRedisConnected = false;

if (process.env.VERCEL) {
  console.log('ℹ️ Redis cache is disabled for this Vercel deployment.');
} else {
  try {
    redisClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 2000,
        // Redis is optional. Stop retrying quickly so the API can start and use MongoDB.
        reconnectStrategy: (retries) => (retries >= 2 ? false : 250)
      }
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) console.warn('⚠️  Redis Client Connection Error:', err.message);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('⚡ Redis Cache Server Connected Successfully!');
      isRedisConnected = true;
    });

    // Connect in the background: an unavailable Redis must never block API startup.
    redisClient.connect().catch(() => {
      isRedisConnected = false;
      console.warn('⚠️  Redis is unavailable. The API will use direct MongoDB queries.');
    });
  } catch (error) {
    console.warn('⚠️  Could not initialize Redis client:', error.message);
    isRedisConnected = false;
  }
}

// Resilient API wrappers for redis keys
export const cacheSet = async (key, value, durationSeconds = 3600) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    await redisClient.setEx(key, durationSeconds, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error setting Redis key ${key}:`, err);
    return false;
  }
};

export const cacheGet = async (key) => {
  if (!isRedisConnected || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error(`Error getting Redis key ${key}:`, err);
    return null;
  }
};

export const cacheFlush = async (key) => {
  if (!isRedisConnected || !redisClient) return false;
  try {
    await redisClient.del(key);
    console.log(`🧹 Cache cleared for key: "${key}"`);
    return true;
  } catch (err) {
    console.error(`Error flushing Redis key ${key}:`, err);
    return false;
  }
};

export { redisClient, isRedisConnected };
export default redisClient;
