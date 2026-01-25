import React from "react";
import { View, StyleSheet, ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          alignItems: "center",
        }}
      >
        <View style={[styles.logoContainer, { backgroundColor: theme.link + "20" }]}>
          <Feather name="users" size={48} color={theme.link} />
        </View>

        <ThemedText type="h2" style={styles.appName}>
          StaffHub
        </ThemedText>

        <ThemedText type="body" style={[styles.version, { color: theme.textSecondary }]}>
          Version 1.0.0
        </ThemedText>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="body" style={[styles.description, { color: theme.textSecondary }]}>
            StaffHub is a comprehensive staff management application designed to streamline workforce operations. Manage schedules, track requests, monitor salaries, and stay connected with your team.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Features
          </ThemedText>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: theme.link + "20" }]}>
              <Feather name="calendar" size={20} color={theme.link} />
            </View>
            <View style={styles.featureInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Schedule Management</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                View and manage work schedules
              </ThemedText>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: theme.link + "20" }]}>
              <Feather name="file-text" size={20} color={theme.link} />
            </View>
            <View style={styles.featureInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Request System</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Submit and track requests
              </ThemedText>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: theme.link + "20" }]}>
              <Feather name="users" size={20} color={theme.link} />
            </View>
            <View style={styles.featureInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Team Management</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Manage team members and approvals
              </ThemedText>
            </View>
          </View>
          <View style={styles.featureRow}>
            <View style={[styles.featureIcon, { backgroundColor: theme.link + "20" }]}>
              <Feather name="shield" size={20} color={theme.link} />
            </View>
            <View style={styles.featureInfo}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>Emergency SOS</ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Quick access to emergency assistance
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Developer
          </ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Developed by StaffHub Team
          </ThemedText>
          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
            Kosovo, 2026
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            Contact
          </ThemedText>
          <View style={styles.contactRow}>
            <Feather name="mail" size={16} color={theme.link} />
            <ThemedText type="body" style={{ color: theme.link, marginLeft: Spacing.sm }}>
              support@staffhub.app
            </ThemedText>
          </View>
          <View style={styles.contactRow}>
            <Feather name="globe" size={16} color={theme.link} />
            <ThemedText type="body" style={{ color: theme.link, marginLeft: Spacing.sm }}>
              www.staffhub.app
            </ThemedText>
          </View>
        </Card>

        <ThemedText type="small" style={[styles.copyright, { color: theme.textTertiary }]}>
          2026 StaffHub. All rights reserved.
        </ThemedText>
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
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  appName: {
    marginBottom: Spacing.xs,
  },
  version: {
    marginBottom: Spacing.xl,
  },
  card: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  description: {
    textAlign: "center",
    lineHeight: 22,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  copyright: {
    marginTop: Spacing.lg,
    textAlign: "center",
  },
});
