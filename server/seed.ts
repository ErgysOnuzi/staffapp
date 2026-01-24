import { db } from "./db";
import { users, companies, markets, contracts, schedules, requests, warnings, notifications, cashRegisters, sosAlerts } from "../shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  console.log("Seeding database...");

  const [company1] = await db.insert(companies).values({
    name: "Metro Retail Group",
    code: "METRO2026",
    address: "100 Corporate Plaza, Business District",
  }).returning();

  const [company2] = await db.insert(companies).values({
    name: "Fresh Foods Inc",
    code: "FRESH123",
    address: "200 Food Court, Shopping Center",
  }).returning();

  console.log("Created companies:", company1.name, "(" + company1.code + ")", company2.name, "(" + company2.code + ")");

  const [market1] = await db.insert(markets).values({
    name: "Downtown Store",
    address: "123 Main Street, Downtown",
    companyId: company1.id,
  }).returning();

  const [market2] = await db.insert(markets).values({
    name: "West Side Store",
    address: "456 West Avenue, Westside",
    companyId: company1.id,
  }).returning();

  const [market3] = await db.insert(markets).values({
    name: "Fresh Foods Central",
    address: "789 Fresh Lane",
    companyId: company2.id,
  }).returning();

  console.log("Created markets:", market1.name, market2.name, market3.name);

  const [admin] = await db.insert(users).values({
    email: "admin@staffhub.com",
    password: hashPassword("admin123"),
    name: "Alex Admin",
    phone: "+1-555-0100",
    role: "admin",
    standing: "all_good",
    companyId: company1.id,
    hourlyRate: "25.00",
    holidayRate: "37.50",
    accumulatedSalary: "0.00",
  }).returning();

  const [manager1] = await db.insert(users).values({
    email: "manager@staffhub.com",
    password: hashPassword("manager123"),
    name: "Mike Manager",
    phone: "+1-555-0101",
    role: "manager",
    standing: "all_good",
    companyId: company1.id,
    marketId: market1.id,
    hourlyRate: "20.00",
    holidayRate: "30.00",
    accumulatedSalary: "850.00",
  }).returning();

  const [staff1] = await db.insert(users).values({
    email: "staff@staffhub.com",
    password: hashPassword("staff123"),
    name: "Sarah Staff",
    phone: "+1-555-0102",
    role: "staff",
    standing: "all_good",
    companyId: company1.id,
    marketId: market1.id,
    hourlyRate: "15.00",
    holidayRate: "22.50",
    accumulatedSalary: "1250.00",
  }).returning();

  const [staff2] = await db.insert(users).values({
    email: "john@staffhub.com",
    password: hashPassword("staff123"),
    name: "John Worker",
    phone: "+1-555-0103",
    role: "staff",
    standing: "good",
    companyId: company1.id,
    marketId: market1.id,
    hourlyRate: "15.00",
    holidayRate: "22.50",
    accumulatedSalary: "980.00",
  }).returning();

  const [staff3] = await db.insert(users).values({
    email: "emma@staffhub.com",
    password: hashPassword("staff123"),
    name: "Emma Johnson",
    phone: "+1-555-0104",
    role: "staff",
    standing: "at_risk",
    companyId: company1.id,
    marketId: market1.id,
    hourlyRate: "15.00",
    holidayRate: "22.50",
    accumulatedSalary: "420.00",
  }).returning();

  const [manager2] = await db.insert(users).values({
    email: "lisa@staffhub.com",
    password: hashPassword("manager123"),
    name: "Lisa Leader",
    phone: "+1-555-0105",
    role: "manager",
    standing: "all_good",
    companyId: company1.id,
    marketId: market2.id,
    hourlyRate: "20.00",
    holidayRate: "30.00",
    accumulatedSalary: "1100.00",
  }).returning();

  const [freshAdmin] = await db.insert(users).values({
    email: "admin@freshfoods.com",
    password: hashPassword("admin123"),
    name: "Frank Fresh",
    phone: "+1-555-0200",
    role: "admin",
    standing: "all_good",
    companyId: company2.id,
    hourlyRate: "25.00",
    holidayRate: "37.50",
    accumulatedSalary: "0.00",
  }).returning();

  const [freshStaff] = await db.insert(users).values({
    email: "worker@freshfoods.com",
    password: hashPassword("staff123"),
    name: "Wendy Worker",
    phone: "+1-555-0201",
    role: "staff",
    standing: "all_good",
    companyId: company2.id,
    marketId: market3.id,
    hourlyRate: "14.00",
    holidayRate: "21.00",
    accumulatedSalary: "750.00",
  }).returning();

  console.log("Created users for Metro Retail:", admin.name, manager1.name, staff1.name, staff2.name, staff3.name, manager2.name);
  console.log("Created users for Fresh Foods:", freshAdmin.name, freshStaff.name);

  const now = new Date();
  const contractStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const contractEnd = new Date(now.getFullYear() + 1, now.getMonth(), 1);

  await db.insert(contracts).values([
    { userId: staff1.id, startDate: contractStart, endDate: contractEnd, isActive: true },
    { userId: staff2.id, startDate: contractStart, endDate: contractEnd, isActive: true },
    { userId: staff3.id, startDate: contractStart, endDate: new Date(now.getFullYear(), now.getMonth() + 1, 15), isActive: true },
    { userId: manager1.id, startDate: contractStart, endDate: contractEnd, isActive: true },
    { userId: freshStaff.id, startDate: contractStart, endDate: contractEnd, isActive: true },
  ]);

  console.log("Created contracts");

  const today = new Date();
  const scheduleData = [];
  
  for (let i = -7; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      scheduleData.push({
        userId: staff1.id,
        marketId: market1.id,
        date,
        startTime: "09:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
        position: "Cashier",
      });
      
      scheduleData.push({
        userId: staff2.id,
        marketId: market1.id,
        date,
        startTime: "10:00",
        endTime: "18:00",
        breakStart: "14:00",
        breakEnd: "15:00",
        position: "Stock Associate",
      });

      if (i % 2 === 0) {
        scheduleData.push({
          userId: staff3.id,
          marketId: market1.id,
          date,
          startTime: "14:00",
          endTime: "22:00",
          breakStart: "18:00",
          breakEnd: "19:00",
          position: "Cashier",
        });
      }

      scheduleData.push({
        userId: freshStaff.id,
        marketId: market3.id,
        date,
        startTime: "08:00",
        endTime: "16:00",
        breakStart: "12:00",
        breakEnd: "12:30",
        position: "Store Clerk",
      });
    }
  }

  await db.insert(schedules).values(scheduleData);
  console.log("Created schedules:", scheduleData.length, "shifts");

  await db.insert(requests).values([
    {
      userId: staff1.id,
      type: "request",
      subject: "Vacation Request",
      details: "I would like to request time off from March 15-20 for a family vacation.",
      status: "pending",
      isAnonymous: false,
    },
    {
      userId: staff2.id,
      type: "request",
      subject: "Shift Swap",
      details: "Could I swap my Tuesday shift with Wednesday next week?",
      status: "approved",
      isAnonymous: false,
      reviewedBy: manager1.id,
    },
    {
      userId: staff3.id,
      type: "report",
      subject: "Equipment Issue",
      details: "Register #3 has been showing error codes intermittently.",
      status: "pending",
      isAnonymous: false,
    },
    {
      userId: staff1.id,
      type: "report",
      subject: "Safety Concern",
      details: "The back door emergency exit light is not working properly.",
      status: "pending",
      isAnonymous: true,
    },
  ]);

  console.log("Created requests");

  await db.insert(warnings).values([
    {
      userId: staff3.id,
      issuedBy: manager1.id,
      reason: "Late arrival on 3 consecutive shifts. Please ensure punctuality.",
      status: "active",
      isFiringNotice: false,
      marketId: market1.id,
    },
  ]);

  console.log("Created warnings");

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(today.getDate() - 2);

  await db.insert(cashRegisters).values([
    { userId: staff1.id, shiftDate: yesterday, status: "exact", amount: "0.00" },
    { userId: staff1.id, shiftDate: twoDaysAgo, status: "shortage", amount: "5.50" },
    { userId: staff2.id, shiftDate: yesterday, status: "extra", amount: "2.00" },
    { userId: staff3.id, shiftDate: yesterday, status: "shortage", amount: "12.00", notes: "Customer dispute - reviewed" },
  ]);

  console.log("Created cash register entries");

  await db.insert(notifications).values([
    {
      userId: staff1.id,
      title: "Schedule Updated",
      message: "Your schedule for next week has been published.",
      type: "general",
      isRead: false,
    },
    {
      userId: staff1.id,
      title: "Request Update",
      message: "Your shift swap request has been approved.",
      type: "request",
      isRead: true,
    },
    {
      userId: staff3.id,
      title: "Warning Issued",
      message: "You have received a warning for late arrivals. Please review.",
      type: "warning",
      isRead: false,
    },
    {
      userId: manager1.id,
      title: "New Request",
      message: "Sarah Staff has submitted a vacation request.",
      type: "request",
      isRead: false,
    },
    {
      userId: admin.id,
      title: "Cash Shortage Alert",
      message: "Cash shortage of €12.00 recorded by Emma Johnson.",
      type: "cash",
      isRead: false,
    },
  ]);

  console.log("Created notifications");
  console.log("\n✅ Database seeded successfully!");
  console.log("\n📧 Demo Login Credentials:");
  console.log("\n   === METRO RETAIL GROUP (Company Code: METRO2026) ===");
  console.log("   Admin:   admin@staffhub.com / admin123");
  console.log("   Manager: manager@staffhub.com / manager123");
  console.log("   Staff:   staff@staffhub.com / staff123");
  console.log("\n   === FRESH FOODS INC (Company Code: FRESH123) ===");
  console.log("   Admin:   admin@freshfoods.com / admin123");
  console.log("   Staff:   worker@freshfoods.com / staff123");

  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
