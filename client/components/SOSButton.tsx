import React from "react";
import { StyleSheet, Pressable, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  WithSpringConfig,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";

import { SemanticColors, Spacing } from "@/constants/theme";

interface SOSButtonProps {
  onPress: () => void;
}

const springConfig: WithSpringConfig = {
  damping: 15,
  mass: 0.5,
  stiffness: 150,
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SOSButton({ onPress }: SOSButtonProps) {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.button,
        {
          bottom: tabBarHeight + Spacing.lg,
        },
        animatedStyle,
      ]}
      testID="button-sos"
    >
      <View style={styles.inner}>
        <Feather name="alert-triangle" size={24} color="#FFFFFF" />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SemanticColors.error,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
