import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, SemanticColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "RegisterCompany">;

export default function RegisterCompanyScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();

  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!companyName.trim() || !companyCode.trim() || !ownerName.trim() || !ownerEmail.trim() || !password.trim()) {
      setError("Please fill in all required fields");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (companyCode.length < 4) {
      setError("Company code must be at least 4 characters");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(new URL("/api/register-company", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyName.trim(),
          companyCode: companyCode.trim().toUpperCase(),
          companyAddress: companyAddress.trim(),
          ownerName: ownerName.trim(),
          ownerEmail: ownerEmail.trim().toLowerCase(),
          ownerPhone: ownerPhone.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Registration Successful",
        `Your company "${companyName}" has been registered. You can now log in with your email and the company code "${companyCode.toUpperCase()}".`,
        [{ text: "Go to Login", onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.header}>
          <ThemedText type="h2">Register Company</ThemedText>
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm }}>
            Create a new company account and become the owner
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <Card elevation={1} style={styles.card}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.lg }}>
              Company Information
            </ThemedText>

            <Input
              label="Company Name *"
              placeholder="Enter company name"
              leftIcon="briefcase"
              value={companyName}
              onChangeText={setCompanyName}
              autoCapitalize="words"
              testID="input-company-name"
            />

            <Input
              label="Company Code *"
              placeholder="Enter unique code (e.g., ACME)"
              leftIcon="hash"
              value={companyCode}
              onChangeText={(text) => setCompanyCode(text.toUpperCase())}
              autoCapitalize="characters"
              maxLength={10}
              testID="input-company-code"
            />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: -Spacing.sm, marginBottom: Spacing.lg }}>
              Employees will use this code to join your company
            </ThemedText>

            <Input
              label="Company Address"
              placeholder="Enter company address"
              leftIcon="map-pin"
              value={companyAddress}
              onChangeText={setCompanyAddress}
              autoCapitalize="words"
              testID="input-company-address"
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <Card elevation={1} style={styles.card}>
            <ThemedText type="h4" style={{ marginBottom: Spacing.lg }}>
              Owner Account
            </ThemedText>

            <Input
              label="Full Name *"
              placeholder="Enter your name"
              leftIcon="user"
              value={ownerName}
              onChangeText={setOwnerName}
              autoCapitalize="words"
              testID="input-owner-name"
            />

            <Input
              label="Email *"
              placeholder="Enter your email"
              leftIcon="mail"
              value={ownerEmail}
              onChangeText={setOwnerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              testID="input-owner-email"
            />

            <Input
              label="Phone Number"
              placeholder="Enter your phone number"
              leftIcon="phone"
              value={ownerPhone}
              onChangeText={setOwnerPhone}
              keyboardType="phone-pad"
              testID="input-owner-phone"
            />

            <Input
              label="Password *"
              placeholder="Enter password (min. 8 characters)"
              leftIcon="lock"
              isPassword
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              testID="input-password"
            />

            <Input
              label="Confirm Password *"
              placeholder="Confirm your password"
              leftIcon="lock"
              isPassword
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
              testID="input-confirm-password"
            />
          </Card>
        </Animated.View>

        {error ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.errorContainer}>
            <ThemedText type="small" style={{ color: SemanticColors.error }}>
              {error}
            </ThemedText>
          </Animated.View>
        ) : null}

        <Button
          onPress={handleRegister}
          disabled={isLoading}
          style={styles.registerButton}
        >
          {isLoading ? "Registering..." : "Register Company"}
        </Button>

        <Pressable
          style={styles.loginLink}
          onPress={() => navigation.goBack()}
          testID="button-back-to-login"
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            Already have an account?{" "}
          </ThemedText>
          <ThemedText type="link" style={{ color: theme.link }}>
            Sign In
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  errorContainer: {
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: SemanticColors.error + "15",
    borderRadius: 8,
  },
  registerButton: {
    marginTop: Spacing.sm,
  },
  loginLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
    padding: Spacing.sm,
  },
});
