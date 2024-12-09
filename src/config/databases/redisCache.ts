import Redis, { Cluster } from 'ioredis';

class RedisCache {
  private redis: Cluster; // Use the Cluster type from ioredis

  constructor() {
    const clusterConfig = [
      {
        host: process.env.AWS_REDIS_OSS_ENDPOINT || '',
        port: Number(process.env.AWS_REDIS_OSS_PORT || ''),
      },
    ];

    this.redis = new Redis.Cluster(clusterConfig, {
    });

    this.redis.on('connect', () => {
      console.log('Connected to ElastiCache Redis cluster successfully!');
    });

    this.redis.on('error', (err: any) => {
      console.error('Redis Client Error:', err);
    });
  }

  async set(key: string, value: any, ttl: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export const redisCache = new RedisCache();
