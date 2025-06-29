import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Configuration directe de la base PostgreSQL Replit - pas de variables d'environnement
const REPLIT_DATABASE_URL = "postgresql://neondb_owner:npg_1glHEU4nXRFx@ep-empty-darkness-a68fyn94.us-west-2.aws.neon.tech:5432/neondb?sslmode=require";

console.log("Using Replit PostgreSQL database (configured directly)");

export const pool = new Pool({ 
  connectionString: REPLIT_DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
export const db = drizzle({ client: pool, schema });