import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

export default function PrivacyPolicyScreen() {
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
            1. Introduction
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            StaffHub ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application.
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            2. Information We Collect
          </ThemedText>
          <ThemedText type="body" style={[styles.subTitle, { fontWeight: "600" }]}>
            Personal Data
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We may collect personally identifiable information that you voluntarily provide, including:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Name and contact information (email address, phone number)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Employment information (job title, position, department)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Work schedule and attendance data
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Salary and payment information (visible only to authorized roles)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Profile photo (optional)
          </ThemedText>

          <ThemedText type="body" style={[styles.subTitle, { fontWeight: "600", marginTop: Spacing.lg }]}>
            Automatically Collected Data
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We may automatically collect certain information when you use the app:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Device information (device type, operating system)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Usage data (app features accessed, timestamps)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Login and authentication logs
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            3. How We Use Your Information
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We use the collected information for the following purposes:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} To provide and maintain our service
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} To manage your account and employment records
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} To process work schedules and time tracking
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} To facilitate salary calculations and payments
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} To handle requests and reports you submit
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} To send notifications about your schedule and requests
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} To provide emergency SOS functionality
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} To improve and optimize our application
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            4. Data Sharing and Disclosure
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            Your information may be shared with:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Your employer/company administrators (as necessary for employment purposes)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Managers and supervisors within your organization (limited to role-appropriate data)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Emergency services (when using SOS features)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Legal authorities (when required by law)
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            We do not sell your personal information to third parties.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            5. Data Security
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Encrypted data transmission (HTTPS/TLS)
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Secure password storage with hashing
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Role-based access controls
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Regular security audits
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            6. Your Data Rights (GDPR)
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            In accordance with applicable data protection laws, you have the right to:
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Access your personal data
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Rectify inaccurate personal data
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Request deletion of your personal data
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Object to processing of your personal data
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Request data portability
          </ThemedText>
          <ThemedText type="body" style={[styles.listItem, { color: theme.textSecondary }]}>
            {"\u2022"} Withdraw consent at any time
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            To exercise these rights, please contact your company administrator or use the data management options in your profile settings.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            7. Data Retention
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Employment-related data may be retained as required by applicable labor laws.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            8. Children's Privacy
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            This application is intended for use by adults in an employment context. We do not knowingly collect personal information from children under 16. If you believe we have collected information from a child, please contact us immediately.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            9. Changes to This Policy
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            We may update this privacy policy from time to time. We will notify you of any changes by updating the "Last Updated" date at the top of this policy. We encourage you to review this policy periodically.
          </ThemedText>
        </Card>

        <Card elevation={1} style={styles.card}>
          <ThemedText type="h4" style={styles.sectionTitle}>
            10. Contact Us
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.textSecondary }]}>
            If you have questions or concerns about this Privacy Policy or our data practices, please contact your company administrator or reach out to us at:
          </ThemedText>
          <ThemedText type="body" style={[styles.paragraph, { color: theme.link }]}>
            support@staffhub.app
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
  subTitle: {
    marginBottom: Spacing.sm,
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
