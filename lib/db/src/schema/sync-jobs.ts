import { pgTable, text, uuid, integer, timestamp, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const syncJobStatusEnum = pgEnum("sync_job_status", ["queued", "running", "done", "failed", "cancelled"]);
export const syncJobTypeEnum = pgEnum("sync_job_type", [
  "full_sync", "products", "collections", "customers", "orders", "inventory", "variants"
]);

export const syncJobsTable = pgTable("sync_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  storeId: uuid("store_id").notNull(),
  type: syncJobTypeEnum("type").notNull(),
  status: syncJobStatusEnum("status").notNull().default("queued"),
  cursor: text("cursor"),
  totalRecords: integer("total_records").default(0),
  processedRecords: integer("processed_records").default(0),
  errorMessage: text("error_message"),
  errorCount: integer("error_count").default(0),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (t) => [
  index("sync_jobs_store_id_idx").on(t.storeId),
  index("sync_jobs_status_idx").on(t.storeId, t.status),
]);

export const insertSyncJobSchema = createInsertSchema(syncJobsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSyncJob = z.infer<typeof insertSyncJobSchema>;
export type SyncJob = typeof syncJobsTable.$inferSelect;
