const redis = require('redis');
require('dotenv').config();

let redisClient = null;

const initializeRedis = async () => {
  redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
  });

  redisClient.on('error', (err) => {
    console.error('❌ Redis error:', err);
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis connected');
  });

  await redisClient.connect();
  return redisClient;
};

const getRedis = () => {
  if (!redisClient) throw new Error('Redis not initialized');
  return redisClient;
};

// Cache operations
const cacheSet = async (key, value, expiresIn = 3600) => {
  const client = getRedis();
  await client.setEx(key, expiresIn, JSON.stringify(value));
};

const cacheGet = async (key) => {
  const client = getRedis();
  const value = await client.get(key);
  return value ? JSON.parse(value) : null;
};

const cacheDel = async (key) => {
  const client = getRedis();
  await client.del(key);
};

module.exports = {
  initializeRedis,
  getRedis,
  cacheSet,
  cacheGet,
  cacheDel,
};
