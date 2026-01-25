import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, SemanticColors } from "@/constants/theme";

export default function TermsOfServiceScreen() {
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
        }}
      >
        <ThemedText type="small" style={[styles.lastUpdated, { color: theme.textSecondary }]}>
          Last Updated: January 2026
        </ThemedText>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            1. Acceptance of Terms
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            By accessing or using StaffHub ("the App"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the App.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            These Terms constitute a legally binding agreement between you and StaffHub regarding your use of the application.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            2. Description of Service
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            StaffHub is a staff management application that provides:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Work schedule viewing and management
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Request and report submission
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Salary and payment tracking
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Team management features
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Emergency SOS functionality
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} User and company administration
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            3. User Accounts
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            To use StaffHub, you must:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Have a valid company code provided by your employer
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Provide accurate and complete registration information
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Maintain the security of your account credentials
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Notify us immediately of any unauthorized use
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            You are responsible for all activities that occur under your account.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            4. Acceptable Use
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You agree to use the App only for lawful purposes and in accordance with these Terms. You agree NOT to:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Use the App in any way that violates applicable laws or regulations
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Attempt to gain unauthorized access to any part of the App
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Interfere with or disrupt the App's functionality
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Submit false or misleading information
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Misuse the emergency SOS feature for non-emergency purposes
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Share your account credentials with others
          </ThemedText>
        </Card>

        <Card elevation={1} style={[styles.card, { borderColor: SemanticColors.warning, borderWidth: 1 }]}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            5. Emergency SOS Feature Disclaimer
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            The Emergency SOS feature is designed to help you quickly request assistance. However:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: SemanticColors.warning }]}>
            {"\u2022"} This feature is NOT a replacement for official emergency services (911, 112, or local emergency numbers)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Response times depend on your company's security arrangements
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} In life-threatening emergencies, always call official emergency services directly
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} We are not liable for any delays or failures in emergency response
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            Misuse of the SOS feature for false alarms may result in account suspension and potential legal consequences.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            6. Intellectual Property
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            The App and its original content, features, and functionality are owned by StaffHub and are protected by international copyright, trademark, and other intellectual property laws.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            You may not copy, modify, distribute, sell, or lease any part of the App without our express written permission.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            7. Privacy
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Your use of the App is also governed by our Privacy Policy. By using the App, you consent to the collection and use of information as described in our Privacy Policy.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            8. Limitation of Liability
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            To the maximum extent permitted by applicable law, StaffHub shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            9. Disclaimer of Warranties
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            The App is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the App's reliability, accuracy, or availability.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            10. Termination
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We may terminate or suspend your account and access to the App immediately, without prior notice or liability, for any reason, including breach of these Terms.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Upon termination, your right to use the App will cease immediately. All provisions of these Terms that should survive termination shall survive.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            11. Governing Law
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            These Terms shall be governed by and construed in accordance with the laws of the Republic of Kosovo, without regard to its conflict of law provisions.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Any disputes arising from these Terms or your use of the App shall be resolved in the competent courts of Kosovo.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            12. Changes to Terms
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the "Last Updated" date. Your continued use of the App after such changes constitutes acceptance of the new Terms.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            13. Contact Information
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            If you have any questions about these Terms, please contact us at:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.link }]}>
            legal@staffhub.app
          </ThemedText>
        </Card>
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
  lastUpdated: {
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  paragraph: {
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  listItem: {
    lineHeight: 22,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.md,
  },
});
