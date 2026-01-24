import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { storage, User } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await storage.getUser();
      setUser(savedUser);
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const mockUser: User = {
        id: "user_1",
        name: "John Smith",
        email: email.toLowerCase(),
        phone: "+1 234 567 8900",
        role: "staff",
        standing: "all_good",
        accumulatedSalary: 1250.50,
        hourlyRate: 15.00,
        holidayRate: 22.50,
        contractEndDate: "2026-06-30",
        createdAt: new Date().toISOString(),
      };

      await storage.setUser(mockUser);
      setUser(mockUser);

      await initializeMockData();
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const initializeMockData = async () => {
    const today = new Date();
    const mockSchedule = [
      {
        id: "shift_1",
        userId: "user_1",
        date: today.toISOString().split("T")[0],
        startTime: "09:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "12:30",
        position: "Cashier",
      },
      {
        id: "shift_2",
        userId: "user_1",
        date: new Date(today.getTime() + 86400000).toISOString().split("T")[0],
        startTime: "10:00",
        endTime: "18:00",
        breakStart: "13:00",
        breakEnd: "13:30",
        position: "Floor Staff",
      },
      {
        id: "shift_3",
        userId: "user_1",
        date: new Date(today.getTime() + 86400000 * 2).toISOString().split("T")[0],
        startTime: "08:00",
        endTime: "16:00",
        breakStart: "11:30",
        breakEnd: "12:00",
        position: "Cashier",
      },
    ];

    const mockRequests = [
      {
        id: "req_1",
        userId: "user_1",
        type: "request" as const,
        subject: "Time Off Request",
        details: "Requesting time off for personal matters on March 15th.",
        status: "pending" as const,
        isAnonymous: false,
        createdAt: new Date(today.getTime() - 86400000 * 2).toISOString(),
        updatedAt: new Date(today.getTime() - 86400000 * 2).toISOString(),
      },
      {
        id: "req_2",
        userId: "user_1",
        type: "request" as const,
        subject: "Shift Swap",
        details: "Would like to swap my Tuesday shift with Maria.",
        status: "approved" as const,
        isAnonymous: false,
        createdAt: new Date(today.getTime() - 86400000 * 5).toISOString(),
        updatedAt: new Date(today.getTime() - 86400000 * 3).toISOString(),
      },
    ];

    const mockNotifications = [
      {
        id: "notif_1",
        userId: "user_1",
        title: "Shift Reminder",
        message: "Your shift starts in 1 hour.",
        type: "general" as const,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "notif_2",
        userId: "user_1",
        title: "Request Approved",
        message: "Your shift swap request has been approved.",
        type: "request" as const,
        isRead: true,
        createdAt: new Date(today.getTime() - 86400000 * 3).toISOString(),
      },
    ];

    await storage.setSchedule(mockSchedule);
    await storage.setRequests(mockRequests);
    await storage.setNotifications(mockNotifications);
  };

  const logout = async () => {
    await storage.clearAll();
    setUser(null);
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await storage.setUser(updatedUser);
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
