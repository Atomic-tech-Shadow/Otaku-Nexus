import { drizzle } from "drizzle-orm/postgres-js";
import { Pool } from "pg";
import * as schema from "./shared/schema";

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle({ client: pool, schema });