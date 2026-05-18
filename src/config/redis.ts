import IORedis, { RedisOptions } from "ioredis";
import { env } from "./env";

const baseRedisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
};

export function createRedisConnection(options: RedisOptions = {}) {
  const redisOptions = {
    ...baseRedisOptions,
    ...options,
  };

  if (env.redisUrl) {
    return new IORedis(env.redisUrl, redisOptions);
  }

  return new IORedis({
    host: env.redisHost,
    port: env.redisPort,
    ...redisOptions,
  });
}

export const connection = createRedisConnection();
