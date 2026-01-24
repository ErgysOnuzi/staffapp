import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useFocusEffect } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";
import { apiRequest } from "@/lib/queryClient";

interface Market {
  id: string;
  name: string;
  address?: string;
  createdAt: string;
  userCount?: number;
}

export default function MarketsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: markets = [], refetch, isLoading } = useQuery<Market[]>({
    queryKey: ["/api/admin/markets"],
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

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; address: string }) => {
      return apiRequest("/api/markets", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/markets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/markets"] });
      setShowAddForm(false);
      setFormData({ name: "", address: "" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; address: string } }) => {
      return apiRequest(`/api/markets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/markets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/markets"] });
      setEditingMarket(null);
      setFormData({ name: "", address: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/markets/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/markets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/markets"] });
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim()) return;
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingMarket || !formData.name.trim()) return;
    updateMutation.mutate({ id: editingMarket.id, data: formData });
  };

  const handleDelete = (market: Market) => {
    Alert.alert(
      "Delete Location",
      `Are you sure you want to delete "${market.name}"? Users assigned to this location will be unassigned.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => deleteMutation.mutate(market.id),
        },
      ]
    );
  };

  const startEdit = (market: Market) => {
    setEditingMarket(market);
    setFormData({ name: market.name, address: market.address || "" });
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingMarket(null);
    setShowAddForm(false);
    setFormData({ name: "", address: "" });
  };

  const renderMarket = ({ item }: { item: Market }) => {
    const isEditing = editingMarket?.id === item.id;

    return (
      <Card elevation={1} style={styles.marketCard}>
        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                Location Name
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter name"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                Address
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="Enter address"
                placeholderTextColor={theme.textSecondary}
                multiline
              />
            </View>

            <View style={styles.editActions}>
              <Pressable
                style={[styles.editButton, { backgroundColor: theme.link }]}
                onPress={handleUpdate}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <ThemedText type="small" style={{ color: "#FFFFFF", fontWeight: "600" }}>Save</ThemedText>
                )}
              </Pressable>
              <Pressable
                style={[styles.editButton, { backgroundColor: theme.backgroundSecondary }]}
                onPress={cancelEdit}
              >
                <ThemedText type="small">Cancel</ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.marketHeader}>
              <View style={[styles.marketIcon, { backgroundColor: `${theme.link}20` }]}>
                <Feather name="map-pin" size={24} color={theme.link} />
              </View>
              <View style={styles.marketInfo}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {item.name}
                </ThemedText>
                {item.address ? (
                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                    {item.address}
                  </ThemedText>
                ) : null}
              </View>
              <View style={styles.marketActions}>
                <Pressable
                  style={[styles.iconButton, { backgroundColor: theme.backgroundSecondary }]}
                  onPress={() => startEdit(item)}
                >
                  <Feather name="edit-2" size={16} color={theme.link} />
                </Pressable>
                <Pressable
                  style={[styles.iconButton, { backgroundColor: `${SemanticColors.error}20` }]}
                  onPress={() => handleDelete(item)}
                >
                  <Feather name="trash-2" size={16} color={SemanticColors.error} />
                </Pressable>
              </View>
            </View>
            
            <View style={[styles.marketStats, { borderTopColor: theme.backgroundSecondary }]}>
              <View style={styles.statItem}>
                <Feather name="users" size={16} color={theme.textSecondary} />
                <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                  {item.userCount || 0} users assigned
                </ThemedText>
              </View>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Added {new Date(item.createdAt).toLocaleDateString()}
              </ThemedText>
            </View>
          </>
        )}
      </Card>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {showAddForm ? (
        <View style={[styles.addFormContainer, { paddingTop: headerHeight + Spacing.lg }]}>
          <Card elevation={2} style={styles.addFormCard}>
            <View style={styles.addFormHeader}>
              <ThemedText type="subheading">Add New Location</ThemedText>
              <Pressable onPress={cancelEdit}>
                <Feather name="x" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                Location Name *
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Main Office"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                Address
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                placeholder="123 Business St, City"
                placeholderTextColor={theme.textSecondary}
                multiline
              />
            </View>

            <Pressable
              style={[styles.submitButton, { backgroundColor: theme.link }]}
              onPress={handleCreate}
              disabled={createMutation.isPending || !formData.name.trim()}
            >
              {createMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Feather name="plus" size={20} color="#FFFFFF" />
                  <ThemedText type="body" style={styles.submitButtonText}>
                    Add Location
                  </ThemedText>
                </>
              )}
            </Pressable>
          </Card>
        </View>
      ) : null}

      <FlatList
        data={markets}
        keyExtractor={(item) => item.id}
        renderItem={renderMarket}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl + 80 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={theme.link}
          />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.link} />
            </View>
          ) : (
            <EmptyState
              icon="map-pin"
              title="No locations yet"
              message="Add work locations to organize your team"
            />
          )
        }
      />

      {!showAddForm ? (
        <Pressable
          style={[styles.fab, { backgroundColor: theme.link }]}
          onPress={() => {
            setShowAddForm(true);
            setEditingMarket(null);
            setFormData({ name: "", address: "" });
          }}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: "center",
  },
  marketCard: {
    marginBottom: Spacing.md,
  },
  marketHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  marketIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  marketInfo: {
    flex: 1,
  },
  marketActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  marketStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    marginTop: Spacing.md,
    borderTopWidth: 1,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
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
  editActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  editButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  addFormContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: Spacing.lg,
  },
  addFormCard: {
    marginBottom: Spacing.lg,
  },
  addFormHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
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
  fab: {
    position: "absolute",
    right: Spacing.lg,
    bottom: Spacing.xl + 80,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});
