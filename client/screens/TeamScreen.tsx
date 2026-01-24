import React, { useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";
import { apiRequest, queryClient } from "@/lib/query-client";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "staff" | "manager" | "admin";
  standing: "all_good" | "good" | "at_risk";
  hourlyRate?: string;
  todayShift?: {
    startTime: string;
    endTime: string;
    position: string;
  };
}

interface TeamRequest {
  id: string;
  userId: string;
  userName: string;
  type: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  description?: string;
}

export default function TeamScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [activeTab, setActiveTab] = useState<"members" | "requests">("members");

  const { data: teamMembers = [], refetch: refetchTeam, isLoading: loadingTeam } = useQuery<TeamMember[]>({
    queryKey: ["/api/manager/team"],
  });

  const { data: teamRequests = [], refetch: refetchRequests, isLoading: loadingRequests } = useQuery<TeamRequest[]>({
    queryKey: ["/api/manager/requests"],
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      return apiRequest("PUT", `/api/requests/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/manager/requests"] });
    },
  });

  useFocusEffect(
    useCallback(() => {
      refetchTeam();
      refetchRequests();
    }, [])
  );

  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchTeam(), refetchRequests()]);
    setIsRefreshing(false);
  };

  const getStandingVariant = (standing: string) => {
    switch (standing) {
      case "all_good": return "success" as const;
      case "good": return "info" as const;
      case "at_risk": return "warning" as const;
      default: return "pending" as const;
    }
  };

  const pendingRequests = teamRequests.filter(r => r.status === "pending");

  const renderMember = ({ item, index }: { item: TeamMember; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <Card elevation={1} style={styles.memberCard}>
        <View style={styles.memberHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="user" size={24} color={theme.link} />
          </View>
          <View style={styles.memberInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {item.name}
            </ThemedText>
            <StatusBadge 
              status={getStandingVariant(item.standing)} 
              label={item.standing.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())} 
            />
          </View>
        </View>
        
        {item.todayShift ? (
          <View style={[styles.shiftInfo, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="clock" size={16} color={theme.link} />
            <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>
              Today: {item.todayShift.startTime} - {item.todayShift.endTime} ({item.todayShift.position})
            </ThemedText>
          </View>
        ) : (
          <View style={[styles.shiftInfo, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="coffee" size={16} color={theme.textSecondary} />
            <ThemedText type="small" style={{ marginLeft: Spacing.xs, color: theme.textSecondary }}>
              Not scheduled today
            </ThemedText>
          </View>
        )}
      </Card>
    </Animated.View>
  );

  const renderRequest = ({ item, index }: { item: TeamRequest; index: number }) => (
    <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
      <Card elevation={1} style={styles.requestCard}>
        <View style={styles.requestHeader}>
          <View style={styles.requestInfo}>
            <ThemedText type="body" style={{ fontWeight: "600" }}>
              {item.userName}
            </ThemedText>
            <ThemedText type="small" style={{ color: theme.textSecondary }}>
              {item.type.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </ThemedText>
          </View>
          <StatusBadge 
            status={item.status === "approved" ? "success" : item.status === "rejected" ? "error" : "pending"} 
            label={item.status.charAt(0).toUpperCase() + item.status.slice(1)} 
          />
        </View>
        
        {item.description ? (
          <ThemedText type="small" style={{ color: theme.textSecondary, marginVertical: Spacing.sm }}>
            {item.description}
          </ThemedText>
        ) : null}

        {item.status === "pending" ? (
          <View style={styles.actionButtons}>
            <Button
              variant="outline"
              onPress={() => updateRequestMutation.mutate({ id: item.id, status: "rejected" })}
              style={styles.rejectButton}
            >
              Reject
            </Button>
            <Button
              onPress={() => updateRequestMutation.mutate({ id: item.id, status: "approved" })}
              style={styles.approveButton}
            >
              Approve
            </Button>
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.tabContainer, { paddingTop: headerHeight + Spacing.sm }]}>
        <Pressable
          onPress={() => setActiveTab("members")}
          style={[
            styles.tabButton,
            { backgroundColor: activeTab === "members" ? theme.link : theme.backgroundSecondary },
          ]}
        >
          <Feather 
            name="users" 
            size={18} 
            color={activeTab === "members" ? "#FFFFFF" : theme.text} 
          />
          <ThemedText
            type="body"
            style={{ 
              color: activeTab === "members" ? "#FFFFFF" : theme.text, 
              fontWeight: "600",
              marginLeft: Spacing.xs,
            }}
          >
            Team ({teamMembers.length})
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("requests")}
          style={[
            styles.tabButton,
            { backgroundColor: activeTab === "requests" ? theme.link : theme.backgroundSecondary },
          ]}
        >
          <Feather 
            name="file-text" 
            size={18} 
            color={activeTab === "requests" ? "#FFFFFF" : theme.text} 
          />
          <ThemedText
            type="body"
            style={{ 
              color: activeTab === "requests" ? "#FFFFFF" : theme.text, 
              fontWeight: "600",
              marginLeft: Spacing.xs,
            }}
          >
            Requests ({pendingRequests.length})
          </ThemedText>
        </Pressable>
      </View>

      {activeTab === "members" ? (
        <FlatList
          data={teamMembers}
          keyExtractor={(item) => item.id}
          renderItem={renderMember}
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
              icon="users"
              title="No team members"
              message="No staff members assigned to your team yet"
            />
          }
        />
      ) : (
        <FlatList
          data={teamRequests}
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
              title="No requests"
              message="No requests from your team yet"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  memberCard: {
    marginBottom: Spacing.md,
  },
  memberHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  shiftInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  requestCard: {
    marginBottom: Spacing.md,
  },
  requestHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  requestInfo: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  rejectButton: {
    flex: 1,
  },
  approveButton: {
    flex: 1,
  },
});
