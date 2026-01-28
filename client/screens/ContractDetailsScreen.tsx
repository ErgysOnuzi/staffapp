import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, SemanticColors } from "@/constants/theme";
import { useQuery } from "@tanstack/react-query";

interface Contract {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  noticeDate: string | null;
  renewalRequested: boolean;
  createdAt: string;
}

export default function ContractDetailsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: contract, isLoading } = useQuery<Contract>({
    queryKey: ["/api/contracts/current"],
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = () => {
    if (!contract?.endDate) return null;
    const end = new Date(contract.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining();

  const getStatusInfo = () => {
    if (!contract?.isActive) {
      return { label: "Inactive", variant: "declined" as const };
    }
    if (daysRemaining !== null && daysRemaining < 30) {
      return { label: "Expiring Soon", variant: "warning" as const };
    }
    return { label: "Active", variant: "success" as const };
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.link} />
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: insets.bottom + Spacing.xl,
            paddingHorizontal: Spacing.lg,
          }}
        >
          <Card elevation={1} style={styles.card}>
            <View style={styles.emptyState}>
              <Feather name="file-text" size={48} color={theme.textSecondary} />
              <ThemedText type="h4" style={{ marginTop: Spacing.lg, textAlign: "center" }}>
                No Contract Found
              </ThemedText>
              <ThemedText type="body" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm }}>
                You don't have an active contract. Please contact your administrator.
              </ThemedText>
            </View>
          </Card>
        </ScrollView>
      </View>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <Card elevation={1} style={styles.card}>
          <View style={styles.statusRow}>
            <ThemedText type="h4">Contract Status</ThemedText>
            <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
          </View>

          {daysRemaining !== null && daysRemaining > 0 ? (
            <View style={[styles.daysBox, { backgroundColor: theme.link + "15" }]}>
              <ThemedText type="h2" style={{ color: theme.link }}>
                {daysRemaining}
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                days remaining
              </ThemedText>
            </View>
          ) : null}
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={{ marginBottom: Spacing.lg }}>
            Contract Details
          </ThemedText>

          <View style={styles.detailRow}>
            <View style={[styles.iconBox, { backgroundColor: SemanticColors.success + "20" }]}>
              <Feather name="calendar" size={18} color={SemanticColors.success} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Start Date
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {formatDate(contract.startDate)}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.detailRow}>
            <View style={[styles.iconBox, { backgroundColor: SemanticColors.error + "20" }]}>
              <Feather name="calendar" size={18} color={SemanticColors.error} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                End Date
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {formatDate(contract.endDate)}
              </ThemedText>
            </View>
          </View>

          {contract.noticeDate ? (
            <>
              <View style={[styles.divider, { backgroundColor: theme.border }]} />
              <View style={styles.detailRow}>
                <View style={[styles.iconBox, { backgroundColor: SemanticColors.warning + "20" }]}>
                  <Feather name="alert-circle" size={18} color={SemanticColors.warning} />
                </View>
                <View style={styles.detailContent}>
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    Notice Date
                  </ThemedText>
                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                    {formatDate(contract.noticeDate)}
                  </ThemedText>
                </View>
              </View>
            </>
          ) : null}
        </Card>

        <Card elevation={1} style={styles.card}>
          <View style={styles.detailRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.link + "20" }]}>
              <Feather name="refresh-cw" size={18} color={theme.link} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Renewal Requested
              </ThemedText>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {contract.renewalRequested ? "Yes" : "No"}
              </ThemedText>
            </View>
          </View>
        </Card>

        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md }}>
          Contact your administrator if you have questions about your contract.
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
  card: {
    marginBottom: Spacing.lg,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  daysBox: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
});
