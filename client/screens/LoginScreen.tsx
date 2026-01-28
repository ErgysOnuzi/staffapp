import React, { useState } from "react";
import { View, StyleSheet, Image, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";
import { Spacing, SemanticColors } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim() || !companyCode.trim()) {
      setError("Please fill in all fields");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password, companyCode);
      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setError("Invalid credentials. Please try again.");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch {
      setError("An error occurred. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + Spacing["4xl"] }]}>
      <Animated.View entering={FadeInUp.duration(600).delay(100)} style={styles.header}>
        <Image
          source={require("../../assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText type="h2" style={styles.title}>
          StaffHub
        </ThemedText>
        <ThemedText type="body" style={[styles.subtitle, { color: theme.textSecondary }]}>
          Sign in to manage your work
        </ThemedText>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.form}>
        <Input
          label="Email"
          placeholder="Enter your email"
          leftIcon="mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          testID="input-email"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          leftIcon="lock"
          isPassword
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          testID="input-password"
        />

        <Input
          label="Company Code"
          placeholder="Enter your company code"
          leftIcon="briefcase"
          value={companyCode}
          onChangeText={setCompanyCode}
          autoCapitalize="characters"
          autoCorrect={false}
          testID="input-company-code"
        />

        {error ? (
          <View style={styles.errorContainer}>
            <ThemedText type="small" style={{ color: SemanticColors.error }}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <Button
          onPress={handleLogin}
          disabled={isLoading}
          style={styles.loginButton}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <Pressable style={styles.forgotPassword}>
          <ThemedText type="link" style={{ color: theme.link }}>
            Forgot Password?
          </ThemedText>
        </Pressable>
      </Animated.View>

      <Animated.View
        entering={FadeInUp.duration(600).delay(500)}
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.xl }]}
      >
        <Pressable
          style={styles.registerLink}
          onPress={() => navigation.navigate("RegisterCompany")}
        >
          <ThemedText type="body" style={{ color: theme.textSecondary }}>
            New company?{" "}
          </ThemedText>
          <ThemedText type="link" style={{ color: theme.link }}>
            Register Here
          </ThemedText>
        </Pressable>
        <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md }}>
          Contact your administrator for employee account access
        </ThemedText>
      </Animated.View>
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
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    textAlign: "center",
  },
  form: {
    flex: 1,
  },
  errorContainer: {
    marginBottom: Spacing.lg,
  },
  loginButton: {
    marginTop: Spacing.sm,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: Spacing.xl,
    padding: Spacing.sm,
  },
  footer: {
    alignItems: "center",
  },
  registerLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
  },
});
