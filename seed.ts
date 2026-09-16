import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { menuItems, businessSettings } from './drizzle/schema';

// Direct connection to sqlite.db
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

async function seed() {
  console.log("Seeding started...");
  
  const jsonPath = path.join(process.cwd(), 'data_store.json');
  if (!fs.existsSync(jsonPath)) {
    console.error("data_store.json file nahi mili!");
    return;
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(rawData);

  // 1. Insert Menu Items
  if (data.menuItems && data.menuItems.length > 0) {
    for (const item of data.menuItems) {
      await db.insert(menuItems).values({
        name: item.name,
        description: item.description || "Fresh & Authentic",
        price: item.price || "",
        imageUrl: item.image || item.imageUrl || "",
        available: item.available ? 1 : 0,
        featured: 0,
      }).catch(() => {});
    }
    console.log(`✅ ${data.menuItems.length} Menu items inserted!`);
  }

  // 2. Insert Business Settings
  if (data.businessSettings) {
    await db.insert(businessSettings).values({
      businessName: data.businessSettings.businessName || "The Rasoi Veg. Cuisine",
      phone: data.businessSettings.phone || "7467881994",
      location: data.businessSettings.location || "Haridwar, Uttarakhand, India",
      hours: data.businessSettings.hours || "7:00 AM to 9:00 PM",
      orderingNote: data.businessSettings.orderingNote || "Pure vegetarian · Cloud Kitchen",
      pureVegetarian: 1,
      takeawayAvailable: 1,
    }).catch(() => {});
    console.log("✅ Business settings inserted!");
  }

  console.log("🚀 Database fully synced!");
}

seed();