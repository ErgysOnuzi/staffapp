import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER: "@staffhub_user",
  AUTH_TOKEN: "@staffhub_token",
  REQUESTS: "@staffhub_requests",
  SCHEDULE: "@staffhub_schedule",
  NOTIFICATIONS: "@staffhub_notifications",
  SETTINGS: "@staffhub_settings",
};

export type UserRole = "staff" | "manager" | "admin";

export type UserStanding = "all_good" | "good" | "at_risk";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  standing: UserStanding;
  profilePicture?: string;
  marketId?: string;
  accumulatedSalary: number;
  hourlyRate: number;
  holidayRate: number;
  contractEndDate?: string;
  createdAt: string;
}

export interface Request {
  id: string;
  userId: string;
  type: "request" | "report";
  subject: string;
  details: string;
  status: "pending" | "approved" | "declined";
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleShift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  position: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "warning" | "request" | "report" | "cash" | "break" | "contract" | "sos" | "general";
  isRead: boolean;
  createdAt: string;
}

export interface Settings {
  theme: "dark" | "light" | "system";
  accentColor: "white" | "pink" | "green" | "blue" | "red";
  language: "en" | "sq" | "sr";
  twoFactorEnabled: boolean;
}

export const storage = {
  async getUser(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  },

  async clearUser(): Promise<void> {
    await AsyncStorage.removeItem(KEYS.USER);
    await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
  },

  async getRequests(): Promise<Request[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.REQUESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setRequests(requests: Request[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.REQUESTS, JSON.stringify(requests));
  },

  async addRequest(request: Request): Promise<void> {
    const requests = await this.getRequests();
    requests.unshift(request);
    await this.setRequests(requests);
  },

  async getSchedule(): Promise<ScheduleShift[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SCHEDULE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setSchedule(schedule: ScheduleShift[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
  },

  async getNotifications(): Promise<Notification[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  async setNotifications(notifications: Notification[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  async addNotification(notification: Notification): Promise<void> {
    const notifications = await this.getNotifications();
    notifications.unshift(notification);
    await this.setNotifications(notifications);
  },

  async getSettings(): Promise<Settings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        theme: "system",
        accentColor: "blue",
        language: "en",
        twoFactorEnabled: false,
      };
    } catch {
      return {
        theme: "system",
        accentColor: "blue",
        language: "en",
        twoFactorEnabled: false,
      };
    }
  },

  async setSettings(settings: Settings): Promise<void> {
    await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};
