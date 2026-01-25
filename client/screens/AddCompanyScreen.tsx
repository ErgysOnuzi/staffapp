import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, SemanticColors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { UsersStackParamList } from "@/navigation/UsersStackNavigator";

type AddCompanyNavigationProp = NativeStackNavigationProp<UsersStackParamList, "AddCompany">;

export default function AddCompanyScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<AddCompanyNavigationProp>();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/companies", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      navigation.goBack();
    },
    onError: (error: any) => {
      setErrors({ submit: error.message || "Failed to create company" });
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Company name is required";
    }
    if (!formData.code.trim()) {
      newErrors.code = "Company code is required";
    } else if (formData.code.length < 3 || formData.code.length > 10) {
      newErrors.code = "Code must be 3-10 characters";
    } else if (!/^[A-Za-z0-9]+$/.test(formData.code)) {
      newErrors.code = "Code must be alphanumeric only";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      createMutation.mutate();
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.content,
            {
              paddingTop: headerHeight + Spacing.md,
              paddingBottom: insets.bottom + Spacing.xl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.infoCard, { backgroundColor: theme.link + "10" }]}>
            <Feather name="info" size={20} color={theme.link} />
            <ThemedText type="small" style={[styles.infoText, { color: theme.textSecondary }]}>
              Create a new company. Only Owner and Admin users can create companies.
            </ThemedText>
          </View>

          <View style={styles.section}>
            <ThemedText type="h4" style={styles.sectionTitle}>
              Company Details
            </ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                Company Name *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: errors.name ? SemanticColors.error : theme.border,
                  },
                ]}
                placeholder="Enter company name"
                placeholderTextColor={theme.textSecondary}
                value={formData.name}
                onChangeText={(text) => updateField("name", text)}
                testID="input-company-name"
              />
              {errors.name ? (
                <ThemedText type="small" style={styles.errorText}>
                  {errors.name}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                Company Code *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: errors.code ? SemanticColors.error : theme.border,
                  },
                ]}
                placeholder="e.g., ACME"
                placeholderTextColor={theme.textSecondary}
                value={formData.code}
                onChangeText={(text) => updateField("code", text.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
                testID="input-company-code"
              />
              <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                This code is used by employees to log in
              </ThemedText>
              {errors.code ? (
                <ThemedText type="small" style={styles.errorText}>
                  {errors.code}
                </ThemedText>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
                Address (Optional)
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.multilineInput,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Company headquarters address"
                placeholderTextColor={theme.textSecondary}
                value={formData.address}
                onChangeText={(text) => updateField("address", text)}
                multiline
                numberOfLines={3}
                testID="input-company-address"
              />
            </View>
          </View>

          {errors.submit ? (
            <View style={[styles.errorCard, { backgroundColor: SemanticColors.error + "10" }]}>
              <Feather name="alert-circle" size={20} color={SemanticColors.error} />
              <ThemedText type="small" style={[styles.errorCardText, { color: SemanticColors.error }]}>
                {errors.submit}
              </ThemedText>
            </View>
          ) : null}

          <View style={styles.buttonContainer}>
            <Button
              onPress={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create Company"}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
    fontWeight: "500",
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  errorText: {
    color: SemanticColors.error,
    marginTop: Spacing.xs,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  errorCardText: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
});
