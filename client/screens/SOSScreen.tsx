import React, { useState } from "react";
import { View, StyleSheet, Pressable, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { storage } from "@/lib/storage";
import { Spacing, SemanticColors, BorderRadius } from "@/constants/theme";

type EmergencyType = "police" | "security" | "ambulance" | "firefighters";

interface EmergencyOption {
  type: EmergencyType;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
}

const emergencyOptions: EmergencyOption[] = [
  { type: "police", label: "Police", icon: "shield", color: "#1A73E8" },
  { type: "security", label: "Security", icon: "user-check", color: "#5F6368" },
  { type: "ambulance", label: "Ambulance", icon: "activity", color: "#EA4335" },
  { type: "firefighters", label: "Firefighters", icon: "alert-octagon", color: "#FBBC04" },
];

export default function SOSScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [selectedType, setSelectedType] = useState<EmergencyType | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSelect = async (type: EmergencyType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedType(type);
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!selectedType) return;

    setIsSending(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const notification = {
      id: `sos_${Date.now()}`,
      userId: "user_1",
      title: "SOS Alert Sent",
      message: `Emergency alert for ${selectedType} has been dispatched.`,
      type: "sos" as const,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    await storage.addNotification(notification);

    setIsSending(false);
    setShowConfirm(false);
    setShowSuccess(true);

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setSelectedType(null);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  if (showSuccess) {
    return (
      <ThemedView
        style={[
          styles.container,
          {
            paddingTop: insets.top + Spacing["4xl"],
            paddingBottom: insets.bottom + Spacing["4xl"],
          },
        ]}
      >
        <Animated.View
          entering={FadeIn.duration(300)}
          style={styles.successContainer}
        >
          <View
            style={[
              styles.successIcon,
              { backgroundColor: SemanticColors.success + "20" },
            ]}
          >
            <Feather name="check-circle" size={64} color={SemanticColors.success} />
          </View>
          <ThemedText type="h2" style={styles.successTitle}>
            Alert Sent
          </ThemedText>
          <ThemedText
            type="body"
            style={[styles.successMessage, { color: theme.textSecondary }]}
          >
            Help is on the way. Stay calm and remain in a safe location.
          </ThemedText>
        </Animated.View>
      </ThemedView>
    );
  }

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing["4xl"],
          paddingBottom: insets.bottom + Spacing["4xl"],
        },
      ]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.sosIconContainer,
            { backgroundColor: SemanticColors.error + "20" },
          ]}
        >
          <Feather name="alert-triangle" size={48} color={SemanticColors.error} />
        </View>
        <ThemedText type="h2" style={styles.title}>
          Emergency SOS
        </ThemedText>
        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          Select the type of emergency assistance you need
        </ThemedText>
      </View>

      <View style={styles.optionsGrid}>
        {emergencyOptions.map((option, index) => (
          <Animated.View
            key={option.type}
            entering={FadeInDown.duration(300).delay(index * 100)}
            style={styles.optionWrapper}
          >
            <Pressable
              style={({ pressed }) => [
                styles.optionButton,
                {
                  backgroundColor: theme.backgroundDefault,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              onPress={() => handleSelect(option.type)}
            >
              <View
                style={[
                  styles.optionIcon,
                  { backgroundColor: option.color + "20" },
                ]}
              >
                <Feather name={option.icon} size={32} color={option.color} />
              </View>
              <ThemedText type="h4">{option.label}</ThemedText>
            </Pressable>
          </Animated.View>
        ))}
      </View>

      <Pressable style={styles.cancelButton} onPress={handleClose}>
        <ThemedText type="body" style={{ color: theme.textSecondary }}>
          Cancel
        </ThemedText>
      </Pressable>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            entering={FadeIn.duration(200)}
            style={[styles.confirmModal, { backgroundColor: theme.backgroundDefault }]}
          >
            <View
              style={[
                styles.confirmIcon,
                { backgroundColor: SemanticColors.error + "20" },
              ]}
            >
              <Feather
                name={
                  emergencyOptions.find((o) => o.type === selectedType)?.icon ||
                  "alert-triangle"
                }
                size={40}
                color={SemanticColors.error}
              />
            </View>
            <ThemedText type="h3" style={styles.confirmTitle}>
              Confirm Emergency
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.confirmMessage, { color: theme.textSecondary }]}
            >
              You are about to send an emergency alert for{" "}
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                {selectedType?.toUpperCase()}
              </ThemedText>
              . This will notify your company's designated responders.
            </ThemedText>
            <View style={[styles.disclaimerBox, { backgroundColor: SemanticColors.warning + "15" }]}>
              <Feather name="alert-circle" size={16} color={SemanticColors.warning} />
              <ThemedText type="small" style={[styles.disclaimerText, { color: SemanticColors.warning }]}>
                This is NOT a replacement for official emergency services. In life-threatening situations, call 112 or your local emergency number directly.
              </ThemedText>
            </View>
            <View style={styles.confirmButtons}>
              <Pressable
                style={[styles.confirmButton, { backgroundColor: theme.backgroundSecondary }]}
                onPress={handleCancel}
                disabled={isSending}
              >
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Cancel
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.confirmButton,
                  { backgroundColor: SemanticColors.error },
                ]}
                onPress={handleConfirm}
                disabled={isSending}
              >
                <ThemedText
                  type="body"
                  style={{ color: "#FFF", fontWeight: "600" }}
                >
                  {isSending ? "Sending..." : "Send Alert"}
                </ThemedText>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing["3xl"],
  },
  sosIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  optionsGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    justifyContent: "center",
  },
  optionWrapper: {
    width: "47%",
  },
  optionButton: {
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.md,
  },
  optionIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  confirmModal: {
    width: "100%",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
  },
  confirmIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  confirmTitle: {
    marginBottom: Spacing.md,
  },
  confirmMessage: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  disclaimerBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  disclaimerText: {
    flex: 1,
    lineHeight: 18,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    width: "100%",
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  successTitle: {
    marginBottom: Spacing.md,
  },
  successMessage: {
    textAlign: "center",
    paddingHorizontal: Spacing.xl,
  },
});
