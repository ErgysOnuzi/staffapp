import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { storage, Request } from "@/lib/storage";
import { Spacing, SemanticColors, BorderRadius } from "@/constants/theme";

type RequestType = "request" | "report";

export default function SubmitRequestScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [type, setType] = useState<RequestType>("request");
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!subject.trim()) {
      setError("Please enter a subject");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!details.trim()) {
      setError("Please enter details");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const newRequest: Request = {
        id: `req_${Date.now()}`,
        userId: "user_1",
        type,
        subject: subject.trim(),
        details: details.trim(),
        status: "pending",
        isAnonymous: type === "report" ? isAnonymous : false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await storage.addRequest(newRequest);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch {
      setError("Failed to submit. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSubmitting(false);
    }
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
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Type
        </ThemedText>
        <View style={styles.typeRow}>
          <Pressable
            style={[
              styles.typeButton,
              {
                backgroundColor:
                  type === "request" ? theme.link : theme.backgroundSecondary,
              },
            ]}
            onPress={() => setType("request")}
          >
            <Feather
              name="file-text"
              size={18}
              color={type === "request" ? "#FFF" : theme.textSecondary}
            />
            <ThemedText
              type="body"
              style={{
                color: type === "request" ? "#FFF" : theme.text,
                fontWeight: "600",
              }}
            >
              Request
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.typeButton,
              {
                backgroundColor:
                  type === "report" ? SemanticColors.warning : theme.backgroundSecondary,
              },
            ]}
            onPress={() => setType("report")}
          >
            <Feather
              name="flag"
              size={18}
              color={type === "report" ? "#FFF" : theme.textSecondary}
            />
            <ThemedText
              type="body"
              style={{
                color: type === "report" ? "#FFF" : theme.text,
                fontWeight: "600",
              }}
            >
              Report
            </ThemedText>
          </Pressable>
        </View>

        <Input
          label="Subject"
          placeholder={
            type === "request"
              ? "e.g., Time off request, Shift swap"
              : "e.g., Work environment, Staff concern"
          }
          value={subject}
          onChangeText={setSubject}
          testID="input-subject"
        />

        <ThemedText type="small" style={[styles.label, { color: theme.textSecondary }]}>
          Details
        </ThemedText>
        <View
          style={[
            styles.textAreaContainer,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <Input
            placeholder="Provide more details about your request or report..."
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={6}
            style={styles.textArea}
            testID="input-details"
          />
        </View>

        {type === "report" ? (
          <View
            style={[
              styles.anonymousRow,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <View style={styles.anonymousInfo}>
              <Feather name="eye-off" size={20} color={theme.textSecondary} />
              <View style={styles.anonymousText}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  Submit Anonymously
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  Your identity will be hidden from managers
                </ThemedText>
              </View>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{
                false: theme.backgroundTertiary,
                true: theme.link + "80",
              }}
              thumbColor={isAnonymous ? theme.link : theme.backgroundDefault}
            />
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorContainer}>
            <ThemedText type="small" style={{ color: SemanticColors.error }}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <Button
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </Button>
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
  label: {
    marginBottom: Spacing.sm,
    fontWeight: "500",
  },
  typeRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  textAreaContainer: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: Spacing.md,
  },
  anonymousRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  anonymousInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  anonymousText: {
    flex: 1,
  },
  errorContainer: {
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
