import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { 
  users, markets, companies, contracts, schedules, requests, warnings, 
  cashRegisters, sosAlerts, notifications, salaryPayments,
  loginSchema, insertRequestSchema, insertScheduleSchema,
  insertWarningSchema, insertContractSchema, insertNotificationSchema,
  insertSOSSchema, insertCashRegisterSchema, insertMarketSchema
} from "../shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { 
  authenticate, requireRole, hashPassword, verifyPassword, createSession, destroySession,
  USER_MANAGEMENT_ROLES, FINANCIAL_ROLES, EXECUTIVE_ROLES, TEAM_MANAGEMENT_ROLES, hasHigherOrEqualRole
} from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, companyCode, role = "staff", marketId } = req.body;
      
      if (!companyCode) {
        return res.status(400).json({ error: "Company code is required" });
      }

      const [company] = await db.select().from(companies).where(eq(companies.code, companyCode.toUpperCase())).limit(1);
      if (!company) {
        return res.status(400).json({ error: "Invalid company code" });
      }

      const existing = await db.select().from(users).where(
        and(eq(users.email, email.toLowerCase()), eq(users.companyId, company.id))
      ).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already exists in this company" });
      }

      const [user] = await db.insert(users).values({
        email: email.toLowerCase(),
        password: hashPassword(password),
        name,
        role,
        companyId: company.id,
        marketId,
      }).returning();

      const token = createSession(user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: { ...userWithoutPassword, company }, token });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid email, password, or company code format" });
      }

      const { email, password, companyCode } = result.data;

      const [company] = await db.select().from(companies).where(eq(companies.code, companyCode.toUpperCase())).limit(1);
      if (!company) {
        return res.status(401).json({ error: "Invalid company code" });
      }

      const [user] = await db.select().from(users).where(
        and(eq(users.email, email.toLowerCase()), eq(users.companyId, company.id))
      ).limit(1);

      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        return res.status(423).json({ error: "Account locked. Try again later." });
      }

      if (!verifyPassword(password, user.password)) {
        const attempts = (user.failedLoginAttempts || 0) + 1;
        const updates: any = { failedLoginAttempts: attempts };
        
        if (attempts >= 5) {
          updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        
        await db.update(users).set(updates).where(eq(users.id, user.id));
        return res.status(401).json({ error: "Invalid credentials" });
      }

      await db.update(users).set({ 
        failedLoginAttempts: 0, 
        lockedUntil: null 
      }).where(eq(users.id, user.id));

      const token = createSession(user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: { ...userWithoutPassword, company }, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", authenticate, (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) destroySession(token);
    res.json({ success: true });
  });

  app.get("/api/auth/me", authenticate, async (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    
    const [contract] = await db.select().from(contracts)
      .where(and(eq(contracts.userId, req.user!.id), eq(contracts.isActive, true)))
      .limit(1);
    
    const [company] = await db.select().from(companies)
      .where(eq(companies.id, req.user!.companyId))
      .limit(1);
    
    res.json({ user: { ...userWithoutPassword, contract, company } });
  });

  app.get("/api/users/me", authenticate, async (req, res) => {
    const { password: _, ...userWithoutPassword } = req.user!;
    res.json(userWithoutPassword);
  });

  app.put("/api/users/me", authenticate, async (req, res) => {
    try {
      const { name, phone, profilePicture, theme, accentColor, language } = req.body;
      
      const [updated] = await db.update(users)
        .set({ name, phone, profilePicture, theme, accentColor, language, updatedAt: new Date() })
        .where(eq(users.id, req.user!.id))
        .returning();

      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/users", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      let query = db.select().from(users).where(eq(users.companyId, companyId));
      
      if (req.user!.role === "manager" && req.user!.marketId) {
        query = db.select().from(users).where(
          and(eq(users.companyId, companyId), eq(users.marketId, req.user!.marketId))
        );
      }

      const allUsers = await query;
      res.json(allUsers.map(({ password: _, ...u }) => u));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      
      if (req.user!.role === "staff" && req.user!.id !== id) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const [user] = await db.select().from(users).where(
        and(eq(users.id, id), eq(users.companyId, req.user!.companyId))
      ).limit(1);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", authenticate, requireRole(...USER_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (updates.password) {
        updates.password = hashPassword(updates.password);
      }
      updates.updatedAt = new Date();

      const [updated] = await db.update(users)
        .set(updates)
        .where(and(eq(users.id, id), eq(users.companyId, req.user!.companyId)))
        .returning();
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.delete("/api/users/:id", authenticate, requireRole(...USER_MANAGEMENT_ROLES), async (req, res) => {
    try {
      await db.delete(users).where(
        and(eq(users.id, req.params.id), eq(users.companyId, req.user!.companyId))
      );
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Delete failed" });
    }
  });

  app.get("/api/staff", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      let query;
      
      if (req.user!.role === "manager" && req.user!.marketId) {
        query = db.select().from(users).where(
          and(eq(users.companyId, companyId), eq(users.marketId, req.user!.marketId), eq(users.role, "staff"))
        );
      } else {
        query = db.select().from(users).where(
          and(eq(users.companyId, companyId), eq(users.role, "staff"))
        );
      }

      const staff = await query;
      res.json(staff.map(({ password: _, ...u }) => u));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.patch("/api/staff/:id/status", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const { standing } = req.body;
      const [updated] = await db.update(users)
        .set({ standing, updatedAt: new Date() })
        .where(and(eq(users.id, req.params.id), eq(users.companyId, req.user!.companyId)))
        .returning();
      
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/schedules", authenticate, async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      
      const companyUsers = await db.select({ id: users.id }).from(users).where(eq(users.companyId, companyId));
      const userIds = companyUsers.map(u => u.id);
      
      let result;
      if (req.user!.role === "staff") {
        result = await db.select().from(schedules).where(eq(schedules.userId, req.user!.id)).orderBy(desc(schedules.date));
      } else if (req.user!.role === "manager" && req.user!.marketId) {
        result = await db.select().from(schedules).where(eq(schedules.marketId, req.user!.marketId)).orderBy(desc(schedules.date));
      } else {
        result = await db.select().from(schedules).orderBy(desc(schedules.date));
        result = result.filter(s => userIds.includes(s.userId));
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const data = insertScheduleSchema.parse(req.body);
      const [schedule] = await db.insert(schedules).values(data).returning();
      res.json(schedule);
    } catch (error) {
      res.status(500).json({ error: "Failed to create schedule" });
    }
  });

  app.get("/api/requests", authenticate, async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      
      const companyUsers = await db.select({ id: users.id }).from(users).where(eq(users.companyId, companyId));
      const userIds = companyUsers.map(u => u.id);
      
      let result;
      if (req.user!.role === "staff") {
        result = await db.select().from(requests).where(eq(requests.userId, req.user!.id)).orderBy(desc(requests.createdAt));
      } else {
        result = await db.select().from(requests).orderBy(desc(requests.createdAt));
        result = result.filter(r => userIds.includes(r.userId));
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.post("/api/requests", authenticate, async (req, res) => {
    try {
      const data = {
        ...req.body,
        userId: req.user!.id,
      };
      const [request] = await db.insert(requests).values(data).returning();
      res.json(request);
    } catch (error) {
      console.error("Create request error:", error);
      res.status(500).json({ error: "Failed to create request" });
    }
  });

  app.get("/api/requests/:id", authenticate, async (req, res) => {
    try {
      const [request] = await db.select().from(requests).where(eq(requests.id, req.params.id)).limit(1);
      if (!request) return res.status(404).json({ error: "Request not found" });
      
      if (req.user!.role === "staff" && request.userId !== req.user!.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      
      res.json(request);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch request" });
    }
  });

  app.patch("/api/requests/:id/status", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const { status } = req.body;
      const [updated] = await db.update(requests)
        .set({ status, reviewedBy: req.user!.id, updatedAt: new Date() })
        .where(eq(requests.id, req.params.id))
        .returning();
      
      await db.insert(notifications).values({
        userId: updated.userId,
        title: `Request ${status}`,
        message: `Your request "${updated.subject}" has been ${status}.`,
        type: "request",
      });
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.delete("/api/requests/:id", authenticate, requireRole("admin"), async (req, res) => {
    try {
      await db.delete(requests).where(eq(requests.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Delete failed" });
    }
  });

  app.get("/api/salary/me", authenticate, async (req, res) => {
    try {
      const { accumulatedSalary, hourlyRate, holidayRate } = req.user!;
      const payments = await db.select().from(salaryPayments)
        .where(eq(salaryPayments.userId, req.user!.id))
        .orderBy(desc(salaryPayments.paidAt));
      
      res.json({ accumulatedSalary, hourlyRate, holidayRate, payments });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary" });
    }
  });

  app.get("/api/salary/staff/:id", authenticate, requireRole(...FINANCIAL_ROLES, "manager", "supervisor"), async (req, res) => {
    try {
      const [user] = await db.select().from(users).where(
        and(eq(users.id, req.params.id), eq(users.companyId, req.user!.companyId))
      ).limit(1);
      if (!user) return res.status(404).json({ error: "User not found" });
      
      const payments = await db.select().from(salaryPayments)
        .where(eq(salaryPayments.userId, req.params.id))
        .orderBy(desc(salaryPayments.paidAt));
      
      res.json({ 
        accumulatedSalary: user.accumulatedSalary, 
        hourlyRate: user.hourlyRate, 
        holidayRate: user.holidayRate, 
        payments 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary" });
    }
  });

  app.post("/api/salary/payments", authenticate, requireRole(...FINANCIAL_ROLES), async (req, res) => {
    try {
      const { userId, amount, period } = req.body;
      
      const [payment] = await db.insert(salaryPayments).values({ userId, amount, period }).returning();
      
      await db.update(users)
        .set({ accumulatedSalary: sql`accumulated_salary - ${amount}` })
        .where(eq(users.id, userId));
      
      res.json(payment);
    } catch (error) {
      res.status(500).json({ error: "Payment failed" });
    }
  });

  app.get("/api/contracts", authenticate, async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      
      const companyUsers = await db.select({ id: users.id }).from(users).where(eq(users.companyId, companyId));
      const userIds = companyUsers.map(u => u.id);
      
      let result;
      if (req.user!.role === "staff") {
        result = await db.select().from(contracts).where(eq(contracts.userId, req.user!.id)).orderBy(desc(contracts.createdAt));
      } else {
        result = await db.select().from(contracts).orderBy(desc(contracts.createdAt));
        result = result.filter(c => userIds.includes(c.userId));
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.put("/api/contracts/:id", authenticate, requireRole(...USER_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const [updated] = await db.update(contracts)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(contracts.id, req.params.id))
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/warnings", authenticate, async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      
      const companyUsers = await db.select({ id: users.id }).from(users).where(eq(users.companyId, companyId));
      const userIds = companyUsers.map(u => u.id);
      
      let result;
      if (req.user!.role === "staff") {
        result = await db.select().from(warnings).where(eq(warnings.userId, req.user!.id)).orderBy(desc(warnings.createdAt));
      } else if (req.user!.role === "manager" && req.user!.marketId) {
        result = await db.select().from(warnings).where(eq(warnings.marketId, req.user!.marketId)).orderBy(desc(warnings.createdAt));
      } else {
        result = await db.select().from(warnings).orderBy(desc(warnings.createdAt));
        result = result.filter(w => userIds.includes(w.userId));
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warnings" });
    }
  });

  app.post("/api/warnings", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const data = {
        ...req.body,
        issuedBy: req.user!.id,
      };
      const [warning] = await db.insert(warnings).values(data).returning();
      
      await db.insert(notifications).values({
        userId: warning.userId,
        title: warning.isFiringNotice ? "Firing Notice" : "Warning Issued",
        message: warning.reason,
        type: "warning",
      });
      
      res.json(warning);
    } catch (error) {
      res.status(500).json({ error: "Failed to create warning" });
    }
  });

  app.get("/api/cash-register", authenticate, async (req, res) => {
    try {
      let result;
      if (req.user!.role === "staff") {
        result = await db.select().from(cashRegisters).where(eq(cashRegisters.userId, req.user!.id)).orderBy(desc(cashRegisters.shiftDate));
      } else {
        const companyUsers = await db.select({ id: users.id }).from(users).where(eq(users.companyId, req.user!.companyId));
        const userIds = companyUsers.map(u => u.id);
        result = await db.select().from(cashRegisters).orderBy(desc(cashRegisters.shiftDate));
        result = result.filter(c => userIds.includes(c.userId));
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cash register" });
    }
  });

  app.post("/api/cash-register", authenticate, async (req, res) => {
    try {
      const data = {
        ...req.body,
        userId: req.user!.id,
      };
      const [entry] = await db.insert(cashRegisters).values(data).returning();
      
      if (data.status === "shortage" && parseFloat(data.amount) >= 10) {
        await db.insert(notifications).values({
          userId: req.user!.id,
          title: "Cash Shortage Alert",
          message: `Cash shortage of €${data.amount} recorded.`,
          type: "cash",
        });
      }
      
      res.json(entry);
    } catch (error) {
      res.status(500).json({ error: "Failed to create entry" });
    }
  });

  app.post("/api/sos", authenticate, async (req, res) => {
    try {
      const { type } = req.body;
      const [alert] = await db.insert(sosAlerts).values({
        userId: req.user!.id,
        type,
      }).returning();
      
      const admins = await db.select().from(users).where(
        and(eq(users.role, "admin"), eq(users.companyId, req.user!.companyId))
      );
      for (const admin of admins) {
        await db.insert(notifications).values({
          userId: admin.id,
          title: "SOS ALERT",
          message: `Emergency ${type} alert triggered by ${req.user!.name}`,
          type: "sos",
        });
      }
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to create SOS alert" });
    }
  });

  app.get("/api/sos", authenticate, async (req, res) => {
    try {
      let result;
      if (req.user!.role === "staff") {
        result = await db.select().from(sosAlerts).where(eq(sosAlerts.userId, req.user!.id)).orderBy(desc(sosAlerts.createdAt));
      } else {
        const companyUsers = await db.select({ id: users.id }).from(users).where(eq(users.companyId, req.user!.companyId));
        const userIds = companyUsers.map(u => u.id);
        result = await db.select().from(sosAlerts).orderBy(desc(sosAlerts.createdAt));
        result = result.filter(s => userIds.includes(s.userId));
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch SOS alerts" });
    }
  });

  app.get("/api/notifications", authenticate, async (req, res) => {
    try {
      const result = await db.select().from(notifications)
        .where(eq(notifications.userId, req.user!.id))
        .orderBy(desc(notifications.createdAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticate, async (req, res) => {
    try {
      const [updated] = await db.update(notifications)
        .set({ isRead: true })
        .where(and(
          eq(notifications.id, req.params.id),
          eq(notifications.userId, req.user!.id)
        ))
        .returning();
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/admin-dashboard", authenticate, requireRole(...EXECUTIVE_ROLES), async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      
      const companyUsers = await db.select({ id: users.id }).from(users).where(eq(users.companyId, companyId));
      const userIds = companyUsers.map(u => u.id);
      
      const totalUsers = companyUsers.length;
      
      const allRequests = await db.select().from(requests);
      const pendingRequests = allRequests.filter(r => userIds.includes(r.userId) && r.status === "pending").length;
      
      const allWarnings = await db.select().from(warnings);
      const activeWarnings = allWarnings.filter(w => userIds.includes(w.userId) && w.status === "active").length;
      
      const allSOS = await db.select().from(sosAlerts).where(eq(sosAlerts.resolved, false)).orderBy(desc(sosAlerts.createdAt));
      const recentSOS = allSOS.filter(s => userIds.includes(s.userId)).slice(0, 5);
      
      res.json({
        totalUsers,
        pendingRequests,
        activeWarnings,
        recentSOS,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.get("/api/admin/system-logs", authenticate, requireRole("owner", "admin"), async (req, res) => {
    res.json({ logs: [] });
  });

  app.get("/api/admin/settings", authenticate, requireRole("owner", "admin"), async (req, res) => {
    res.json({ defaultHourlyRate: 15, defaultHolidayRate: 22.5 });
  });

  app.put("/api/admin/settings", authenticate, requireRole("owner", "admin"), async (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/markets", authenticate, async (req, res) => {
    try {
      const result = await db.select().from(markets).where(eq(markets.companyId, req.user!.companyId));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch markets" });
    }
  });

  app.post("/api/markets", authenticate, requireRole(...USER_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const [market] = await db.insert(markets).values({
        ...req.body,
        companyId: req.user!.companyId,
      }).returning();
      res.json(market);
    } catch (error) {
      res.status(500).json({ error: "Failed to create market" });
    }
  });

  app.get("/api/companies", authenticate, requireRole(...EXECUTIVE_ROLES), async (req, res) => {
    try {
      const [company] = await db.select().from(companies).where(eq(companies.id, req.user!.companyId)).limit(1);
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.get("/api/admin/users", authenticate, requireRole(...USER_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        standing: users.standing,
        hourlyRate: users.hourlyRate,
        holidayRate: users.holidayRate,
        accumulatedSalary: users.accumulatedSalary,
        marketId: users.marketId,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.companyId, req.user!.companyId));
      res.json(allUsers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", authenticate, requireRole(...USER_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const { email, password, name, phone, role = "staff", hourlyRate, holidayRate, marketId } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required" });
      }

      const existing = await db.select().from(users).where(
        and(eq(users.email, email.toLowerCase()), eq(users.companyId, req.user!.companyId))
      ).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already exists in this company" });
      }

      const [user] = await db.insert(users).values({
        email: email.toLowerCase(),
        password: hashPassword(password),
        name,
        phone,
        role,
        companyId: req.user!.companyId,
        marketId,
        hourlyRate: hourlyRate || "15.00",
        holidayRate: holidayRate || "22.50",
      }).returning();

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  app.get("/api/admin/company-stats", authenticate, requireRole(...EXECUTIVE_ROLES), async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      
      const allUsers = await db.select().from(users).where(eq(users.companyId, companyId));
      const allMarkets = await db.select().from(markets).where(eq(markets.companyId, companyId));
      
      const admins = allUsers.filter(u => u.role === "admin").length;
      const managers = allUsers.filter(u => u.role === "manager").length;
      const staff = allUsers.filter(u => u.role === "staff").length;
      
      const companyUserIds = allUsers.map(u => u.id);
      const allRequests = await db.select().from(requests);
      const pendingRequests = allRequests.filter(r => companyUserIds.includes(r.userId) && r.status === "pending").length;
      
      res.json({
        totalUsers: allUsers.length,
        admins,
        managers,
        staff,
        totalMarkets: allMarkets.length,
        pendingRequests,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company stats" });
    }
  });

  app.get("/api/admin/markets", authenticate, requireRole(...EXECUTIVE_ROLES), async (req, res) => {
    try {
      const companyId = req.user!.companyId;
      const allMarkets = await db.select().from(markets).where(eq(markets.companyId, companyId));
      const allUsers = await db.select({ id: users.id, marketId: users.marketId }).from(users).where(eq(users.companyId, companyId));
      
      const result = allMarkets.map(market => ({
        ...market,
        userCount: allUsers.filter(u => u.marketId === market.id).length,
      }));
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch markets" });
    }
  });

  app.put("/api/markets/:id", authenticate, requireRole(...USER_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const { name, address } = req.body;
      const [updated] = await db.update(markets)
        .set({ name, address })
        .where(and(eq(markets.id, req.params.id), eq(markets.companyId, req.user!.companyId)))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Market not found" });
      }
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update market" });
    }
  });

  app.delete("/api/markets/:id", authenticate, requireRole(...USER_MANAGEMENT_ROLES), async (req, res) => {
    try {
      await db.update(users)
        .set({ marketId: null })
        .where(eq(users.marketId, req.params.id));
      
      await db.delete(markets).where(
        and(eq(markets.id, req.params.id), eq(markets.companyId, req.user!.companyId))
      );
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete market" });
    }
  });

  app.put("/api/companies", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const { name, address } = req.body;
      const [updated] = await db.update(companies)
        .set({ name, address })
        .where(eq(companies.id, req.user!.companyId))
        .returning();
      
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  app.get("/api/manager/team", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const teamMembers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        standing: users.standing,
        hourlyRate: users.hourlyRate,
      }).from(users).where(
        and(
          eq(users.companyId, req.user!.companyId),
          eq(users.role, "staff")
        )
      );

      const todaySchedules = await db.select().from(schedules).where(
        eq(schedules.date, today)
      );

      const result = teamMembers.map(member => {
        const shift = todaySchedules.find(s => s.userId === member.id);
        return {
          ...member,
          todayShift: shift ? {
            startTime: shift.startTime,
            endTime: shift.endTime,
            position: shift.position,
          } : null,
        };
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });

  app.get("/api/manager/requests", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const teamMembers = await db.select({ id: users.id, name: users.name }).from(users).where(
        and(
          eq(users.companyId, req.user!.companyId),
          eq(users.role, "staff")
        )
      );

      const memberIds = teamMembers.map(m => m.id);
      
      if (memberIds.length === 0) {
        return res.json([]);
      }

      const teamRequests = await db.select().from(requests).where(
        sql`${requests.userId} IN (${sql.join(memberIds.map(id => sql`${id}`), sql`, `)})`
      ).orderBy(desc(requests.createdAt));

      const result = teamRequests.map(request => {
        const member = teamMembers.find(m => m.id === request.userId);
        return {
          ...request,
          userName: member?.name || "Unknown",
        };
      });

      res.json(result);
    } catch (error) {
      console.error("Manager requests error:", error);
      res.status(500).json({ error: "Failed to fetch requests" });
    }
  });

  app.put("/api/requests/:id/status", authenticate, requireRole(...TEAM_MANAGEMENT_ROLES), async (req, res) => {
    try {
      const { status } = req.body;
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const [updated] = await db.update(requests)
        .set({ 
          status, 
          reviewedBy: req.user!.id,
          updatedAt: new Date(),
        })
        .where(eq(requests.id, req.params.id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Request not found" });
      }

      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: "Failed to update request status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
