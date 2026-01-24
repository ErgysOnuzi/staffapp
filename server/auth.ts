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

// Role hierarchy: owner > admin > cfo/hr_admin > manager > supervisor > staff
export const ROLE_HIERARCHY = {
  owner: 7,
  admin: 6,
  cfo: 5,
  hr_admin: 5,
  manager: 4,
  supervisor: 3,
  staff: 1,
};

// Role groups for permission checking
export const EXECUTIVE_ROLES = ["owner", "admin", "cfo", "hr_admin"];
export const USER_MANAGEMENT_ROLES = ["owner", "admin", "hr_admin"];
export const FINANCIAL_ROLES = ["owner", "admin", "cfo"];
export const TEAM_MANAGEMENT_ROLES = ["owner", "admin", "hr_admin", "manager", "supervisor"];
export const ALL_MANAGEMENT_ROLES = ["owner", "admin", "cfo", "hr_admin", "manager", "supervisor"];

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

export function hasHigherOrEqualRole(userRole: string, targetRole: string): boolean {
  return (ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] || 0) >= 
         (ROLE_HIERARCHY[targetRole as keyof typeof ROLE_HIERARCHY] || 0);
}

export function canAccessUser(targetUserId: string, req: Request): boolean {
  if (!req.user) return false;
  
  // Executives can access all users
  if (EXECUTIVE_ROLES.includes(req.user.role)) return true;
  if (req.user.id === targetUserId) return true;
  
  return false;
}

export function canManageUsers(req: Request): boolean {
  if (!req.user) return false;
  return USER_MANAGEMENT_ROLES.includes(req.user.role);
}

export function canViewFinancials(req: Request): boolean {
  if (!req.user) return false;
  return FINANCIAL_ROLES.includes(req.user.role);
}

export function canManageTeam(req: Request): boolean {
  if (!req.user) return false;
  return TEAM_MANAGEMENT_ROLES.includes(req.user.role);
}

export async function canAccessMarket(marketId: string, req: Request): Promise<boolean> {
  if (!req.user) return false;
  
  if (EXECUTIVE_ROLES.includes(req.user.role)) return true;
  if (["manager", "supervisor"].includes(req.user.role) && req.user.marketId === marketId) return true;
  
  return false;
}
