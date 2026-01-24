import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { 
  users, markets, contracts, schedules, requests, warnings, 
  cashRegisters, sosAlerts, notifications, salaryPayments,
  loginSchema, insertRequestSchema, insertScheduleSchema,
  insertWarningSchema, insertContractSchema, insertNotificationSchema,
  insertSOSSchema, insertCashRegisterSchema, insertMarketSchema
} from "../shared/schema";
import { eq, and, desc, gte, lte, or, sql } from "drizzle-orm";
import { authenticate, requireRole, hashPassword, verifyPassword, createSession, destroySession } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name, role = "staff", marketId } = req.body;
      
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const [user] = await db.insert(users).values({
        email,
        password: hashPassword(password),
        name,
        role,
        marketId,
      }).returning();

      const token = createSession(user.id);
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = loginSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid email or password format" });
      }

      const { email, password } = result.data;
      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

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
      res.json({ user: userWithoutPassword, token });
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
    
    res.json({ user: { ...userWithoutPassword, contract } });
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

  app.get("/api/users", authenticate, requireRole("admin", "manager"), async (req, res) => {
    try {
      let query = db.select().from(users);
      
      if (req.user!.role === "manager" && req.user!.marketId) {
        query = query.where(eq(users.marketId, req.user!.marketId)) as any;
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

      const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (!user) return res.status(404).json({ error: "User not found" });

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", authenticate, requireRole("admin"), async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (updates.password) {
        updates.password = hashPassword(updates.password);
      }
      updates.updatedAt = new Date();

      const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.delete("/api/users/:id", authenticate, requireRole("admin"), async (req, res) => {
    try {
      await db.delete(users).where(eq(users.id, req.params.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Delete failed" });
    }
  });

  app.get("/api/staff", authenticate, requireRole("admin", "manager"), async (req, res) => {
    try {
      let query;
      
      if (req.user!.role === "manager" && req.user!.marketId) {
        query = db.select().from(users).where(
          and(eq(users.marketId, req.user!.marketId), eq(users.role, "staff"))
        );
      } else {
        query = db.select().from(users).where(eq(users.role, "staff"));
      }

      const staff = await query;
      res.json(staff.map(({ password: _, ...u }) => u));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff" });
    }
  });

  app.patch("/api/staff/:id/status", authenticate, requireRole("admin", "manager"), async (req, res) => {
    try {
      const { standing } = req.body;
      const [updated] = await db.update(users)
        .set({ standing, updatedAt: new Date() })
        .where(eq(users.id, req.params.id))
        .returning();
      
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ error: "Update failed" });
    }
  });

  app.get("/api/schedules", authenticate, async (req, res) => {
    try {
      let query;
      
      if (req.user!.role === "staff") {
        query = db.select().from(schedules).where(eq(schedules.userId, req.user!.id));
      } else if (req.user!.role === "manager" && req.user!.marketId) {
        query = db.select().from(schedules).where(eq(schedules.marketId, req.user!.marketId));
      } else {
        query = db.select().from(schedules);
      }

      const result = await query.orderBy(desc(schedules.date));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", authenticate, requireRole("admin", "manager"), async (req, res) => {
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
      let query;
      
      if (req.user!.role === "staff") {
        query = db.select().from(requests).where(eq(requests.userId, req.user!.id));
      } else if (req.user!.role === "manager") {
        const staffIds = await db.select({ id: users.id }).from(users)
          .where(eq(users.marketId, req.user!.marketId!));
        const ids = staffIds.map(s => s.id);
        query = db.select().from(requests).where(
          and(
            or(...ids.map(id => eq(requests.userId, id))),
            eq(requests.isAnonymous, false)
          )
        );
      } else {
        query = db.select().from(requests);
      }

      const result = await query.orderBy(desc(requests.createdAt));
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

  app.patch("/api/requests/:id/status", authenticate, requireRole("admin", "manager"), async (req, res) => {
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

  app.get("/api/salary/staff/:id", authenticate, requireRole("admin", "manager"), async (req, res) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, req.params.id)).limit(1);
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

  app.post("/api/salary/payments", authenticate, requireRole("admin"), async (req, res) => {
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
      let query;
      
      if (req.user!.role === "staff") {
        query = db.select().from(contracts).where(eq(contracts.userId, req.user!.id));
      } else {
        query = db.select().from(contracts);
      }

      const result = await query.orderBy(desc(contracts.createdAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contracts" });
    }
  });

  app.put("/api/contracts/:id", authenticate, requireRole("admin"), async (req, res) => {
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
      let query;
      
      if (req.user!.role === "staff") {
        query = db.select().from(warnings).where(eq(warnings.userId, req.user!.id));
      } else if (req.user!.role === "manager" && req.user!.marketId) {
        query = db.select().from(warnings).where(eq(warnings.marketId, req.user!.marketId));
      } else {
        query = db.select().from(warnings);
      }

      const result = await query.orderBy(desc(warnings.createdAt));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch warnings" });
    }
  });

  app.post("/api/warnings", authenticate, requireRole("admin", "manager"), async (req, res) => {
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
      let query;
      
      if (req.user!.role === "staff") {
        query = db.select().from(cashRegisters).where(eq(cashRegisters.userId, req.user!.id));
      } else {
        query = db.select().from(cashRegisters);
      }

      const result = await query.orderBy(desc(cashRegisters.shiftDate));
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
      
      const admins = await db.select().from(users).where(eq(users.role, "admin"));
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
      let query;
      
      if (req.user!.role === "staff") {
        query = db.select().from(sosAlerts).where(eq(sosAlerts.userId, req.user!.id));
      } else {
        query = db.select().from(sosAlerts);
      }

      const result = await query.orderBy(desc(sosAlerts.createdAt));
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

  app.get("/api/admin-dashboard", authenticate, requireRole("admin"), async (req, res) => {
    try {
      const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
      const pendingRequests = await db.select({ count: sql<number>`count(*)` }).from(requests)
        .where(eq(requests.status, "pending"));
      const activeWarnings = await db.select({ count: sql<number>`count(*)` }).from(warnings)
        .where(eq(warnings.status, "active"));
      const recentSOS = await db.select().from(sosAlerts)
        .where(eq(sosAlerts.resolved, false))
        .orderBy(desc(sosAlerts.createdAt))
        .limit(5);
      
      res.json({
        totalUsers: totalUsers[0]?.count || 0,
        pendingRequests: pendingRequests[0]?.count || 0,
        activeWarnings: activeWarnings[0]?.count || 0,
        recentSOS,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard" });
    }
  });

  app.get("/api/admin/system-logs", authenticate, requireRole("admin"), async (req, res) => {
    res.json({ logs: [] });
  });

  app.get("/api/admin/settings", authenticate, requireRole("admin"), async (req, res) => {
    res.json({ defaultHourlyRate: 15, defaultHolidayRate: 22.5 });
  });

  app.put("/api/admin/settings", authenticate, requireRole("admin"), async (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/markets", authenticate, async (req, res) => {
    try {
      const result = await db.select().from(markets);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch markets" });
    }
  });

  app.post("/api/markets", authenticate, requireRole("admin"), async (req, res) => {
    try {
      const [market] = await db.insert(markets).values(req.body).returning();
      res.json(market);
    } catch (error) {
      res.status(500).json({ error: "Failed to create market" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
