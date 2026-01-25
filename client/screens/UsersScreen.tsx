import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";
import { UsersStackParamList } from "@/navigation/UsersStackNavigator";

type UserRole = "owner" | "admin" | "cfo" | "hr_admin" | "manager" | "supervisor" | "staff";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  standing: "all_good" | "good" | "at_risk";
  hourlyRate?: string;
  accumulatedSalary?: string;
}

type UsersNavigationProp = NativeStackNavigationProp<UsersStackParamList, "Users">;

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<UsersNavigationProp>();

  const [filter, setFilter] = useState<"all" | UserRole>("all");

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
      case "owner": return "#6B21A8";
      case "admin": return SemanticColors.error;
      case "cfo": return "#059669";
      case "hr_admin": return "#7C3AED";
      case "manager": return SemanticColors.warning;
      case "supervisor": return "#0891B2";
      default: return SemanticColors.info;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner": return "Owner";
      case "admin": return "Admin";
      case "cfo": return "CFO";
      case "hr_admin": return "HR Admin";
      case "manager": return "Manager";
      case "supervisor": return "Supervisor";
      default: return "Staff";
    }
  };

  const filters: Array<"all" | UserRole> = ["all", "staff", "supervisor", "manager", "admin"];

  const renderUser = ({ item }: { item: User }) => (
      <Card 
        elevation={1} 
        style={styles.userCard}
        onPress={() => navigation.navigate("UserDetail", { userId: item.id })}
      >
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
              variant={getStandingVariant(item.standing)} 
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

        <View style={styles.tapHint}>
          <ThemedText type="small" style={{ color: theme.link }}>Tap to view details</ThemedText>
          <Feather name="chevron-right" size={16} color={theme.link} />
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
          { paddingBottom: insets.bottom + Spacing.xl + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.link}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.link} />
            </View>
          ) : (
            <EmptyState
              icon="users"
              title="No users found"
              message={filter === "all" ? "No users in the system yet" : `No ${filter}s found`}
            />
          )
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: theme.link }]}
        onPress={() => navigation.navigate("AddUser")}
      >
        <Feather name="user-plus" size={24} color="#FFFFFF" />
      </Pressable>
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
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: "center",
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
  tapHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.xl + 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});
