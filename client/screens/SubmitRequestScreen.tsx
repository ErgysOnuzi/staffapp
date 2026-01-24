import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useMutation } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, queryClient } from "@/lib/query-client";
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
  const [error, setError] = useState("");

  const submitMutation = useMutation({
    mutationFn: async (data: { type: string; subject: string; details: string; isAnonymous: boolean }) => {
      const res = await apiRequest("POST", "/api/requests", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
    onError: (err) => {
      setError("Failed to submit request. Please try again.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    },
  });

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

    setError("");
    submitMutation.mutate({
      type,
      subject: subject.trim(),
      details: details.trim(),
      isAnonymous,
    });
  };

  const typeOptions = [
    { key: "request" as const, label: "Request", icon: "file-text" as const, description: "Time off, shift changes, etc." },
    { key: "report" as const, label: "Report", icon: "alert-circle" as const, description: "Issues, concerns, feedback" },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.md, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedText type="h3" style={styles.sectionTitle}>
          Type
        </ThemedText>
        <View style={styles.typeContainer}>
          {typeOptions.map((option) => (
            <Pressable
              key={option.key}
              style={[
                styles.typeOption,
                { borderColor: type === option.key ? theme.link : theme.border },
                type === option.key && { backgroundColor: theme.link + "10" },
              ]}
              onPress={() => {
                setType(option.key);
                Haptics.selectionAsync();
              }}
            >
              <View style={[styles.typeIcon, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather
                  name={option.icon}
                  size={24}
                  color={type === option.key ? theme.link : theme.textSecondary}
                />
              </View>
              <View style={styles.typeContent}>
                <ThemedText type="body" style={{ fontWeight: "600" }}>
                  {option.label}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary }}>
                  {option.description}
                </ThemedText>
              </View>
              {type === option.key ? (
                <Feather name="check-circle" size={20} color={theme.link} />
              ) : null}
            </Pressable>
          ))}
        </View>

        <ThemedText type="h3" style={styles.sectionTitle}>
          Details
        </ThemedText>

        <Input
          label="Subject"
          placeholder="Brief summary of your request"
          value={subject}
          onChangeText={setSubject}
          maxLength={100}
        />

        <Input
          label="Details"
          placeholder="Provide more information about your request..."
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={6}
          style={styles.detailsInput}
        />

        <View style={styles.anonymousContainer}>
          <View style={styles.anonymousInfo}>
            <View style={[styles.anonymousIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="eye-off" size={20} color={theme.textSecondary} />
            </View>
            <View style={styles.anonymousText}>
              <ThemedText type="body" style={{ fontWeight: "600" }}>
                Submit Anonymously
              </ThemedText>
              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                Your name will not be visible to managers
              </ThemedText>
            </View>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={(value) => {
              setIsAnonymous(value);
              Haptics.selectionAsync();
            }}
            trackColor={{ false: theme.border, true: theme.link }}
            thumbColor="#FFF"
          />
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={16} color={SemanticColors.error} />
            <ThemedText type="small" style={{ color: SemanticColors.error, marginLeft: Spacing.xs }}>
              {error}
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.buttonContainer}>
          <Button
            title="Submit"
            onPress={handleSubmit}
            loading={submitMutation.isPending}
            disabled={submitMutation.isPending}
          />
          <Button
            title="Cancel"
            variant="secondary"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          />
        </View>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  typeContainer: {
    gap: Spacing.sm,
  },
  typeOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  typeContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  detailsInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  anonymousContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  anonymousInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  anonymousIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  anonymousText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    padding: Spacing.sm,
    backgroundColor: SemanticColors.error + "10",
    borderRadius: BorderRadius.sm,
  },
  buttonContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  cancelButton: {
    marginTop: Spacing.xs,
  },
});
