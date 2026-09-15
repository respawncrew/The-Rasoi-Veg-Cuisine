import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, menuItems, categories, enquiries, reviews, businessSettings, InsertMenuItem } from "../drizzle/schema";
import { ENV } from './_core/env';
import { menuSeed } from "@shared/menuSeed";

let _db: ReturnType<typeof drizzle> | null = null;

// In-Memory Fallbacks for Offline/Development Mode
const inMemoryReviews: any[] = [
  { id: 1, name: "Aman Verma", quote: "Amazing food and super fast packaging!", rating: 5, approved: 1, createdAt: new Date() }
];

// 💥 Auto-seed all 83+ dishes from menuSeed if in-memory is used
const inMemoryMenu: any[] = menuSeed.map((item, index) => ({
  id: index + 1,
  name: item.name,
  category: item.category,
  description: item.description,
  price: item.price,
  available: 1,
  imageUrl: "",
  featured: item.tag === "Featured" ? 1 : 0,
}));

const inMemoryEnquiries: any[] = [];

let inMemorySettings: typeof businessSettings.$inferSelect = {
  id: 1,
  businessName: "The Rasoi Veg. Cuisine",
  phone: "8006771779",
  location: "Haridwar, Uttarakhand, India",
  hours: "7:00 AM to 9:00 PM",
  pureVegetarian: 1,
  takeawayAvailable: 1,
  orderingNote: "Pure vegetarian · Cloud Kitchen · No Dine-In · Order on Zomato & Swiggy",
  zomatoUrl: "https://www.zomato.com/",
  swiggyUrl: "https://www.swiggy.com/",
  updatedAt: new Date()
};

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { 
      _db = drizzle(process.env.DATABASE_URL); 
    } catch (error) { 
      console.warn("[Database] Failed to connect, using in-memory fallback:", error); 
      _db = null; 
    }
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

// 💥 Auto-Seeds Database on First Fetch if DB is empty
export async function listMenuItems() {
  const db = await getDb();
  if (!db) return inMemoryMenu;

  try {
    const dbItems = await db.select({ item: menuItems, category: categories.name })
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .orderBy(desc(menuItems.featured), menuItems.sortOrder);

    // If Database is connected but empty, auto seed it with initial items
    if (dbItems.length === 0 && menuSeed.length > 0) {
      console.log("[Database] Seeding 83+ initial menu items to Database...");
      for (const item of menuSeed) {
        await db.insert(menuItems).values({
          name: item.name,
          description: item.description,
          price: item.price,
          available: 1,
        });
      }
      return listMenuItems(); // Re-fetch after seeding
    }

    return dbItems.map(({ item, category }) => ({
      id: item.id,
      name: item.name,
      category: category || "Main Course",
      description: item.description,
      price: item.price,
      available: item.available,
      imageUrl: item.imageUrl,
      featured: item.featured
    }));
  } catch (error) {
    console.error("[Database Error] Fetching menu failed, using fallback:", error);
    return inMemoryMenu;
  }
}

export async function createMenuItem(item: any) {
  const db = await getDb();
  if (!db) {
    const newItem = { 
      id: Date.now(), 
      available: 1, 
      name: item.name,
      category: item.category || "Main Course",
      description: item.description || "",
      price: item.price || "Ask us",
      imageUrl: item.imageUrl || ""
    };
    inMemoryMenu.unshift(newItem); // Add at top
    return newItem;
  }

  await db.insert(menuItems).values({
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    available: item.available ?? 1,
  });
  return item;
}

export async function updateMenuItem(id: number, item: Partial<InsertMenuItem>) {
  const db = await getDb();
  if (!db) {
    const index = inMemoryMenu.findIndex((i) => i.id === id);
    if (index !== -1) {
      inMemoryMenu[index] = { ...inMemoryMenu[index], ...item };
    }
    return { id, ...item };
  }
  await db.update(menuItems).set(item).where(eq(menuItems.id, id));
  return { id, ...item };
}

export async function deleteMenuItem(id: number) {
  const db = await getDb();
  if (!db) {
    const index = inMemoryMenu.findIndex((i) => i.id === id);
    if (index !== -1) inMemoryMenu.splice(index, 1);
    return { id };
  }
  await db.delete(menuItems).where(eq(menuItems.id, id));
  return { id };
}

export async function createEnquiry(input: { name: string; phone: string; message?: string }) {
  const db = await getDb();
  if (!db) {
    inMemoryEnquiries.push({ id: Date.now(), ...input });
    return { success: true };
  }
  await db.insert(enquiries).values(input);
  return { success: true };
}

export async function createReview(input: { name: string; quote: string; rating: number }) {
  const db = await getDb();
  if (!db) {
    inMemoryReviews.unshift({
      id: Date.now(),
      name: input.name,
      quote: input.quote,
      rating: input.rating,
      approved: 1,
      createdAt: new Date()
    });
    return { success: true };
  }
  await db.insert(reviews).values({
    name: input.name,
    quote: input.quote,
    rating: input.rating,
    approved: 1,
  });
  return { success: true };
}

export async function listReviews(approvedOnly = true) {
  const db = await getDb();
  if (!db) {
    return approvedOnly ? inMemoryReviews.filter(r => r.approved === 1) : inMemoryReviews;
  }
  return db.select().from(reviews).where(approvedOnly ? eq(reviews.approved, 1) : undefined).orderBy(desc(reviews.createdAt));
}

export async function deleteReview(id: number) {
  const db = await getDb();
  if (!db) {
    const index = inMemoryReviews.findIndex((r) => r.id === id);
    if (index !== -1) inMemoryReviews.splice(index, 1);
    return { id };
  }
  await db.delete(reviews).where(eq(reviews.id, id));
  return { id };
}

export async function getBusinessSettings() {
  const db = await getDb();
  if (!db) return inMemorySettings;
  const result = await db.select().from(businessSettings).limit(1);
  return result[0] || inMemorySettings;
}

export async function updateBusinessSettings(id: number, input: Partial<typeof businessSettings.$inferInsert>) {
  const db = await getDb();
  if (!db) {
    inMemorySettings = { 
      ...inMemorySettings, 
      ...input,
      orderingNote: input.orderingNote ?? inMemorySettings.orderingNote 
    };
    return inMemorySettings;
  }
  await db.update(businessSettings).set(input).where(eq(businessSettings.id, id));
  return { id, ...input };
}