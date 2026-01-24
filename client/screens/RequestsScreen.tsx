import React, { useState, useEffect, useCallback } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { SOSButton } from "@/components/SOSButton";
import { useTheme } from "@/hooks/useTheme";
import { storage, Request } from "@/lib/storage";
import { Spacing, SemanticColors, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = "all" | "pending" | "approved" | "declined";

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [requests, setRequests] = useState<Request[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const loadData = useCallback(async () => {
    const data = await storage.getRequests();
    setRequests(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const handleSOS = () => {
    navigation.navigate("SOS");
  };

  const handleNewRequest = () => {
    navigation.navigate("SubmitRequest");
  };

  const filteredRequests = requests.filter((req) => {
    if (activeTab === "all") return true;
    return req.status === activeTab;
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success";
      case "declined":
        return "error";
      case "pending":
      default:
        return "pending";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const renderRequest = ({ item, index }: { item: Request; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <Card elevation={1} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View
            style={[
              styles.typeIcon,
              {
                backgroundColor:
                  item.type === "report"
                    ? SemanticColors.warning + "20"
                    : theme.link + "20",
              },
            ]}
          >
            <Feather
              name={item.type === "report" ? "flag" : "file-text"}
              size={18}
              color={item.type === "report" ? SemanticColors.warning : theme.link}
            />
          </View>
          <View style={styles.requestInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {item.subject}
            </ThemedText>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {formatDate(item.createdAt)}
            </ThemedText>
          </View>
          <StatusBadge
            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            variant={getStatusVariant(item.status)}
          />
        </View>
        <ThemedText
          type="small"
          style={[styles.requestDetails, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {item.details}
        </ThemedText>
        {item.isAnonymous ? (
          <View style={styles.anonymousBadge}>
            <Feather name="eye-off" size={12} color={theme.textSecondary} />
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              Anonymous
            </ThemedText>
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );

  const tabs: { key: TabType; label: string }[] = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "approved", label: "Approved" },
    { key: "declined", label: "Declined" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.tabsContainer,
          {
            paddingTop: headerHeight + Spacing.md,
            backgroundColor: theme.backgroundRoot,
          },
        ]}
      >
        <View style={styles.tabsRow}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tab,
                  isActive && { backgroundColor: theme.link },
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <ThemedText
                  type="small"
                  style={[
                    styles.tabLabel,
                    { color: isActive ? "#FFF" : theme.textSecondary },
                  ]}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: tabBarHeight + Spacing["5xl"],
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredRequests}
        keyExtractor={(item) => item.id}
        renderItem={renderRequest}
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
            message={
              activeTab === "all"
                ? "You haven't submitted any requests yet."
                : `No ${activeTab} requests.`
            }
            actionLabel="Submit Request"
            onAction={handleNewRequest}
          />
        }
      />

      <Pressable
        style={[styles.fab, { backgroundColor: theme.link }]}
        onPress={handleNewRequest}
        testID="button-new-request"
      >
        <Feather name="plus" size={24} color="#FFF" />
      </Pressable>

      <SOSButton onPress={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  tabsRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  tabLabel: {
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  requestCard: {
    marginBottom: Spacing.md,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  requestInfo: {
    flex: 1,
  },
  requestDetails: {
    marginTop: Spacing.sm,
  },
  anonymousBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: 140,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
});
