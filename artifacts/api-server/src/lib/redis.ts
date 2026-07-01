import { ConnectionOptions } from "bullmq";
import { logger } from "./logger.js";

let redisConnection: ConnectionOptions | null = null;
let redisAvailable = false;

export function getRedisConnection(): ConnectionOptions | null {
  if (redisConnection !== null) return redisConnection;

  const url = process.env.REDIS_URL;
  if (!url) {
    logger.warn("REDIS_URL not set — background job queue unavailable. Sync will run inline.");
    redisConnection = null;
    redisAvailable = false;
    return null;
  }

  try {
    const parsed = new URL(url);
    redisConnection = {
      host: parsed.hostname,
      port: parseInt(parsed.port || "6379", 10),
      password: parsed.password || undefined,
      tls: parsed.protocol === "rediss:" ? {} : undefined,
    };
    redisAvailable = true;
    logger.info({ host: parsed.hostname }, "Redis connection configured");
    return redisConnection;
  } catch (err) {
    logger.error({ err }, "Invalid REDIS_URL — background jobs unavailable");
    redisConnection = null;
    redisAvailable = false;
    return null;
  }
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}
