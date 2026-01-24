import React from "react";
import { View, StyleSheet, ScrollView, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { SOSButton } from "@/components/SOSButton";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, SemanticColors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
  rightContent?: React.ReactNode;
  danger?: boolean;
}

function MenuItem({ icon, label, onPress, rightContent, danger }: MenuItemProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? theme.backgroundSecondary : "transparent" },
      ]}
      onPress={onPress}
    >
      <View style={styles.menuLeft}>
        <View
          style={[
            styles.menuIcon,
            {
              backgroundColor: danger
                ? SemanticColors.error + "20"
                : theme.link + "15",
            },
          ]}
        >
          <Feather
            name={icon}
            size={18}
            color={danger ? SemanticColors.error : theme.link}
          />
        </View>
        <ThemedText
          type="body"
          style={[danger && { color: SemanticColors.error }]}
        >
          {label}
        </ThemedText>
      </View>
      {rightContent || (
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleSOS = () => {
    navigation.navigate("SOS");
  };

  const handleLogout = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logout();
  };

  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const getStandingInfo = () => {
    switch (user?.standing) {
      case "all_good":
        return { label: "All Good", variant: "success" as const };
      case "good":
        return { label: "Good", variant: "info" as const };
      case "at_risk":
        return { label: "At Risk", variant: "warning" as const };
      default:
        return { label: "Unknown", variant: "pending" as const };
    }
  };

  const standingInfo = getStandingInfo();

  const getRoleBadge = () => {
    switch (user?.role) {
      case "admin":
        return { label: "Admin", color: SemanticColors.error };
      case "manager":
        return { label: "Manager", color: SemanticColors.warning };
      default:
        return { label: "Staff", color: SemanticColors.info };
    }
  };

  const roleBadge = getRoleBadge();

  const formatContractDate = () => {
    if (!user?.contractEndDate) return "Not set";
    return new Date(user.contractEndDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
      >
        <Animated.View entering={FadeInDown.duration(400).delay(0)}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {user?.profilePicture ? (
                <Image
                  source={{ uri: user.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={[styles.avatar, { backgroundColor: theme.link }]}>
                  <ThemedText type="h2" style={{ color: "#FFF" }}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </ThemedText>
                </View>
              )}
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: roleBadge.color },
                ]}
              >
                <ThemedText type="caption" style={{ color: "#FFF" }}>
                  {roleBadge.label}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="h3" style={styles.userName}>
              {user?.name || "User"}
            </ThemedText>
            <ThemedText type="body" style={{ color: theme.textSecondary }}>
              {user?.email || "email@example.com"}
            </ThemedText>
            <View style={styles.standingRow}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Standing:
              </ThemedText>
              <StatusBadge label={standingInfo.label} variant={standingInfo.variant} />
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Card elevation={1} style={styles.salaryCard}>
            <View style={styles.salaryHeader}>
              <ThemedText type="h4">Salary Summary</ThemedText>
            </View>
            <View style={styles.salaryGrid}>
              <View style={styles.salaryItem}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Accumulated
                </ThemedText>
                <ThemedText type="h3" style={{ color: SemanticColors.success }}>
                  ${user?.accumulatedSalary?.toFixed(2) || "0.00"}
                </ThemedText>
              </View>
              <View style={styles.salaryItem}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Hourly Rate
                </ThemedText>
                <ThemedText type="h4">
                  ${user?.hourlyRate?.toFixed(2) || "0.00"}
                </ThemedText>
              </View>
              <View style={styles.salaryItem}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Holiday Rate
                </ThemedText>
                <ThemedText type="h4">
                  ${user?.holidayRate?.toFixed(2) || "0.00"}
                </ThemedText>
              </View>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Card elevation={1} style={styles.contractCard}>
            <View style={styles.contractRow}>
              <View>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Contract Ends
                </ThemedText>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {formatContractDate()}
                </ThemedText>
              </View>
              <Pressable
                style={[styles.contractButton, { borderColor: theme.link }]}
              >
                <ThemedText type="small" style={{ color: theme.link }}>
                  View Details
                </ThemedText>
              </Pressable>
            </View>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Account
          </ThemedText>
          <Card elevation={1} style={styles.menuCard}>
            <MenuItem
              icon="user"
              label="Edit Profile"
              onPress={() => {}}
            />
            <MenuItem
              icon="settings"
              label="Settings"
              onPress={handleSettings}
            />
            <MenuItem
              icon="globe"
              label="Language"
              onPress={() => {}}
              rightContent={
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  English
                </ThemedText>
              }
            />
            <MenuItem
              icon="shield"
              label="Security"
              onPress={() => {}}
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Card elevation={1} style={styles.menuCard}>
            <MenuItem
              icon="log-out"
              label="Log Out"
              onPress={handleLogout}
              danger
            />
          </Card>
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
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  roleBadge: {
    position: "absolute",
    bottom: 0,
    right: -4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  standingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  salaryCard: {
    marginBottom: Spacing.lg,
  },
  salaryHeader: {
    marginBottom: Spacing.md,
  },
  salaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  salaryItem: {
    alignItems: "center",
  },
  contractCard: {
    marginBottom: Spacing.xl,
  },
  contractRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contractButton: {
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  menuCard: {
    marginBottom: Spacing.lg,
    padding: 0,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
