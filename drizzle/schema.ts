import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// 1. USERS TABLE
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: text("email", { length: 320 }),
  loginMethod: text("loginMethod", { length: 64 }),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updatedAt").default("CURRENT_TIMESTAMP").notNull(),
  lastSignedIn: text("lastSignedIn").default("CURRENT_TIMESTAMP").notNull(),
});

// 2. CATEGORIES TABLE
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 80 }).notNull().unique(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
});

// 3. MENU ITEMS TABLE
export const menuItems = sqliteTable("menuItems", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("categoryId"),
  name: text("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  price: text("price", { length: 80 }),
  imageUrl: text("imageUrl"),
  available: integer("available").default(1).notNull(),
  featured: integer("featured").default(0).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
  updatedAt: text("updatedAt").default("CURRENT_TIMESTAMP").notNull(),
});

// 4. ENQUIRIES TABLE
export const enquiries = sqliteTable("enquiries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 120 }).notNull(),
  phone: text("phone", { length: 30 }).notNull(),
  message: text("message"),
  status: text("status", { enum: ["new", "contacted", "closed"] }).default("new").notNull(),
  createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
});

// 5. REVIEWS TABLE
export const reviews = sqliteTable("reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name", { length: 120 }).notNull(),
  quote: text("quote").notNull(),
  rating: integer("rating").default(5).notNull(),
  source: text("source", { length: 60 }),
  approved: integer("approved").default(0).notNull(),
  createdAt: text("createdAt").default("CURRENT_TIMESTAMP").notNull(),
});

// 6. BUSINESS SETTINGS TABLE
export const businessSettings = sqliteTable("businessSettings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  businessName: text("businessName", { length: 160 }).notNull(),
  phone: text("phone", { length: 30 }).notNull(),
  location: text("location", { length: 160 }).notNull(),
  hours: text("hours", { length: 160 }).notNull(),
  pureVegetarian: integer("pureVegetarian").default(1).notNull(),
  takeawayAvailable: integer("takeawayAvailable").default(1).notNull(),
  orderingNote: text("orderingNote", { length: 240 }),
  zomatoUrl: text("zomatoUrl"),
  swiggyUrl: text("swiggyUrl"),
  updatedAt: text("updatedAt").default("CURRENT_TIMESTAMP").notNull(),
});

// TYPES FOR TS ENFORCEMENT
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = typeof menuItems.$inferInsert;

export type Enquiry = typeof enquiries.$inferSelect;
export type InsertEnquiry = typeof enquiries.$inferInsert;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

export type BusinessSetting = typeof businessSettings.$inferSelect;
export type InsertBusinessSetting = typeof businessSettings.$inferInsert;