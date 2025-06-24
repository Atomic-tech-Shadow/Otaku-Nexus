import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using Neon PostgreSQL connection");
  process.env.DATABASE_URL = "postgresql://neondb_owner:npg_mtSpzriYuV56@ep-round-lake-a8zn7f2c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });