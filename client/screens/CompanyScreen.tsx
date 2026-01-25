import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { UsersStackParamList } from "@/navigation/UsersStackNavigator";

interface Company {
  id: string;
  name: string;
  code: string;
  address?: string;
  createdAt: string;
}

interface CompanyStats {
  totalUsers: number;
  admins: number;
  managers: number;
  staff: number;
  totalMarkets: number;
  pendingRequests: number;
}

type CompanyNavigationProp = NativeStackNavigationProp<UsersStackParamList, "Company">;

export default function CompanyScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<CompanyNavigationProp>();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Company>>({});

  const { data: company, refetch: refetchCompany, isLoading } = useQuery<Company>({
    queryKey: ["/api/companies"],
  });

  const { data: stats, refetch: refetchStats } = useQuery<CompanyStats>({
    queryKey: ["/api/admin/company-stats"],
  });

  useFocusEffect(
    useCallback(() => {
      refetchCompany();
      refetchStats();
    }, [])
  );

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Company>) => {
      return apiRequest("PUT", "/api/companies", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setIsEditing(false);
      setEditData({});
    },
  });

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  const displayData = { ...company, ...editData };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: tabBarHeight + Spacing.xl },
        ]}
      >
        <Card elevation={2} style={styles.companyCard}>
          <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="briefcase" size={40} color={theme.link} />
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Company Name
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={displayData.name || ""}
                  onChangeText={(text) => setEditData({ ...editData, name: text })}
                  placeholder="Enter company name"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Address
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={displayData.address || ""}
                  onChangeText={(text) => setEditData({ ...editData, address: text })}
                  placeholder="Enter company address"
                  placeholderTextColor={theme.textSecondary}
                  multiline
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Company Code (Read-only)
                </ThemedText>
                <View style={[styles.codeContainer, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText type="heading" style={{ color: theme.link }}>
                    {company?.code}
                  </ThemedText>
                </View>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  Share this code with employees to join
                </ThemedText>
              </View>
            </View>
          ) : (
            <>
              <ThemedText type="heading" style={{ marginTop: Spacing.md }}>
                {company?.name || "Company"}
              </ThemedText>
              {company?.address ? (
                <View style={styles.addressRow}>
                  <Feather name="map-pin" size={16} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                    {company.address}
                  </ThemedText>
                </View>
              ) : null}
              <View style={[styles.codeBadge, { backgroundColor: `${theme.link}20` }]}>
                <ThemedText type="small" style={{ color: theme.link, fontWeight: "600" }}>
                  Code: {company?.code}
                </ThemedText>
              </View>
            </>
          )}
        </Card>

        <Card elevation={1} style={styles.statsCard}>
          <ThemedText type="subheading" style={{ marginBottom: Spacing.md }}>
            Company Overview
          </ThemedText>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${SemanticColors.info}20` }]}>
                <Feather name="users" size={24} color={SemanticColors.info} />
              </View>
              <ThemedText type="heading" style={{ marginTop: Spacing.sm }}>
                {stats?.totalUsers || 0}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Total Users
              </ThemedText>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${SemanticColors.error}20` }]}>
                <Feather name="shield" size={24} color={SemanticColors.error} />
              </View>
              <ThemedText type="heading" style={{ marginTop: Spacing.sm }}>
                {stats?.admins || 0}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Admins
              </ThemedText>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${SemanticColors.warning}20` }]}>
                <Feather name="star" size={24} color={SemanticColors.warning} />
              </View>
              <ThemedText type="heading" style={{ marginTop: Spacing.sm }}>
                {stats?.managers || 0}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Managers
              </ThemedText>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${SemanticColors.success}20` }]}>
                <Feather name="user" size={24} color={SemanticColors.success} />
              </View>
              <ThemedText type="heading" style={{ marginTop: Spacing.sm }}>
                {stats?.staff || 0}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Staff
              </ThemedText>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${theme.link}20` }]}>
                <Feather name="map-pin" size={24} color={theme.link} />
              </View>
              <ThemedText type="heading" style={{ marginTop: Spacing.sm }}>
                {stats?.totalMarkets || 0}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Locations
              </ThemedText>
            </View>

            <View style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${SemanticColors.warning}20` }]}>
                <Feather name="clock" size={24} color={SemanticColors.warning} />
              </View>
              <ThemedText type="heading" style={{ marginTop: Spacing.sm }}>
                {stats?.pendingRequests || 0}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Pending
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card elevation={1} style={styles.quickActionsCard}>
          <ThemedText type="subheading" style={{ marginBottom: Spacing.md }}>
            Quick Actions
          </ThemedText>

          <Pressable
            style={[styles.actionRow, { borderBottomColor: theme.backgroundSecondary }]}
            onPress={() => navigation.navigate("Users")}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${SemanticColors.info}20` }]}>
              <Feather name="users" size={20} color={SemanticColors.info} />
            </View>
            <View style={styles.actionInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Manage Users</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                View, edit, and add users
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            style={[styles.actionRow, { borderBottomColor: theme.backgroundSecondary }]}
            onPress={() => navigation.navigate("Markets")}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${theme.link}20` }]}>
              <Feather name="map-pin" size={20} color={theme.link} />
            </View>
            <View style={styles.actionInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Manage Locations</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Add and edit work locations
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            style={[styles.actionRow, { borderBottomColor: theme.backgroundSecondary }]}
            onPress={() => navigation.navigate("AddUser")}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${SemanticColors.success}20` }]}>
              <Feather name="user-plus" size={20} color={SemanticColors.success} />
            </View>
            <View style={styles.actionInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Add New User</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Create a new employee account
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.actionRow}
            onPress={() => navigation.navigate("AddCompany")}
          >
            <View style={[styles.actionIcon, { backgroundColor: `${SemanticColors.warning}20` }]}>
              <Feather name="briefcase" size={20} color={SemanticColors.warning} />
            </View>
            <View style={styles.actionInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Create Company</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Add a new company (Owner/Admin only)
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
        </Card>

        <View style={styles.actions}>
          {isEditing ? (
            <>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.link }]}
                onPress={handleSave}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Feather name="check" size={20} color="#FFFFFF" />
                    <ThemedText type="body" style={styles.actionButtonText}>
                      Save Changes
                    </ThemedText>
                  </>
                )}
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
                onPress={() => {
                  setIsEditing(false);
                  setEditData({});
                }}
              >
                <Feather name="x" size={20} color={theme.text} />
                <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>
                  Cancel
                </ThemedText>
              </Pressable>
            </>
          ) : (
            <Pressable
              style={[styles.actionButton, { backgroundColor: theme.link }]}
              onPress={() => setIsEditing(true)}
            >
              <Feather name="edit-2" size={20} color="#FFFFFF" />
              <ThemedText type="body" style={styles.actionButtonText}>
                Edit Company Info
              </ThemedText>
            </Pressable>
          )}
        </View>

        <ThemedText type="small" style={[styles.createdAt, { color: theme.textSecondary }]}>
          Company created: {company?.createdAt ? new Date(company.createdAt).toLocaleDateString() : "N/A"}
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  companyCard: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  codeBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  editForm: {
    width: "100%",
    marginTop: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    fontSize: 16,
  },
  codeContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  statsCard: {
    marginBottom: Spacing.lg,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  statItem: {
    width: "33.33%",
    paddingHorizontal: Spacing.xs,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionsCard: {
    marginBottom: Spacing.lg,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  actionInfo: {
    flex: 1,
  },
  actions: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    color: "#FFFFFF",
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  createdAt: {
    textAlign: "center",
  },
});
