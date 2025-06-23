import {
  users,
  images,
  edits,
  chatMessages,
  type User,
  type UpsertUser,
  type Image,
  type InsertImage,
  type Edit,
  type InsertEdit,
  type ChatMessage,
  type InsertChatMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserCredits(userId: string, credits: number): Promise<User>;
  updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User>;

  // Image operations
  createImage(image: InsertImage): Promise<Image>;
  getUserImages(userId: string): Promise<Image[]>;
  getImage(id: string): Promise<Image | undefined>;
  deleteImage(id: string): Promise<void>;

  // Edit operations
  createEdit(edit: InsertEdit): Promise<Edit>;
  getUserEdits(userId: string): Promise<Edit[]>;
  getImageEdits(imageId: string): Promise<Edit[]>;

  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getUserChatMessages(userId: string, imageId?: string): Promise<ChatMessage[]>;
  clearUserChat(userId: string, imageId?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserCredits(userId: string, credits: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, customerId: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId: customerId, 
        stripeSubscriptionId: subscriptionId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Image operations
  async createImage(imageData: InsertImage): Promise<Image> {
    const [image] = await db.insert(images).values({
      id: nanoid(),
      ...imageData,
    }).returning();
    return image;
  }

  async getUserImages(userId: string): Promise<Image[]> {
    return await db
      .select()
      .from(images)
      .where(eq(images.ownerId, userId))
      .orderBy(desc(images.createdAt));
  }

  async getImage(id: string): Promise<Image | undefined> {
    const [image] = await db.select().from(images).where(eq(images.id, id));
    return image;
  }

  async deleteImage(id: string): Promise<void> {
    await db.delete(images).where(eq(images.id, id));
  }

  // Edit operations
  async createEdit(editData: InsertEdit): Promise<Edit> {
    const [edit] = await db.insert(edits).values({
      id: nanoid(),
      ...editData,
    }).returning();
    return edit;
  }

  async getUserEdits(userId: string): Promise<Edit[]> {
    return await db
      .select()
      .from(edits)
      .innerJoin(images, eq(edits.baseImageId, images.id))
      .where(eq(images.ownerId, userId))
      .orderBy(desc(edits.createdAt));
  }

  async getImageEdits(imageId: string): Promise<Edit[]> {
    return await db
      .select()
      .from(edits)
      .where(eq(edits.baseImageId, imageId))
      .orderBy(desc(edits.createdAt));
  }

  // Chat operations
  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values({
      id: nanoid(),
      ...messageData,
    }).returning();
    return message;
  }

  async getUserChatMessages(userId: string, imageId?: string): Promise<ChatMessage[]> {
    const conditions = [eq(chatMessages.userId, userId)];
    if (imageId) {
      conditions.push(eq(chatMessages.imageId, imageId));
    }

    return await db
      .select()
      .from(chatMessages)
      .where(and(...conditions))
      .orderBy(chatMessages.createdAt);
  }

  async clearUserChat(userId: string, imageId?: string): Promise<void> {
    const conditions = [eq(chatMessages.userId, userId)];
    if (imageId) {
      conditions.push(eq(chatMessages.imageId, imageId));
    }

    await db.delete(chatMessages).where(and(...conditions));
  }
}

export const storage = new DatabaseStorage();
