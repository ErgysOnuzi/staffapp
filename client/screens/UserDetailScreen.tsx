import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";
import { apiRequest } from "@/lib/queryClient";
import { UsersStackParamList } from "@/navigation/UsersStackNavigator";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "staff" | "manager" | "admin";
  standing: "all_good" | "good" | "at_risk";
  hourlyRate?: string;
  holidayRate?: string;
  accumulatedSalary?: string;
  marketId?: string;
  createdAt: string;
}

interface Market {
  id: string;
  name: string;
  address?: string;
}

type UserDetailRouteProp = RouteProp<UsersStackParamList, "UserDetail">;
type UserDetailNavigationProp = NativeStackNavigationProp<UsersStackParamList, "UserDetail">;

export default function UserDetailScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<UserDetailNavigationProp>();
  const route = useRoute<UserDetailRouteProp>();
  const queryClient = useQueryClient();
  const { userId } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);

  const { data: user, refetch, isLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  const { data: markets = [] } = useQuery<Market[]>({
    queryKey: ["/api/markets"],
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<User>) => {
      return apiRequest(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditing(false);
      setEditData({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/users/${userId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      navigation.goBack();
    },
  });

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${user?.name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteMutation.mutate(),
        },
      ]
    );
  };

  const handleRoleChange = (newRole: string) => {
    setPendingRole(newRole);
    setShowRoleConfirm(true);
  };

  const confirmRoleChange = () => {
    if (pendingRole) {
      setEditData({ ...editData, role: pendingRole as "staff" | "manager" | "admin" });
      setShowRoleConfirm(false);
      setPendingRole(null);
    }
  };

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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText>User not found</ThemedText>
      </View>
    );
  }

  const displayData = { ...user, ...editData };
  const currentMarket = markets.find(m => m.id === displayData.marketId);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Card elevation={2} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="user" size={40} color={theme.link} />
            </View>
            <View style={[styles.roleBadge, { backgroundColor: getRoleColor(displayData.role) }]}>
              <ThemedText type="small" style={styles.roleText}>
                {getRoleLabel(displayData.role)}
              </ThemedText>
            </View>
          </View>

          {isEditing ? (
            <View style={styles.editForm}>
              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Name
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={displayData.name}
                  onChangeText={(text) => setEditData({ ...editData, name: text })}
                  placeholder="Enter name"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Email
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={displayData.email}
                  onChangeText={(text) => setEditData({ ...editData, email: text })}
                  placeholder="Enter email"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Phone
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={displayData.phone || ""}
                  onChangeText={(text) => setEditData({ ...editData, phone: text })}
                  placeholder="Enter phone"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Role
                </ThemedText>
                <View style={styles.roleButtons}>
                  {["staff", "manager", "admin"].map((role) => (
                    <Pressable
                      key={role}
                      style={[
                        styles.roleButton,
                        { 
                          backgroundColor: displayData.role === role ? getRoleColor(role) : theme.backgroundSecondary,
                        },
                      ]}
                      onPress={() => handleRoleChange(role)}
                    >
                      <ThemedText
                        type="small"
                        style={{ 
                          color: displayData.role === role ? "#FFFFFF" : theme.text,
                          fontWeight: "600",
                        }}
                      >
                        {getRoleLabel(role)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Standing
                </ThemedText>
                <View style={styles.roleButtons}>
                  {["all_good", "good", "at_risk"].map((standing) => (
                    <Pressable
                      key={standing}
                      style={[
                        styles.roleButton,
                        { 
                          backgroundColor: displayData.standing === standing 
                            ? getStandingVariant(standing) === "success" 
                              ? SemanticColors.success 
                              : getStandingVariant(standing) === "warning"
                                ? SemanticColors.warning
                                : SemanticColors.info
                            : theme.backgroundSecondary,
                        },
                      ]}
                      onPress={() => setEditData({ ...editData, standing: standing as any })}
                    >
                      <ThemedText
                        type="small"
                        style={{ 
                          color: displayData.standing === standing ? "#FFFFFF" : theme.text,
                          fontWeight: "600",
                        }}
                      >
                        {standing.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Hourly Rate
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={displayData.hourlyRate || ""}
                  onChangeText={(text) => setEditData({ ...editData, hourlyRate: text })}
                  placeholder="15.00"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Holiday Rate
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={displayData.holidayRate || ""}
                  onChangeText={(text) => setEditData({ ...editData, holidayRate: text })}
                  placeholder="22.50"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                  Location
                </ThemedText>
                <View style={styles.roleButtons}>
                  <Pressable
                    style={[
                      styles.roleButton,
                      { 
                        backgroundColor: !displayData.marketId ? theme.link : theme.backgroundSecondary,
                        flex: 1,
                      },
                    ]}
                    onPress={() => setEditData({ ...editData, marketId: undefined })}
                  >
                    <ThemedText
                      type="small"
                      style={{ 
                        color: !displayData.marketId ? "#FFFFFF" : theme.text,
                        fontWeight: "600",
                      }}
                    >
                      None
                    </ThemedText>
                  </Pressable>
                  {markets.map((market) => (
                    <Pressable
                      key={market.id}
                      style={[
                        styles.roleButton,
                        { 
                          backgroundColor: displayData.marketId === market.id ? theme.link : theme.backgroundSecondary,
                          flex: 1,
                        },
                      ]}
                      onPress={() => setEditData({ ...editData, marketId: market.id })}
                    >
                      <ThemedText
                        type="small"
                        style={{ 
                          color: displayData.marketId === market.id ? "#FFFFFF" : theme.text,
                          fontWeight: "600",
                        }}
                      >
                        {market.name}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <>
              <ThemedText type="heading" style={styles.userName}>
                {user.name}
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                {user.email}
              </ThemedText>
              {user.phone ? (
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                  {user.phone}
                </ThemedText>
              ) : null}
              <StatusBadge 
                status={getStandingVariant(user.standing)} 
                label={user.standing.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} 
              />
            </>
          )}
        </Card>

        <Card elevation={1} style={styles.detailsCard}>
          <ThemedText type="subheading" style={{ marginBottom: Spacing.md }}>
            Employment Details
          </ThemedText>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="dollar-sign" size={20} color={theme.link} />
            </View>
            <View style={styles.detailInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Hourly Rate
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {user.hourlyRate ? `€${parseFloat(user.hourlyRate).toFixed(2)}/hr` : "Not set"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="sun" size={20} color={theme.link} />
            </View>
            <View style={styles.detailInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Holiday Rate
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {user.holidayRate ? `€${parseFloat(user.holidayRate).toFixed(2)}/hr` : "Not set"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="credit-card" size={20} color={theme.link} />
            </View>
            <View style={styles.detailInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Accumulated Salary
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {user.accumulatedSalary ? `€${parseFloat(user.accumulatedSalary).toFixed(2)}` : "€0.00"}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <Feather name="map-pin" size={20} color={theme.link} />
            </View>
            <View style={styles.detailInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Location
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {currentMarket?.name || "Not assigned"}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.detailIcon}>
              <Feather name="calendar" size={20} color={theme.link} />
            </View>
            <View style={styles.detailInfo}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Member Since
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {new Date(user.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </View>
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
            <>
              <Pressable
                style={[styles.actionButton, { backgroundColor: theme.link }]}
                onPress={() => setIsEditing(true)}
              >
                <Feather name="edit-2" size={20} color="#FFFFFF" />
                <ThemedText type="body" style={styles.actionButtonText}>
                  Edit User
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: SemanticColors.error }]}
                onPress={handleDelete}
              >
                <Feather name="trash-2" size={20} color="#FFFFFF" />
                <ThemedText type="body" style={styles.actionButtonText}>
                  Delete User
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>

      {showRoleConfirm ? (
        <View style={styles.modalOverlay}>
          <Card elevation={3} style={styles.confirmModal}>
            <Feather name="alert-triangle" size={40} color={SemanticColors.warning} style={{ alignSelf: "center" }} />
            <ThemedText type="subheading" style={{ textAlign: "center", marginTop: Spacing.md }}>
              Change Role
            </ThemedText>
            <ThemedText type="body" style={{ textAlign: "center", color: theme.textSecondary, marginTop: Spacing.sm }}>
              Are you sure you want to change {user.name}'s role to {pendingRole ? getRoleLabel(pendingRole) : ""}?
            </ThemedText>
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}
                onPress={() => {
                  setShowRoleConfirm(false);
                  setPendingRole(null);
                }}
              >
                <ThemedText type="body">Cancel</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, { backgroundColor: theme.link }]}
                onPress={confirmRoleChange}
              >
                <ThemedText type="body" style={{ color: "#FFFFFF" }}>Confirm</ThemedText>
              </Pressable>
            </View>
          </Card>
        </View>
      ) : null}
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
  profileCard: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  roleBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  editForm: {
    width: "100%",
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
  roleButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  roleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  detailsCard: {
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: "rgba(0,122,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  detailInfo: {
    flex: 1,
  },
  actions: {
    gap: Spacing.md,
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  confirmModal: {
    width: "100%",
    maxWidth: 320,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
