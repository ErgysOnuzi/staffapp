import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { SOSButton } from "@/components/SOSButton";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, SemanticColors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ScheduleShift {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakStart?: string;
  breakEnd?: string;
  position: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();

  const { data: schedules = [], refetch: refetchSchedules } = useQuery<ScheduleShift[]>({
    queryKey: ["/api/schedules"],
  });

  const { data: notifications = [], refetch: refetchNotifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetchSchedules();
      refetchNotifications();
    }, [])
  );

  const today = new Date().toISOString().split("T")[0];
  const todayShift = schedules.find((s) => {
    const shiftDate = new Date(s.date).toISOString().split("T")[0];
    return shiftDate === today;
  });
  const recentNotifications = notifications.slice(0, 3);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchSchedules(), refetchNotifications(), refreshUser()]);
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
    if (!user?.contract?.endDate) return null;
    const end = new Date(user.contract.endDate);
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

  const getRoleLabel = () => {
    switch (user?.role) {
      case "admin": return "Administrator";
      case "manager": return "Manager";
      default: return "Staff Member";
    }
  };

  const unreadCardStyle: ViewStyle = { borderLeftWidth: 3, borderLeftColor: SemanticColors.primary };
  const cardMarginStyle: ViewStyle = { marginBottom: Spacing.sm };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.md, paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.link}
          />
        }
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <ThemedText type="h2" style={styles.greeting}>
            {getGreeting()}, {user?.name?.split(" ")[0] || "there"}
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
            {getRoleLabel()}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Card elevation={2} style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <ThemedText type="h4">Your Status</ThemedText>
              <StatusBadge status={standingInfo.variant} label={standingInfo.label} />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Feather name="dollar-sign" size={20} color={theme.link} />
                <ThemedText type="h3" style={styles.statValue}>
                  {user?.accumulatedSalary ? `€${parseFloat(user.accumulatedSalary).toFixed(2)}` : "€0.00"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Accumulated
                </ThemedText>
              </View>
              <View style={[styles.statItem, styles.statBorder, { borderColor: theme.border }]}>
                <Feather name="clock" size={20} color={theme.link} />
                <ThemedText type="h3" style={styles.statValue}>
                  {user?.hourlyRate ? `€${parseFloat(user.hourlyRate).toFixed(2)}` : "€15.00"}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Hourly Rate
                </ThemedText>
              </View>
              {contractDays !== null ? (
                <View style={styles.statItem}>
                  <Feather name="calendar" size={20} color={contractDays < 30 ? SemanticColors.warning : theme.link} />
                  <ThemedText type="h3" style={styles.statValue}>
                    {contractDays}
                  </ThemedText>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Days Left
                  </ThemedText>
                </View>
              ) : null}
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Today's Shift</ThemedText>
          </View>

          {todayShift ? (
            <Card elevation={1} style={styles.shiftCard}>
              <View style={styles.shiftInfo}>
                <View style={[styles.shiftIcon, { backgroundColor: theme.backgroundSecondary }]}>
                  <Feather name="briefcase" size={24} color={theme.link} />
                </View>
                <View style={styles.shiftDetails}>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {todayShift.position}
                  </ThemedText>
                  <ThemedText type="body" style={{ color: theme.textSecondary }}>
                    {todayShift.startTime} - {todayShift.endTime}
                  </ThemedText>
                  {todayShift.breakStart ? (
                    <ThemedText type="small" style={{ color: theme.textSecondary }}>
                      Break: {todayShift.breakStart} - {todayShift.breakEnd}
                    </ThemedText>
                  ) : null}
                </View>
              </View>
            </Card>
          ) : (
            <Card elevation={1} style={styles.shiftCard}>
              <View style={styles.noShift}>
                <Feather name="coffee" size={32} color={theme.textSecondary} />
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                  No shift scheduled for today
                </ThemedText>
              </View>
            </Card>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={styles.sectionHeader}>
            <ThemedText type="h4">Recent Notifications</ThemedText>
          </View>

          {recentNotifications.length > 0 ? (
            recentNotifications.map((notif, index) => (
              <Card
                key={notif.id}
                elevation={1}
                style={[cardMarginStyle, !notif.isRead ? unreadCardStyle : undefined] as ViewStyle}
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
                    <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={2}>
                      {notif.message}
                    </ThemedText>
                  </View>
                </View>
              </Card>
            ))
          ) : (
            <Card elevation={1}>
              <View style={styles.noShift}>
                <Feather name="bell-off" size={32} color={theme.textSecondary} />
                <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
                  No notifications
                </ThemedText>
              </View>
            </Card>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)} style={styles.sosContainer}>
          <SOSButton onPress={handleSOS} />
        </Animated.View>
      </ScrollView>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  greeting: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.lg,
  },
  statusCard: {
    marginBottom: Spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  statValue: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.xxs,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  shiftCard: {
    marginBottom: Spacing.md,
  },
  shiftInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  shiftIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  shiftDetails: {
    flex: 1,
  },
  noShift: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
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
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.round,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  notificationContent: {
    flex: 1,
  },
  sosContainer: {
    marginTop: Spacing.xl,
    alignItems: "center",
  },
});
