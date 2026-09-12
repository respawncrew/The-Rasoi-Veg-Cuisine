import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, menuItems, categories, enquiries, reviews, businessSettings, InsertMenuItem } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) { if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; } }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listMenuItems() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ item: menuItems, category: categories.name }).from(menuItems).leftJoin(categories, eq(menuItems.categoryId, categories.id)).orderBy(desc(menuItems.featured), menuItems.sortOrder);
}

export async function createMenuItem(item: InsertMenuItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(menuItems).values(item);
  return item;
}

export async function updateMenuItem(id: number, item: Partial<InsertMenuItem>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(menuItems).set(item).where(eq(menuItems.id, id));
  return { id, ...item };
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(menuItems).where(eq(menuItems.id, id));
  return { id };
}

export async function createEnquiry(input: { name: string; phone: string; message?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(enquiries).values(input);
  return { success: true };
}

export async function createReview(input: { name: string; quote: string; rating: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(reviews).values({
    name: input.name,
    quote: input.quote,
    rating: input.rating,
    approved: 0,
  });
  return { success: true };
}

export async function listReviews(approvedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(reviews).where(approvedOnly ? eq(reviews.approved, 1) : undefined).orderBy(desc(reviews.createdAt));
}

export async function getBusinessSettings() {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businessSettings).limit(1);
  return result[0];
}

export async function updateBusinessSettings(id: number, input: Partial<typeof businessSettings.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(businessSettings).set(input).where(eq(businessSettings.id, id));
  return { id, ...input };
}