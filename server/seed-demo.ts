import { db } from "./db";
import { users, companies, markets } from "../shared/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";

export async function seedDemoAccounts() {
  try {
    const [existingDemo] = await db.select().from(companies).where(eq(companies.code, "DEMO")).limit(1);
    
    if (existingDemo) {
      return;
    }

    console.log("Creating demo accounts for Google Play review...");

    const [demoCompany] = await db.insert(companies).values({
      name: "Demo Company",
      code: "DEMO",
      address: "123 Demo Street",
    }).returning();

    const [demoMarket] = await db.insert(markets).values({
      name: "Demo Location",
      address: "123 Demo Street",
      companyId: demoCompany.id,
    }).returning();

    const demoUsers = [
      { email: "owner@demo.com", name: "Oliver Owner", role: "owner" as const },
      { email: "admin@demo.com", name: "Alex Admin", role: "admin" as const },
      { email: "cfo@demo.com", name: "Charlie CFO", role: "cfo" as const },
      { email: "hr@demo.com", name: "Hannah HR Admin", role: "hr_admin" as const },
      { email: "manager@demo.com", name: "Maria Manager", role: "manager" as const },
      { email: "supervisor@demo.com", name: "Sarah Supervisor", role: "supervisor" as const },
      { email: "staff@demo.com", name: "Sam Staff", role: "staff" as const },
      { email: "worker@demo.com", name: "Jordan Worker", role: "staff" as const },
    ];

    for (const user of demoUsers) {
      await db.insert(users).values({
        email: user.email,
        password: hashPassword("password123"),
        name: user.name,
        role: user.role,
        companyId: demoCompany.id,
        marketId: demoMarket.id,
        standing: "all_good",
        hourlyRate: "15.00",
        holidayRate: "22.50",
        accumulatedSalary: "0.00",
      });
    }

    console.log("Demo accounts created successfully!");
    console.log("Login: staff@demo.com / password123 / DEMO");
  } catch (error) {
    console.error("Error seeding demo accounts:", error);
  }
}
