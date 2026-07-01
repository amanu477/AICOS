import app from "./app";
import { logger } from "./lib/logger";
import { getRedisConnection } from "./lib/redis";
import { startSyncWorker } from "./queues/shopify.queue";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Initialize Redis connection and start workers if available
getRedisConnection();
const worker = startSyncWorker();
if (!worker) {
  logger.warn("Shopify sync worker not started — Redis unavailable. Set REDIS_URL to enable background jobs.");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
