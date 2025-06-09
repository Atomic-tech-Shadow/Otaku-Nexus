import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set, using default PostgreSQL connection");
  process.env.DATABASE_URL = "postgresql://localhost:5432/replit";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });