import { eq, desc } from "drizzle-orm";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { InsertUser, users, menuItems, categories, enquiries, reviews, businessSettings, InsertMenuItem } from "../drizzle/schema";
import { ENV } from './_core/env';
import { menuSeed } from "@shared/menuSeed";
import fs from "fs";
import path from "path";

// Direct SQLite setup
const sqlite = new Database("sqlite.db");
export const db = drizzle(sqlite);

// File Persistence Helper for Offline/Local Dev Mode
const STORAGE_FILE = path.join(process.cwd(), "data_store.json");

interface LocalData {
  menu: any[];
  reviews: any[];
  enquiries: any[];
  settings: typeof businessSettings.$inferSelect;
}

// Initial Default Values
const defaultData: LocalData = {
  reviews: [
    { id: 1, name: "Aman Verma", quote: "Amazing food and super fast packaging!", rating: 5, approved: 1, createdAt: new Date().toISOString() }
  ],
  menu: menuSeed.map((item, index) => ({
    id: index + 1,
    name: item.name,
    category: item.category,
    description: item.description,
    price: item.price || "Ask us",
    available: 1,
    imageUrl: "",
    featured: item.tag === "Featured" ? 1 : 0,
  })),
  enquiries: [],
  settings: {
    id: 1,
    businessName: "The Rasoi Veg. Cuisine",
    phone: "7467881994",
    location: "Haridwar, Uttarakhand, India",
    hours: "7:00 AM to 9:00 PM",
    pureVegetarian: 1,
    takeawayAvailable: 1,
    orderingNote: "Pure vegetarian · Cloud Kitchen · No Dine-In · Order on Zomato & Swiggy",
    zomatoUrl: "https://www.zomato.com/",
    swiggyUrl: "https://www.swiggy.com/",
    updatedAt: new Date().toISOString()
  }
};

// Load or Initialize File Storage
function loadLocalStore(): LocalData {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const fileData = fs.readFileSync(STORAGE_FILE, "utf-8");
      const parsed: LocalData = JSON.parse(fileData);
      
      if (parsed.settings && parsed.settings.phone === "8006771779") {
        parsed.settings.phone = "7467881994";
        saveLocalStore(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.warn("[Local Storage] Error reading data_store.json, using defaults:", err);
  }
  saveLocalStore(defaultData);
  return defaultData;
}

function saveLocalStore(data: LocalData) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[Local Storage] Failed to save local state:", err);
  }
}

let localStore = loadLocalStore();

export async function getDb() {
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  
  const values: InsertUser = { openId: user.openId };
  if (user.name) values.name = user.name;
  if (user.email) values.email = user.email;
  if (user.loginMethod) values.loginMethod = user.loginMethod;
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user');

  try {
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: values
    });
  } catch (error) {
    console.error("[SQLite User Upsert Error]", error);
  }
}

export async function getUserByOpenId(openId: string) {
  try {
    const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
    return result[0];
  } catch (error) {
    return undefined;
  }
}

export async function listMenuItems() {
  try {
    const dbItems = await db.select({ item: menuItems, category: categories.name })
      .from(menuItems)
      .leftJoin(categories, eq(menuItems.categoryId, categories.id))
      .orderBy(desc(menuItems.featured), menuItems.sortOrder);

    if (dbItems.length === 0 && menuSeed.length > 0) {
      for (const item of menuSeed) {
        await db.insert(menuItems).values({
          name: item.name,
          description: item.description,
          price: item.price || "Ask us",
          available: 1,
        });
      }
      return listMenuItems();
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
    return localStore.menu;
  }
}

export async function createMenuItem(item: any) {
  const safeItem = {
    name: item.name,
    description: item.description || "Fresh & Authentic",
    price: item.price ? String(item.price) : "Ask us",
    imageUrl: item.imageUrl || "",
    available: item.available ?? 1,
  };

  try {
    const result = await db.insert(menuItems).values(safeItem).returning();
    return result[0];
  } catch (error) {
    console.warn("[Database] SQLite Insert Error. Fallback to local store:", error);
    const newItem = { id: Date.now(), ...safeItem, category: item.category || "Main Course" };
    localStore.menu.unshift(newItem);
    saveLocalStore(localStore);
    return newItem;
  }
}

export async function updateMenuItem(id: number, item: Partial<InsertMenuItem>) {
  try {
    await db.update(menuItems).set(item).where(eq(menuItems.id, id));
  } catch (error) {
    console.warn("[Database] SQLite Update Error. Fallback to local store:", error);
    const index = localStore.menu.findIndex((i) => Number(i.id) === Number(id));
    if (index !== -1) {
      localStore.menu[index] = { ...localStore.menu[index], ...item };
      saveLocalStore(localStore);
    }
  }
  return { id, ...item };
}

export async function deleteMenuItem(id: number) {
  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));
  } catch (error) {
    console.warn("[Database] SQLite Delete Error. Fallback to local store delete:", error);
    localStore.menu = localStore.menu.filter((i) => Number(i.id) !== Number(id));
    saveLocalStore(localStore);
  }
  return { id };
}

export async function createEnquiry(input: { name: string; phone: string; message?: string }) {
  try {
    await db.insert(enquiries).values(input);
  } catch (error) {
    localStore.enquiries.push({ id: Date.now(), ...input });
    saveLocalStore(localStore);
  }
  return { success: true };
}

export async function createReview(input: { name: string; quote: string; rating: number }) {
  try {
    await db.insert(reviews).values({
      name: input.name,
      quote: input.quote,
      rating: input.rating,
      approved: 1,
    });
  } catch (error) {
    localStore.reviews.unshift({
      id: Date.now(),
      name: input.name,
      quote: input.quote,
      rating: input.rating,
      approved: 1,
      createdAt: new Date().toISOString()
    });
    saveLocalStore(localStore);
  }
  return { success: true };
}

export async function listReviews(approvedOnly = true) {
  try {
    return await db.select().from(reviews).where(approvedOnly ? eq(reviews.approved, 1) : undefined).orderBy(desc(reviews.createdAt));
  } catch (error) {
    return approvedOnly ? localStore.reviews.filter(r => r.approved === 1) : localStore.reviews;
  }
}

export async function deleteReview(id: number) {
  try {
    await db.delete(reviews).where(eq(reviews.id, id));
  } catch (error) {
    console.warn("[Database] SQLite Delete Review Error. Fallback to local store:", error);
    localStore.reviews = localStore.reviews.filter((r) => Number(r.id) !== Number(id));
    saveLocalStore(localStore);
  }
  return { id };
}

export async function getBusinessSettings() {
  try {
    const result = await db.select().from(businessSettings).limit(1);
    return result[0] || localStore.settings;
  } catch (error) {
    return localStore.settings;
  }
}

export async function updateBusinessSettings(id: number, input: Partial<typeof businessSettings.$inferInsert>) {
  try {
    await db.update(businessSettings).set(input).where(eq(businessSettings.id, id));
  } catch (error) {
    console.warn("[Database] SQLite Update Settings Error. Fallback to local store:", error);
    localStore.settings = { 
      ...localStore.settings, 
      ...input,
      orderingNote: input.orderingNote ?? localStore.settings.orderingNote 
    };
    saveLocalStore(localStore);
  }
  return localStore.settings;
}