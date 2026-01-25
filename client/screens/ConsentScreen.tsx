import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { storage } from "@/lib/storage";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";

interface ConsentScreenProps {
  onAccept: () => void;
}

export default function ConsentScreen({ onAccept }: ConsentScreenProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceed = termsAccepted && privacyAccepted;

  const handleAccept = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await storage.setConsent({
      termsAccepted: true,
      privacyAccepted: true,
      acceptedAt: new Date().toISOString(),
      version: "1.0.0",
    });

    setIsSubmitting(false);
    onAccept();
  };

  const toggleTerms = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTermsAccepted(!termsAccepted);
  };

  const togglePrivacy = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrivacyAccepted(!privacyAccepted);
  };

  return (
    <ThemedView
      style={[
        styles.container,
        {
          paddingTop: insets.top + Spacing["3xl"],
          paddingBottom: insets.bottom + Spacing.xl,
        },
      ]}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.link + "20" }]}>
          <Feather name="shield" size={48} color={theme.link} />
        </View>

        <ThemedText type="h2" style={styles.title}>
          Welcome to StaffHub
        </ThemedText>

        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Before you continue, please review and accept our terms and privacy policy.
        </ThemedText>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.cardTitle}>
            Your Privacy Matters
          </ThemedText>
          <ThemedText type="body" style={[styles.cardText, { color: theme.textSecondary }]}>
            We collect and process your personal data to provide staff management services. This includes your name, contact information, work schedules, and salary data.
          </ThemedText>
          <ThemedText type="body" style={[styles.cardText, { color: theme.textSecondary }]}>
            Your data is shared only with authorized personnel within your organization and is protected with industry-standard security measures.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.cardTitle}>
            Your Rights
          </ThemedText>
          <View style={styles.rightRow}>
            <Feather name="check-circle" size={16} color={SemanticColors.success} />
            <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
              Access and download your personal data
            </ThemedText>
          </View>
          <View style={styles.rightRow}>
            <Feather name="check-circle" size={16} color={SemanticColors.success} />
            <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
              Request correction of inaccurate data
            </ThemedText>
          </View>
          <View style={styles.rightRow}>
            <Feather name="check-circle" size={16} color={SemanticColors.success} />
            <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
              Request deletion of your account
            </ThemedText>
          </View>
          <View style={styles.rightRow}>
            <Feather name="check-circle" size={16} color={SemanticColors.success} />
            <ThemedText type="body" style={{ color: theme.textSecondary, flex: 1 }}>
              Withdraw consent at any time
            </ThemedText>
          </View>
        </Card>

        <View style={styles.checkboxContainer}>
          <Pressable style={styles.checkboxRow} onPress={toggleTerms}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: termsAccepted ? theme.link : "transparent",
                  borderColor: termsAccepted ? theme.link : theme.border,
                },
              ]}
            >
              {termsAccepted ? (
                <Feather name="check" size={14} color="#FFF" />
              ) : null}
            </View>
            <ThemedText type="body" style={styles.checkboxText}>
              I have read and agree to the{" "}
              <ThemedText type="body" style={{ color: theme.link }}>
                Terms of Service
              </ThemedText>
            </ThemedText>
          </Pressable>

          <Pressable style={styles.checkboxRow} onPress={togglePrivacy}>
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: privacyAccepted ? theme.link : "transparent",
                  borderColor: privacyAccepted ? theme.link : theme.border,
                },
              ]}
            >
              {privacyAccepted ? (
                <Feather name="check" size={14} color="#FFF" />
              ) : null}
            </View>
            <ThemedText type="body" style={styles.checkboxText}>
              I have read and agree to the{" "}
              <ThemedText type="body" style={{ color: theme.link }}>
                Privacy Policy
              </ThemedText>
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          onPress={handleAccept}
          disabled={!canProceed || isSubmitting}
          variant={canProceed ? "primary" : "secondary"}
        >
          {isSubmitting ? "Please wait..." : "Accept and Continue"}
        </Button>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    marginBottom: Spacing.md,
  },
  cardText: {
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  checkboxContainer: {
    marginTop: Spacing.lg,
    gap: Spacing.lg,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.xs,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  checkboxText: {
    flex: 1,
    lineHeight: 22,
  },
  buttonContainer: {
    paddingTop: Spacing.lg,
  },
});
