import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { UsersStackParamList } from "@/navigation/UsersStackNavigator";

interface Market {
  id: string;
  name: string;
  address?: string;
}

type AddUserNavigationProp = NativeStackNavigationProp<UsersStackParamList, "AddUser">;

export default function AddUserScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<AddUserNavigationProp>();
  const queryClient = useQueryClient();

  type UserRole = "owner" | "admin" | "cfo" | "hr_admin" | "manager" | "supervisor" | "staff";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "staff" as UserRole,
    hourlyRate: "15.00",
    holidayRate: "22.50",
    marketId: undefined as string | undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: markets = [] } = useQuery<Market[]>({
    queryKey: ["/api/markets"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/users", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      navigation.goBack();
    },
    onError: (error: any) => {
      setErrors({ submit: error.message || "Failed to create user" });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      createMutation.mutate();
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

  const allRoles: UserRole[] = ["owner", "admin", "cfo", "hr_admin", "manager", "supervisor", "staff"];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <Card elevation={1} style={styles.formCard}>
            <View style={styles.header}>
              <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name="user-plus" size={32} color={theme.link} />
              </View>
              <ThemedText type="subheading" style={{ marginTop: Spacing.md }}>
                Add New User
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                Create a new user account for your company
              </ThemedText>
            </View>

            {errors.submit ? (
              <View style={[styles.errorBanner, { backgroundColor: `${SemanticColors.error}20` }]}>
                <Feather name="alert-circle" size={16} color={SemanticColors.error} />
                <ThemedText type="small" style={{ color: SemanticColors.error, marginLeft: Spacing.sm }}>
                  {errors.submit}
                </ThemedText>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                Full Name *
              </ThemedText>
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  errors.name ? { borderColor: SemanticColors.error, borderWidth: 1 } : {},
                ]}
                value={formData.name}
                onChangeText={(text) => {
                  setFormData({ ...formData, name: text });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="John Doe"
                placeholderTextColor={theme.textSecondary}
              />
              {errors.name ? (
                <ThemedText type="small" style={{ color: SemanticColors.error, marginTop: Spacing.xs }}>
                  {errors.name}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                Email Address *
              </ThemedText>
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  errors.email ? { borderColor: SemanticColors.error, borderWidth: 1 } : {},
                ]}
                value={formData.email}
                onChangeText={(text) => {
                  setFormData({ ...formData, email: text.toLowerCase() });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                placeholder="john@example.com"
                placeholderTextColor={theme.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? (
                <ThemedText type="small" style={{ color: SemanticColors.error, marginTop: Spacing.xs }}>
                  {errors.email}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                Password *
              </ThemedText>
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: theme.backgroundSecondary, color: theme.text },
                  errors.password ? { borderColor: SemanticColors.error, borderWidth: 1 } : {},
                ]}
                value={formData.password}
                onChangeText={(text) => {
                  setFormData({ ...formData, password: text });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
                placeholder="Min 6 characters"
                placeholderTextColor={theme.textSecondary}
                secureTextEntry
              />
              {errors.password ? (
                <ThemedText type="small" style={{ color: SemanticColors.error, marginTop: Spacing.xs }}>
                  {errors.password}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                Phone Number
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="+1 234 567 890"
                placeholderTextColor={theme.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={styles.label}>
                Role
              </ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.roleButtons}>
                  {allRoles.map((role) => (
                    <Pressable
                      key={role}
                      style={[
                        styles.roleButton,
                        { 
                          backgroundColor: formData.role === role ? getRoleColor(role) : theme.backgroundSecondary,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, role })}
                    >
                      <ThemedText
                        type="small"
                        style={{ 
                          color: formData.role === role ? "#FFFFFF" : theme.text,
                          fontWeight: "600",
                        }}
                      >
                        {getRoleLabel(role)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText type="small" style={styles.label}>
                  Hourly Rate
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={formData.hourlyRate}
                  onChangeText={(text) => setFormData({ ...formData, hourlyRate: text })}
                  placeholder="15.00"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText type="small" style={styles.label}>
                  Holiday Rate
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={formData.holidayRate}
                  onChangeText={(text) => setFormData({ ...formData, holidayRate: text })}
                  placeholder="22.50"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {markets.length > 0 ? (
              <View style={styles.inputGroup}>
                <ThemedText type="small" style={styles.label}>
                  Assign to Location
                </ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.roleButtons}>
                    <Pressable
                      style={[
                        styles.roleButton,
                        { 
                          backgroundColor: !formData.marketId ? theme.link : theme.backgroundSecondary,
                        },
                      ]}
                      onPress={() => setFormData({ ...formData, marketId: undefined })}
                    >
                      <ThemedText
                        type="small"
                        style={{ 
                          color: !formData.marketId ? "#FFFFFF" : theme.text,
                          fontWeight: "600",
                        }}
                      >
                        No Location
                      </ThemedText>
                    </Pressable>
                    {markets.map((market) => (
                      <Pressable
                        key={market.id}
                        style={[
                          styles.roleButton,
                          { 
                            backgroundColor: formData.marketId === market.id ? theme.link : theme.backgroundSecondary,
                          },
                        ]}
                        onPress={() => setFormData({ ...formData, marketId: market.id })}
                      >
                        <ThemedText
                          type="small"
                          style={{ 
                            color: formData.marketId === market.id ? "#FFFFFF" : theme.text,
                            fontWeight: "600",
                          }}
                        >
                          {market.name}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : null}
          </Card>

          <View style={styles.actions}>
            <Pressable
              style={[styles.submitButton, { backgroundColor: theme.link }]}
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="user-plus" size={20} color="#FFFFFF" />
                  <ThemedText type="body" style={styles.submitButtonText}>
                    Create User
                  </ThemedText>
                </>
              )}
            </Pressable>

            <Pressable
              style={[styles.cancelButton, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => navigation.goBack()}
            >
              <ThemedText type="body">Cancel</ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  formCard: {
    marginBottom: Spacing.lg,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  roleButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  roleButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  actions: {
    gap: Spacing.md,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  submitButtonText: {
    color: "#FFFFFF",
    marginLeft: Spacing.sm,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
