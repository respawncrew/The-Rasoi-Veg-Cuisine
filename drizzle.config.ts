/** @type {import('drizzle-kit').Config} */
export default {
    schema: "./drizzle/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
      url: "sqlite.db",
    },
  };