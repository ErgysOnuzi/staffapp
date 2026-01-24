import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { SOSButton } from "@/components/SOSButton";
import { useTheme } from "@/hooks/useTheme";
import { storage, ScheduleShift } from "@/lib/storage";
import { Spacing, SemanticColors, BorderRadius } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [schedule, setSchedule] = useState<ScheduleShift[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadData = useCallback(async () => {
    const data = await storage.getSchedule();
    setSchedule(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const getWeekDates = () => {
    const dates = [];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();
  const today = new Date().toISOString().split("T")[0];

  const getShiftForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return schedule.find((s) => s.date === dateStr);
  };

  const handleSOS = () => {
    navigation.navigate("SOS");
  };

  const formatDuration = (start: string, end: string) => {
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    const diff = endMins - startMins;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const selectedDateStr = selectedDate.toISOString().split("T")[0];
  const selectedShift = getShiftForDate(selectedDate);

  const upcomingShifts = schedule
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));

  const renderShiftCard = ({ item, index }: { item: ScheduleShift; index: number }) => {
    const shiftDate = new Date(item.date);
    const isToday = item.date === today;

    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
        <Card elevation={1} style={[styles.shiftCard, isToday && styles.todayCard]}>
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

          <View style={styles.shiftTimes}>
            <View style={styles.timeBlock}>
              <Feather name="play-circle" size={18} color={SemanticColors.success} />
              <View>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Start
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {item.startTime}
                </ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.timeBlock}>
              <Feather name="stop-circle" size={18} color={SemanticColors.error} />
              <View>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  End
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {item.endTime}
                </ThemedText>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.timeBlock}>
              <Feather name="clock" size={18} color={theme.link} />
              <View>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Duration
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {formatDuration(item.startTime, item.endTime)}
                </ThemedText>
              </View>
            </View>
          </View>

          {item.breakStart && item.breakEnd ? (
            <View style={[styles.breakInfo, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="coffee" size={16} color={theme.textSecondary} />
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Break: {item.breakStart} - {item.breakEnd}
              </ThemedText>
            </View>
          ) : null}
        </Card>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.weekContainer,
          {
            paddingTop: headerHeight + Spacing.md,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <View style={styles.monthRow}>
          <ThemedText type="h4">
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </ThemedText>
        </View>

        <View style={styles.weekRow}>
          {weekDates.map((date, index) => {
            const dateStr = date.toISOString().split("T")[0];
            const isSelected = dateStr === selectedDateStr;
            const isToday = dateStr === today;
            const hasShift = !!getShiftForDate(date);

            return (
              <Pressable
                key={index}
                style={[
                  styles.dayButton,
                  isSelected && { backgroundColor: theme.link },
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <ThemedText
                  type="caption"
                  style={[
                    styles.dayLabel,
                    { color: isSelected ? "#FFF" : theme.textSecondary },
                  ]}
                >
                  {DAYS[date.getDay()]}
                </ThemedText>
                <ThemedText
                  type="body"
                  style={[
                    styles.dayNumber,
                    {
                      color: isSelected ? "#FFF" : theme.text,
                      fontWeight: isToday ? "700" : "500",
                    },
                  ]}
                >
                  {date.getDate()}
                </ThemedText>
                {hasShift ? (
                  <View
                    style={[
                      styles.shiftDot,
                      { backgroundColor: isSelected ? "#FFF" : SemanticColors.success },
                    ]}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing["5xl"],
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={upcomingShifts}
        keyExtractor={(item) => item.id}
        renderItem={renderShiftCard}
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
            title="No Shifts Scheduled"
            message="You don't have any upcoming shifts. Check back later."
          />
        }
      />

      <SOSButton onPress={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  weekContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  monthRow: {
    marginBottom: Spacing.md,
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    minWidth: 44,
  },
  dayLabel: {
    marginBottom: Spacing.xs,
  },
  dayNumber: {
    fontSize: 18,
  },
  shiftDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: Spacing.xs,
  },
  list: {
    flex: 1,
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
    marginBottom: Spacing.lg,
  },
  todayBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  shiftTimes: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  timeBlock: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: "#E0E0E0",
    marginHorizontal: Spacing.sm,
  },
  breakInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
});
