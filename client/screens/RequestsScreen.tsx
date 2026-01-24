import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery, useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { SOSButton } from "@/components/SOSButton";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, SemanticColors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { apiRequest, queryClient } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Request {
  id: string;
  userId: string;
  type: "request" | "report";
  subject: string;
  details: string;
  status: "pending" | "approved" | "declined";
  isAnonymous: boolean;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
}

type FilterType = "all" | "pending" | "approved" | "declined";

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [filter, setFilter] = useState<FilterType>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: requests = [], refetch, isLoading } = useQuery<Request[]>({
    queryKey: ["/api/requests"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await apiRequest("PATCH", `/api/requests/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  const onRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleSOS = () => {
    navigation.navigate("SOS");
  };

  const handleNewRequest = () => {
    navigation.navigate("SubmitRequest");
  };

  const handleApprove = (id: string) => {
    updateStatusMutation.mutate({ id, status: "approved" });
  };

  const handleDecline = (id: string) => {
    updateStatusMutation.mutate({ id, status: "declined" });
  };

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  const sortedRequests = [...filteredRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const canManageRequests = user?.role === "admin" || user?.role === "manager";

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "declined":
        return "error";
      default:
        return "pending";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderRequest = ({ item, index }: { item: Request; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <Card elevation={1} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestType}>
            <Feather
              name={item.type === "request" ? "file-text" : "alert-circle"}
              size={16}
              color={item.type === "request" ? theme.link : SemanticColors.warning}
            />
            <ThemedText type="caption" style={{ marginLeft: Spacing.xxs, textTransform: "uppercase" }}>
              {item.type}
            </ThemedText>
          </View>
          <StatusBadge
            status={getStatusVariant(item.status) as any}
            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          />
        </View>

        <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.xs }}>
          {item.subject}
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.textSecondary }} numberOfLines={2}>
          {item.details}
        </ThemedText>

        <View style={styles.requestFooter}>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {formatDate(item.createdAt)}
          </ThemedText>
          
          {canManageRequests && item.status === "pending" && item.userId !== user?.id ? (
            <View style={styles.actionButtons}>
              <Pressable
                style={[styles.actionButton, { backgroundColor: SemanticColors.success + "20" }]}
                onPress={() => handleApprove(item.id)}
              >
                <Feather name="check" size={16} color={SemanticColors.success} />
              </Pressable>
              <Pressable
                style={[styles.actionButton, { backgroundColor: SemanticColors.error + "20" }]}
                onPress={() => handleDecline(item.id)}
              >
                <Feather name="x" size={16} color={SemanticColors.error} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </Card>
    </Animated.View>
  );

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "declined", label: "Declined" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <View style={styles.filterRow}>
          {filters.map((f) => (
            <Pressable
              key={f.key}
              style={[
                styles.filterButton,
                filter === f.key && { backgroundColor: theme.link },
              ]}
              onPress={() => setFilter(f.key)}
            >
              <ThemedText
                type="small"
                style={{ color: filter === f.key ? "#FFF" : theme.textPrimary }}
              >
                {f.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.newButton, { backgroundColor: theme.link }]}
          onPress={handleNewRequest}
        >
          <Feather name="plus" size={20} color="#FFF" />
          <ThemedText type="body" style={{ color: "#FFF", marginLeft: Spacing.xs }}>
            New Request
          </ThemedText>
        </Pressable>
      </View>

      <FlatList
        data={sortedRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
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
            icon="inbox"
            title="No Requests"
            message="You haven't submitted any requests yet."
            actionLabel="Submit Request"
            onAction={handleNewRequest}
          />
        }
        ListFooterComponent={
          sortedRequests.length > 0 ? (
            <View style={styles.sosContainer}>
              <SOSButton onPress={handleSOS} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  newButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  requestCard: {
    marginBottom: Spacing.md,
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  requestType: {
    flexDirection: "row",
    alignItems: "center",
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.round,
    alignItems: "center",
    justifyContent: "center",
  },
  sosContainer: {
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
});
