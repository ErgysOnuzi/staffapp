import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { SOSButton } from "@/components/SOSButton";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { storage, ScheduleShift, Notification } from "@/lib/storage";
import { Spacing, SemanticColors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [todayShift, setTodayShift] = useState<ScheduleShift | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadData = useCallback(async () => {
    const schedule = await storage.getSchedule();
    const today = new Date().toISOString().split("T")[0];
    const shift = schedule.find((s) => s.date === today);
    setTodayShift(shift || null);

    const notifs = await storage.getNotifications();
    setNotifications(notifs.slice(0, 3));
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const getStandingInfo = () => {
    switch (user?.standing) {
      case "all_good":
        return { label: "All Good", variant: "success" as const, icon: "check-circle" as const };
      case "good":
        return { label: "Good", variant: "info" as const, icon: "thumbs-up" as const };
      case "at_risk":
        return { label: "At Risk", variant: "warning" as const, icon: "alert-triangle" as const };
      default:
        return { label: "Unknown", variant: "pending" as const, icon: "help-circle" as const };
    }
  };

  const standingInfo = getStandingInfo();

  const getContractDaysRemaining = () => {
    if (!user?.contractEndDate) return null;
    const end = new Date(user.contractEndDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  const contractDays = getContractDaysRemaining();

  const handleSOS = () => {
    navigation.navigate("SOS");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["5xl"],
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.link}
          />
        }
      >
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <ThemedText type="hero" style={styles.greeting}>
            {getGreeting()},
          </ThemedText>
          <ThemedText type="hero" style={styles.name}>
            {user?.name?.split(" ")[0] || "User"}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Card elevation={1} style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.statusLeft}>
                <View
                  style={[
                    styles.statusIcon,
                    { backgroundColor: SemanticColors[standingInfo.variant === "pending" ? "info" : standingInfo.variant] + "20" },
                  ]}
                >
                  <Feather
                    name={standingInfo.icon}
                    size={24}
                    color={SemanticColors[standingInfo.variant === "pending" ? "info" : standingInfo.variant]}
                  />
                </View>
                <View>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Your Standing
                  </ThemedText>
                  <StatusBadge label={standingInfo.label} variant={standingInfo.variant} size="medium" />
                </View>
              </View>
              {contractDays !== null ? (
                <View style={styles.contractInfo}>
                  <ThemedText type="h3" style={{ color: theme.link }}>
                    {contractDays}
                  </ThemedText>
                  <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                    days left
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={styles.statsRow}>
            <Card elevation={1} style={styles.statCard}>
              <Feather name="clock" size={20} color={theme.link} />
              <ThemedText type="small" style={[styles.statLabel, { color: theme.textSecondary }]}>
                Today's Shift
              </ThemedText>
              {todayShift ? (
                <ThemedText type="h4">
                  {todayShift.startTime} - {todayShift.endTime}
                </ThemedText>
              ) : (
                <ThemedText type="body" style={{ color: theme.textSecondary }}>
                  No shift today
                </ThemedText>
              )}
            </Card>

            <Card elevation={1} style={styles.statCard}>
              <Feather name="dollar-sign" size={20} color={SemanticColors.success} />
              <ThemedText type="small" style={[styles.statLabel, { color: theme.textSecondary }]}>
                Accumulated
              </ThemedText>
              <ThemedText type="h4">
                ${user?.accumulatedSalary?.toFixed(2) || "0.00"}
              </ThemedText>
            </Card>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Recent Notifications</ThemedText>
            <Pressable onPress={() => {}}>
              <ThemedText type="link">View All</ThemedText>
            </Pressable>
          </View>

          {notifications.length > 0 ? (
            notifications.map((notif, index) => (
              <Card
                key={notif.id}
                elevation={1}
                style={[styles.notificationCard, !notif.isRead && styles.unreadCard]}
              >
                <View style={styles.notificationRow}>
                  <View
                    style={[
                      styles.notificationIcon,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather
                      name={notif.type === "warning" ? "alert-circle" : "bell"}
                      size={18}
                      color={notif.type === "warning" ? SemanticColors.warning : theme.link}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>
                      {notif.title}
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      {notif.message}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card elevation={1} style={styles.emptyNotifications}>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center" }}>
                No notifications yet
              </ThemedText>
            </Card>
          )}
        </Animated.View>
      </ScrollView>

      <SOSButton onPress={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  greeting: {
    marginBottom: 0,
  },
  name: {
    marginBottom: Spacing.xl,
  },
  statusCard: {
    marginBottom: Spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  contractInfo: {
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    gap: Spacing.sm,
  },
  statLabel: {
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  notificationCard: {
    marginBottom: Spacing.sm,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: SemanticColors.primary,
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  emptyNotifications: {
    paddingVertical: Spacing["3xl"],
  },
});
