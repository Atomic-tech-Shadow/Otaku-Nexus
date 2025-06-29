import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

console.log("Using SQLite database for Replit environment");

const sqlite = new Database(':memory:');
export const db = drizzle(sqlite, { schema });

// Create tables on startup
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    password TEXT NOT NULL,
    isAdmin BOOLEAN DEFAULT false,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quizzes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    difficulty TEXT NOT NULL,
    category TEXT NOT NULL,
    questions TEXT NOT NULL,
    timeLimit INTEGER,
    xpReward INTEGER DEFAULT 10,
    featured BOOLEAN DEFAULT false,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    quizId INTEGER NOT NULL,
    score INTEGER NOT NULL,
    totalQuestions INTEGER NOT NULL,
    xpEarned INTEGER NOT NULL,
    completedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    FOREIGN KEY (quizId) REFERENCES quizzes(id)
  );

  CREATE TABLE IF NOT EXISTS chat_rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    isPrivate BOOLEAN DEFAULT false,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roomId INTEGER NOT NULL,
    userId TEXT NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (roomId) REFERENCES chat_rooms(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS admin_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    published BOOLEAN DEFAULT false,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Insert default data
sqlite.exec(`
  INSERT OR IGNORE INTO users (id, email, firstName, lastName, password, isAdmin) 
  VALUES ('699a99bd-35bd-4aac-b69d-7475602adfbd', 'sorokomarco@gmail.com', 'Cid', 'Kageno', '$2a$10$..hash..', true);

  INSERT OR IGNORE INTO chat_rooms (id, name, description) 
  VALUES (1, 'Général', 'Salon de discussion principal');

  INSERT OR IGNORE INTO quizzes (title, description, difficulty, category, questions, xpReward, featured)
  VALUES ('Quiz de test', 'Un quiz pour tester vos connaissances', 'facile', 'général', 
    '[{"question":"Quelle est la capitale de la France?","options":["Paris","Londres","Berlin","Madrid"],"correct":0}]', 
    10, true);
`);