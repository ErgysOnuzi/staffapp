import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";

type BadgeVariant = "success" | "warning" | "error" | "info" | "pending";

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: "small" | "medium";
}

const getVariantColors = (variant: BadgeVariant) => {
  switch (variant) {
    case "success":
      return { bg: SemanticColors.success + "20", text: SemanticColors.success };
    case "warning":
      return { bg: SemanticColors.warning + "20", text: "#B8860B" };
    case "error":
      return { bg: SemanticColors.error + "20", text: SemanticColors.error };
    case "info":
      return { bg: SemanticColors.info + "20", text: SemanticColors.info };
    case "pending":
      return { bg: "#9E9E9E20", text: "#757575" };
    default:
      return { bg: "#9E9E9E20", text: "#757575" };
  }
};

export function StatusBadge({ label, variant = "pending", size = "small" }: StatusBadgeProps) {
  const colors = getVariantColors(variant);
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.bg,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? Spacing.xs : Spacing.sm,
        },
      ]}
    >
      <ThemedText
        type="caption"
        style={[
          styles.label,
          {
            color: colors.text,
            fontSize: isSmall ? 11 : 12,
          },
        ]}
      >
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  label: {
    fontWeight: "600",
    textTransform: "uppercase",
  },
});
