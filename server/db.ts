import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Use Replit PostgreSQL database
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

console.log("Using Replit PostgreSQL database");

export const pool = new Pool({ 
  connectionString: DATABASE_URL
});
export const db = drizzle({ client: pool, schema });