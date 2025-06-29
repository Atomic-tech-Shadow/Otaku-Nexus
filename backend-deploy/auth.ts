import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { type RequestHandler } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const SESSION_SECRET = process.env.SESSION_SECRET || "your-session-secret";

export function getSession() {
  return {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  };
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateRandomToken(): string {
  return jwt.sign({ random: Math.random() }, JWT_SECRET, { expiresIn: "1h" });
}

export async function setupAuth(app: any) {
  // Auth setup for production deployment
  console.log('Auth configured for production');
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    
    req.userId = decoded.userId;
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};