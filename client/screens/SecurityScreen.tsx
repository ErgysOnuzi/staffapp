import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, SemanticColors } from "@/constants/theme";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/query-client";

export default function SecurityScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, refreshUser } = useAuth();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      return apiRequest("PUT", "/api/profile/password", data);
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: Error) => {
      Alert.alert("Error", error.message || "Failed to change password");
    },
  });

  const toggle2FAMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      return apiRequest("PUT", "/api/profile/2fa", { enabled });
    },
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await refreshUser();
    },
    onError: (error: Error) => {
      setTwoFactorEnabled(!twoFactorEnabled);
      Alert.alert("Error", error.message || "Failed to update 2FA setting");
    },
  });

  const handleToggle2FA = (value: boolean) => {
    setTwoFactorEnabled(value);
    toggle2FAMutation.mutate(value);
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }
    if (!newPassword) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Error", "New password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <ThemedText type="h4" style={styles.sectionTitle}>
          Two-Factor Authentication
        </ThemedText>
        <Card elevation={1} style={styles.card}>
          <View style={styles.twoFactorRow}>
            <View style={styles.twoFactorInfo}>
              <View style={[styles.iconBox, { backgroundColor: theme.link + "20" }]}>
                <Feather name="shield" size={20} color={theme.link} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Enable 2FA
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Add an extra layer of security to your account
                </ThemedText>
              </View>
            </View>
            <Switch
              value={twoFactorEnabled}
              onValueChange={handleToggle2FA}
              trackColor={{
                false: theme.backgroundTertiary,
                true: theme.link + "80",
              }}
              thumbColor={twoFactorEnabled ? theme.link : theme.backgroundDefault}
            />
          </View>
        </Card>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Change Password
        </ThemedText>
        <Card elevation={1} style={styles.card}>
          <Input
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Enter current password"
            isPassword
          />

          <View style={{ height: Spacing.lg }} />

          <Input
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Enter new password"
            isPassword
          />
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            Must be at least 8 characters
          </ThemedText>

          <View style={{ height: Spacing.lg }} />

          <Input
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm new password"
            isPassword
          />

          <View style={{ height: Spacing.xl }} />

          <Button
            onPress={handleChangePassword}
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
          </Button>
        </Card>

        <Card elevation={1} style={{ ...styles.card, backgroundColor: SemanticColors.warning + "10" }}>
          <View style={styles.warningRow}>
            <Feather name="alert-triangle" size={20} color={SemanticColors.warning} />
            <ThemedText type="small" style={{ color: theme.textSecondary, flex: 1 }}>
              Make sure to use a strong, unique password that you don't use for other accounts.
            </ThemedText>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  card: {
    marginBottom: Spacing.xl,
  },
  twoFactorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  twoFactorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
});
