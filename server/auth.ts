import { Request, Response, NextFunction } from "express";
import { db } from "./db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

declare global {
  namespace Express {
    interface Request {
      user?: typeof users.$inferSelect;
      session?: { userId: string };
    }
  }
}

const sessions = new Map<string, { userId: string; expiresAt: Date }>();

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function createSession(userId: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  sessions.set(token, { userId, expiresAt });
  return token;
}

export function destroySession(token: string): void {
  sessions.delete(token);
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const session = sessions.get(token);

  if (!session || session.expiresAt < new Date()) {
    sessions.delete(token);
    return res.status(401).json({ error: "Session expired" });
  }

  const [user] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);

  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = user;
  req.session = { userId: user.id };
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden - insufficient permissions" });
    }

    next();
  };
}

export function canAccessUser(targetUserId: string, req: Request): boolean {
  if (!req.user) return false;
  
  if (req.user.role === "admin") return true;
  if (req.user.id === targetUserId) return true;
  
  return false;
}

export async function canAccessMarket(marketId: string, req: Request): Promise<boolean> {
  if (!req.user) return false;
  
  if (req.user.role === "admin") return true;
  if (req.user.role === "manager" && req.user.marketId === marketId) return true;
  
  return false;
}
