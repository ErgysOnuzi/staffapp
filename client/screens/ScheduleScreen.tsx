import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
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
import { EmptyState } from "@/components/EmptyState";
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type ViewMode = "week" | "month";

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: schedules = [], refetch, isLoading } = useQuery<ScheduleShift[]>({
    queryKey: ["/api/schedules"],
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSOS = () => {
    navigation.navigate("SOS");
  };

  const today = new Date().toISOString().split("T")[0];

  const calculateHours = (start: string, end: string, breakStart?: string, breakEnd?: string) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM);

    if (breakStart && breakEnd) {
      const [breakStartH, breakStartM] = breakStart.split(":").map(Number);
      const [breakEndH, breakEndM] = breakEnd.split(":").map(Number);
      totalMinutes -= (breakEndH * 60 + breakEndM) - (breakStartH * 60 + breakStartM);
    }

    return (totalMinutes / 60).toFixed(1);
  };

  const sortedSchedules = [...schedules].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcomingSchedules = sortedSchedules.filter(s => {
    const shiftDate = new Date(s.date).toISOString().split("T")[0];
    return shiftDate >= today;
  });

  const todayCardStyle: ViewStyle = { borderWidth: 2, borderColor: SemanticColors.primary };
  const shiftCardMarginStyle: ViewStyle = { marginBottom: Spacing.md };

  const renderShift = ({ item, index }: { item: ScheduleShift; index: number }) => {
    const shiftDate = new Date(item.date);
    const shiftDateStr = shiftDate.toISOString().split("T")[0];
    const isToday = shiftDateStr === today;

    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
        <Card elevation={1} style={[shiftCardMarginStyle, isToday ? todayCardStyle : undefined] as ViewStyle}>
          <View style={styles.shiftHeader}>
            <View>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {DAYS[shiftDate.getDay()]}, {MONTHS[shiftDate.getMonth()]} {shiftDate.getDate()}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                {item.position}
              </ThemedText>
            </View>
            {isToday ? (
              <View style={[styles.todayBadge, { backgroundColor: SemanticColors.primary }]}>
                <ThemedText type="caption" style={{ color: "#FFF" }}>
                  TODAY
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View style={styles.shiftDetails}>
            <View style={styles.timeBlock}>
              <Feather name="clock" size={16} color={theme.link} />
              <ThemedText type="body" style={{ marginLeft: Spacing.xs }}>
                {item.startTime} - {item.endTime}
              </ThemedText>
            </View>

            {item.breakStart ? (
              <View style={styles.timeBlock}>
                <Feather name="coffee" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ marginLeft: Spacing.xs, color: theme.textSecondary }}>
                  Break: {item.breakStart} - {item.breakEnd}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.timeBlock}>
              <Feather name="activity" size={16} color={SemanticColors.success} />
              <ThemedText type="small" style={{ marginLeft: Spacing.xs, color: SemanticColors.success }}>
                {calculateHours(item.startTime, item.endTime, item.breakStart, item.breakEnd)}h working time
              </ThemedText>
            </View>
          </View>
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <View style={styles.viewToggle}>
          <Pressable
            style={[
              styles.toggleButton,
              viewMode === "week" && { backgroundColor: theme.link },
            ]}
            onPress={() => setViewMode("week")}
          >
            <ThemedText
              type="small"
              style={{ color: viewMode === "week" ? "#FFF" : theme.textPrimary }}
            >
              Week
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.toggleButton,
              viewMode === "month" && { backgroundColor: theme.link },
            ]}
            onPress={() => setViewMode("month")}
          >
            <ThemedText
              type="small"
              style={{ color: viewMode === "month" ? "#FFF" : theme.textPrimary }}
            >
              Month
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={upcomingSchedules}
        keyExtractor={(item) => item.id}
        renderItem={renderShift}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.link}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="calendar"
            title="No Upcoming Shifts"
            message="Your schedule is empty. Check back later for new shifts."
          />
        }
        ListFooterComponent={
          <View style={styles.sosContainer}>
            <SOSButton onPress={handleSOS} />
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  shiftCard: {
    marginBottom: Spacing.md,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: SemanticColors.primary,
  },
  shiftHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  todayBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xxs,
    borderRadius: BorderRadius.sm,
  },
  shiftDetails: {
    gap: Spacing.xs,
  },
  timeBlock: {
    flexDirection: "row",
    alignItems: "center",
  },
  sosContainer: {
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
});
