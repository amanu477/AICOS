import { Queue, Worker, type Job } from "bullmq";
import { getRedisConnection, isRedisAvailable } from "../lib/redis.js";
import { runFullSync, syncProducts, syncCollections, syncCustomers, syncOrders } from "../services/sync.service.js";
import { logger } from "../lib/logger.js";

export const SHOPIFY_QUEUE_NAME = "shopify-sync";

export interface SyncJobData {
  storeId: string;
  jobId: string;
  type: "full_sync" | "products" | "collections" | "customers" | "orders";
}

let queue: Queue<SyncJobData> | null = null;

export function getShopifyQueue(): Queue<SyncJobData> | null {
  if (!isRedisAvailable()) return null;
  if (!queue) {
    const connection = getRedisConnection()!;
    queue = new Queue<SyncJobData>(SHOPIFY_QUEUE_NAME, { connection });
    logger.info("Shopify sync queue initialized");
  }
  return queue;
}

export async function enqueueSyncJob(data: SyncJobData): Promise<string | null> {
  const q = getShopifyQueue();
  if (!q) {
    logger.warn({ storeId: data.storeId }, "Redis unavailable — running sync inline");
    await runSyncInline(data);
    return null;
  }
  const job = await q.add("sync", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  });
  logger.info({ jobId: job.id, storeId: data.storeId, type: data.type }, "Sync job enqueued");
  return job.id ?? null;
}

async function runSyncInline(data: SyncJobData): Promise<void> {
  try {
    await runFullSync(data.storeId, data.jobId);
  } catch (err) {
    logger.error({ err, storeId: data.storeId }, "Inline sync failed");
  }
}

export function startSyncWorker(): Worker<SyncJobData> | null {
  if (!isRedisAvailable()) return null;
  const connection = getRedisConnection()!;

  const worker = new Worker<SyncJobData>(
    SHOPIFY_QUEUE_NAME,
    async (job: Job<SyncJobData>) => {
      const { storeId, jobId, type } = job.data;
      logger.info({ jobId, storeId, type }, "Processing sync job");

      if (type === "full_sync") {
        await runFullSync(storeId, jobId);
      } else {
        // Partial sync types can be added here
        await runFullSync(storeId, jobId);
      }
    },
    {
      connection,
      concurrency: 2,
      limiter: { max: 10, duration: 1000 },
    },
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id, storeId: job.data.storeId }, "Sync job completed");
  });

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, storeId: job?.data.storeId, err: err.message }, "Sync job failed");
  });

  logger.info("Shopify sync worker started");
  return worker;
}
