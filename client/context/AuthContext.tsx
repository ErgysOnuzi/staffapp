import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiUrl, setAuthToken, clearAuthToken, getAuthToken, queryClient } from "@/lib/query-client";
import { storage } from "@/lib/storage";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "staff" | "manager" | "admin";
  standing: "all_good" | "good" | "at_risk";
  marketId?: string;
  accumulatedSalary?: string;
  hourlyRate?: string;
  holidayRate?: string;
  theme?: string;
  accentColor?: string;
  language?: string;
  contract?: {
    id: string;
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasConsent: boolean;
  login: (email: string, password: string, companyCode: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  acceptConsent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_STORAGE_KEY = "@staffhub:user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const consentAccepted = await storage.hasAcceptedTerms();
      setHasConsent(consentAccepted);

      const token = await getAuthToken();
      if (token) {
        const baseUrl = getApiUrl();
        const res = await fetch(`${baseUrl}api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        } else {
          await clearAuthToken();
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        }
      } else {
        const savedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, companyCode: string): Promise<boolean> => {
    try {
      const baseUrl = getApiUrl();
      const res = await fetch(`${baseUrl}api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password, companyCode: companyCode.toUpperCase() }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Login error:", error);
        return false;
      }

      const data = await res.json();
      await setAuthToken(data.token);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      setUser(data.user);
      queryClient.clear();
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const baseUrl = getApiUrl();
      const token = await getAuthToken();
      if (token) {
        await fetch(`${baseUrl}api/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      await clearAuthToken();
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      setUser(null);
      queryClient.clear();
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    try {
      const baseUrl = getApiUrl();
      const token = await getAuthToken();
      
      const res = await fetch(`${baseUrl}api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Update user failed:", error);
    }
  };

  const refreshUser = async () => {
    try {
      const token = await getAuthToken();
      if (token) {
        const baseUrl = getApiUrl();
        const res = await fetch(`${baseUrl}api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        }
      }
    } catch (error) {
      console.error("Refresh user failed:", error);
    }
  };

  const acceptConsent = async () => {
    await storage.setConsent({
      termsAccepted: true,
      privacyAccepted: true,
      acceptedAt: new Date().toISOString(),
      version: "1.0.0",
    });
    setHasConsent(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        hasConsent,
        login,
        logout,
        updateUser,
        refreshUser,
        acceptConsent,
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
