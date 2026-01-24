import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { storage, Settings } from "@/lib/storage";
import { Spacing, SemanticColors, BorderRadius, AccentColors } from "@/constants/theme";

type ThemeOption = "light" | "dark" | "system";
type LanguageOption = "en" | "sq" | "sr";
type AccentOption = keyof typeof AccentColors;

const themeOptions: { key: ThemeOption; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "light", label: "Light", icon: "sun" },
  { key: "dark", label: "Dark", icon: "moon" },
  { key: "system", label: "System", icon: "smartphone" },
];

const languageOptions: { key: LanguageOption; label: string }[] = [
  { key: "en", label: "English" },
  { key: "sq", label: "Albanian" },
  { key: "sr", label: "Serbian" },
];

const accentOptions: { key: AccentOption; color: string }[] = [
  { key: "white", color: AccentColors.white },
  { key: "pink", color: AccentColors.pink },
  { key: "green", color: AccentColors.green },
  { key: "blue", color: AccentColors.blue },
  { key: "red", color: AccentColors.red },
];

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [settings, setSettings] = useState<Settings>({
    theme: "system",
    accentColor: "blue",
    language: "en",
    twoFactorEnabled: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await storage.getSettings();
    setSettings(saved);
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await storage.setSettings(newSettings);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
        <ThemedText type="h4" style={styles.sectionTitle}>
          Appearance
        </ThemedText>
        <Card elevation={1} style={styles.card}>
          <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.md }}>
            Theme
          </ThemedText>
          <View style={styles.themeRow}>
            {themeOptions.map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.themeButton,
                  {
                    backgroundColor:
                      settings.theme === option.key
                        ? theme.link
                        : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => updateSettings({ theme: option.key })}
              >
                <Feather
                  name={option.icon}
                  size={20}
                  color={settings.theme === option.key ? "#FFF" : theme.textSecondary}
                />
                <ThemedText
                  type="small"
                  style={{
                    color: settings.theme === option.key ? "#FFF" : theme.text,
                    fontWeight: "500",
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <ThemedText type="body" style={{ fontWeight: "600", marginBottom: Spacing.md }}>
            Accent Color
          </ThemedText>
          <View style={styles.accentRow}>
            {accentOptions.map((option) => (
              <Pressable
                key={option.key}
                style={[
                  styles.accentButton,
                  {
                    backgroundColor: option.color,
                    borderColor:
                      settings.accentColor === option.key
                        ? theme.link
                        : option.key === "white"
                          ? theme.border
                          : "transparent",
                  },
                ]}
                onPress={() => updateSettings({ accentColor: option.key })}
              >
                {settings.accentColor === option.key ? (
                  <Feather
                    name="check"
                    size={18}
                    color={option.key === "white" ? theme.text : "#FFF"}
                  />
                ) : null}
              </Pressable>
            ))}
          </View>
        </Card>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Language
        </ThemedText>
        <Card elevation={1} style={[styles.card, { padding: 0 }]}>
          {languageOptions.map((option, index) => (
            <Pressable
              key={option.key}
              style={[
                styles.languageItem,
                index < languageOptions.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                },
              ]}
              onPress={() => updateSettings({ language: option.key })}
            >
              <ThemedText type="body">{option.label}</ThemedText>
              {settings.language === option.key ? (
                <Feather name="check" size={20} color={theme.link} />
              ) : null}
            </Pressable>
          ))}
        </Card>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Security
        </ThemedText>
        <Card elevation={1} style={styles.card}>
          <View style={styles.securityRow}>
            <View style={styles.securityInfo}>
              <Feather name="shield" size={20} color={theme.link} />
              <View>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Two-Factor Authentication
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Add an extra layer of security
                </ThemedText>
              </View>
            </View>
            <Switch
              value={settings.twoFactorEnabled}
              onValueChange={(value) => updateSettings({ twoFactorEnabled: value })}
              trackColor={{
                false: theme.backgroundTertiary,
                true: theme.link + "80",
              }}
              thumbColor={settings.twoFactorEnabled ? theme.link : theme.backgroundDefault}
            />
          </View>
        </Card>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Account
        </ThemedText>
        <Card elevation={1} style={[styles.card, { padding: 0 }]}>
          <Pressable style={styles.accountItem}>
            <View style={styles.accountItemLeft}>
              <View
                style={[
                  styles.accountIcon,
                  { backgroundColor: SemanticColors.error + "20" },
                ]}
              >
                <Feather name="trash-2" size={18} color={SemanticColors.error} />
              </View>
              <View>
                <ThemedText type="body" style={{ color: SemanticColors.error }}>
                  Request Account Deletion
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  This requires admin approval
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.textSecondary} />
          </Pressable>
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
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  card: {
    marginBottom: Spacing.xl,
  },
  themeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  themeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.xl,
  },
  accentRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  accentButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  securityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  accountItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
});
