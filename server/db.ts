import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

// Configuration de la base de données Neon PostgreSQL pour production et développement
const NEON_DATABASE_URL = "postgresql://neondb_owner:npg_mtSpzriYuV56@ep-round-lake-a8zn7f2c-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

// Utiliser toujours la base de données Neon fournie par l'utilisateur
process.env.DATABASE_URL = NEON_DATABASE_URL;
console.log("Using Neon PostgreSQL database for production and development");

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });