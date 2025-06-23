import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  credits: integer("credits").default(10).notNull(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const images = pgTable("images", {
  id: varchar("id").primaryKey().notNull(),
  ownerId: varchar("owner_id").notNull(),
  url: text("url").notNull(),
  filename: varchar("filename"),
  size: integer("size"),
  width: integer("width"),
  height: integer("height"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const edits = pgTable("edits", {
  id: varchar("id").primaryKey().notNull(),
  baseImageId: varchar("base_image_id").notNull(),
  resultUrl: text("result_url").notNull(),
  prompt: text("prompt").notNull(),
  aiPrompt: text("ai_prompt"),
  settings: jsonb("settings"),
  creditCost: integer("credit_cost").default(5).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  imageId: varchar("image_id"),
  role: varchar("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertImage = typeof images.$inferInsert;
export type Image = typeof images.$inferSelect;

export type InsertEdit = typeof edits.$inferInsert;
export type Edit = typeof edits.$inferSelect;

export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;

export const insertImageSchema = createInsertSchema(images).omit({
  id: true,
  createdAt: true,
});

export const insertEditSchema = createInsertSchema(edits).omit({
  id: true,
  createdAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});
