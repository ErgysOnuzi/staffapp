import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, decimal, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = pgEnum("user_role", ["staff", "supervisor", "manager", "hr_admin", "cfo", "admin", "owner"]);
export const userStandingEnum = pgEnum("user_standing", ["all_good", "good", "at_risk"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "declined"]);
export const requestTypeEnum = pgEnum("request_type", ["request", "report"]);
export const reportStatusEnum = pgEnum("report_status", ["submitted", "reviewed", "resolved"]);
export const warningStatusEnum = pgEnum("warning_status", ["active", "resolved"]);
export const cashStatusEnum = pgEnum("cash_status", ["shortage", "exact", "extra"]);
export const sosTypeEnum = pgEnum("sos_type", ["police", "security", "ambulance", "firefighters"]);
export const notificationTypeEnum = pgEnum("notification_type", ["warning", "request", "report", "cash", "break", "contract", "sos", "general"]);

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const markets = pgTable("markets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address"),
  companyId: varchar("company_id").references(() => companies.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  companyId: varchar("company_id").references(() => companies.id).notNull(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  profilePicture: text("profile_picture"),
  role: userRoleEnum("role").notNull().default("staff"),
  standing: userStandingEnum("standing").notNull().default("all_good"),
  marketId: varchar("market_id").references(() => markets.id),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default("15.00"),
  holidayRate: decimal("holiday_rate", { precision: 10, scale: 2 }).default("22.50"),
  accumulatedSalary: decimal("accumulated_salary", { precision: 10, scale: 2 }).default("0.00"),
  theme: text("theme").default("system"),
  accentColor: text("accent_color").default("blue"),
  language: text("language").default("en"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  failedLoginAttempts: integer("failed_login_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const contracts = pgTable("contracts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isActive: boolean("is_active").default(true),
  noticeDate: timestamp("notice_date"),
  renewalRequested: boolean("renewal_requested").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  marketId: varchar("market_id").references(() => markets.id),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  breakStart: text("break_start"),
  breakEnd: text("break_end"),
  position: text("position").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const requests = pgTable("requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: requestTypeEnum("type").notNull(),
  subject: text("subject").notNull(),
  details: text("details").notNull(),
  status: requestStatusEnum("status").notNull().default("pending"),
  isAnonymous: boolean("is_anonymous").default(false),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const warnings = pgTable("warnings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  issuedBy: varchar("issued_by").references(() => users.id).notNull(),
  reason: text("reason").notNull(),
  status: warningStatusEnum("status").notNull().default("active"),
  isFiringNotice: boolean("is_firing_notice").default(false),
  marketWide: boolean("market_wide").default(false),
  marketId: varchar("market_id").references(() => markets.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const cashRegisters = pgTable("cash_registers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  shiftDate: timestamp("shift_date").notNull(),
  status: cashStatusEnum("status").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sosAlerts = pgTable("sos_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: sosTypeEnum("type").notNull(),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: notificationTypeEnum("type").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const salaryPayments = pgTable("salary_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  period: text("period").notNull(),
  paidAt: timestamp("paid_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  token: varchar("token").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserSchema = createSelectSchema(users);
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companyCode: z.string().min(4),
});

export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true });
export const selectCompanySchema = createSelectSchema(companies);

export const insertRequestSchema = createInsertSchema(requests).omit({ id: true, createdAt: true, updatedAt: true, reviewedBy: true });
export const selectRequestSchema = createSelectSchema(requests);

export const insertScheduleSchema = createInsertSchema(schedules).omit({ id: true, createdAt: true });
export const selectScheduleSchema = createSelectSchema(schedules);

export const insertWarningSchema = createInsertSchema(warnings).omit({ id: true, createdAt: true, updatedAt: true });
export const selectWarningSchema = createSelectSchema(warnings);

export const insertContractSchema = createInsertSchema(contracts).omit({ id: true, createdAt: true, updatedAt: true });
export const selectContractSchema = createSelectSchema(contracts);

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });
export const selectNotificationSchema = createSelectSchema(notifications);

export const insertSOSSchema = createInsertSchema(sosAlerts).omit({ id: true, createdAt: true });
export const selectSOSSchema = createSelectSchema(sosAlerts);

export const insertCashRegisterSchema = createInsertSchema(cashRegisters).omit({ id: true, createdAt: true });
export const selectCashRegisterSchema = createSelectSchema(cashRegisters);

export const insertMarketSchema = createInsertSchema(markets).omit({ id: true, createdAt: true });
export const selectMarketSchema = createSelectSchema(markets);

export type Company = typeof companies.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Request = typeof requests.$inferSelect;
export type Schedule = typeof schedules.$inferSelect;
export type Warning = typeof warnings.$inferSelect;
export type Contract = typeof contracts.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type SOSAlert = typeof sosAlerts.$inferSelect;
export type CashRegister = typeof cashRegisters.$inferSelect;
export type Market = typeof markets.$inferSelect;

export * from "./models/chat";
