import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  ListRenderItem,
} from "react-native";
import { KeyboardAvoidingView as KAV } from "react-native-keyboard-controller";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { getApiUrl } from "@/lib/query-client";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: number;
  title: string;
  createdAt: string;
}

export default function AIAssistantScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);

  useEffect(() => {
    createConversation();
  }, []);

  const createConversation = async () => {
    try {
      const response = await fetch(new URL("/api/conversations", getApiUrl()).toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "AI Assistant Chat" }),
      });
      if (response.ok) {
        const conversation: Conversation = await response.json();
        setConversationId(conversation.id);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const sendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading || !conversationId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputText.trim(),
    };

    setMessages((prev) => [userMessage, ...prev]);
    setInputText("");
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages((prev) => [
      { id: assistantMessageId, role: "assistant", content: "" },
      ...prev,
    ]);

    try {
      const response = await fetch(
        new URL(`/api/conversations/${conversationId}/messages`, getApiUrl()).toString(),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: userMessage.content }),
        }
      );

      if (!response.ok) throw new Error("Failed to send message");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.content) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + event.content }
                    : msg
                )
              );
            }
          } catch {}
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: "Sorry, I encountered an error. Please try again." }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, conversationId]);

  const renderMessage: ListRenderItem<Message> = useCallback(
    ({ item }) => (
      <View
        style={[
          styles.messageContainer,
          item.role === "user" ? styles.userMessage : styles.assistantMessage,
          {
            backgroundColor:
              item.role === "user"
                ? theme.primary
                : theme.backgroundSecondary,
          },
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            item.role === "user" && { color: "#FFFFFF" },
          ]}
        >
          {item.content || (item.role === "assistant" && isLoading ? "..." : "")}
        </ThemedText>
      </View>
    ),
    [theme, isLoading]
  );

  const renderEmptyState = useCallback(
    () => (
      <View style={styles.emptyContainer}>
        <View style={[styles.iconCircle, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="message-circle" size={48} color={theme.primary} />
        </View>
        <ThemedText style={styles.emptyTitle}>AI Assistant</ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Ask me anything about your schedule, requests, or work-related questions
        </ThemedText>
      </View>
    ),
    [theme]
  );

  const KeyboardView = Platform.OS === "web" ? View : KAV;

  return (
    <ThemedView style={styles.container}>
      <KeyboardView
        style={styles.container}
        {...(Platform.OS !== "web" && { behavior: "padding", keyboardVerticalOffset: 0 })}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted={messages.length > 0}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={[
            styles.messagesList,
            {
              paddingTop: headerHeight + Spacing.md,
              paddingBottom: Spacing.md,
            },
            messages.length === 0 && styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
        />
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.backgroundDefault,
              borderTopColor: theme.border,
              paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
              },
            ]}
            placeholder="Ask me anything..."
            placeholderTextColor={theme.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
            editable={!isLoading}
            multiline
            maxLength={2000}
          />
          <Pressable
            onPress={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  inputText.trim() && !isLoading
                    ? theme.primary
                    : theme.backgroundSecondary,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Feather
                name="send"
                size={20}
                color={inputText.trim() ? "#FFFFFF" : theme.textSecondary}
              />
            )}
          </Pressable>
        </View>
      </KeyboardView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: Spacing.md,
    flexGrow: 1,
  },
  emptyListContent: {
    justifyContent: "center",
  },
  messageContainer: {
    maxWidth: "85%",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.xs,
  },
  userMessage: {
    alignSelf: "flex-end",
    borderBottomRightRadius: BorderRadius.xs,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    borderBottomLeftRadius: BorderRadius.xs,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
  },
});
