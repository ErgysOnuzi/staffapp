import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";

interface User {
  id: string;
  name: string;
  email: string;
  role: "staff" | "manager" | "admin";
  standing: "all_good" | "good" | "at_risk";
  hourlyRate?: string;
  accumulatedSalary?: string;
}

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [filter, setFilter] = useState<"all" | "staff" | "manager" | "admin">("all");

  const { data: users = [], refetch, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  const getStandingVariant = (standing: string) => {
    switch (standing) {
      case "all_good": return "success" as const;
      case "good": return "info" as const;
      case "at_risk": return "warning" as const;
      default: return "pending" as const;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return SemanticColors.error;
      case "manager": return SemanticColors.warning;
      default: return SemanticColors.info;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "manager": return "Manager";
      default: return "Staff";
    }
  };

  const filters: Array<"all" | "staff" | "manager" | "admin"> = ["all", "staff", "manager", "admin"];

  const renderUser = ({ item }: { item: User }) => (
    <Card elevation={1} style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="user" size={24} color={theme.link} />
        </View>
        <View style={styles.userInfo}>
          <ThemedText type="body" style={{ fontWeight: "600" }}>
            {item.name}
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            {item.email}
          </ThemedText>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
          <ThemedText type="small" style={styles.roleText}>
            {getRoleLabel(item.role)}
          </ThemedText>
        </View>
      </View>
      
      <View style={styles.userDetails}>
        <View style={styles.detailItem}>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>Standing</ThemedText>
          <StatusBadge 
            status={getStandingVariant(item.standing)} 
            label={item.standing.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} 
          />
        </View>
        {item.hourlyRate ? (
          <View style={styles.detailItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Rate</ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              €{parseFloat(item.hourlyRate).toFixed(2)}/hr
            </ThemedText>
          </View>
        ) : null}
        {item.accumulatedSalary ? (
          <View style={styles.detailItem}>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>Salary</ThemedText>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              €{parseFloat(item.accumulatedSalary).toFixed(2)}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Card>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.filterContainer, { paddingTop: headerHeight + Spacing.sm }]}>
        {filters.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterButton,
              { backgroundColor: filter === f ? theme.link : theme.backgroundSecondary },
            ]}
          >
            <ThemedText
              type="small"
              style={{ color: filter === f ? "#FFFFFF" : theme.text, fontWeight: "600" }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
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
            icon="users"
            title="No users found"
            message={filter === "all" ? "No users in the system yet" : `No ${filter}s found`}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  userCard: {
    marginBottom: Spacing.md,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  userDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  detailItem: {
    alignItems: "center",
  },
});
