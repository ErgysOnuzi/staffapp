import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import SOSScreen from "@/screens/SOSScreen";
import SubmitRequestScreen from "@/screens/SubmitRequestScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import ConsentScreen from "@/screens/ConsentScreen";
import ContractDetailsScreen from "@/screens/ContractDetailsScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import SecurityScreen from "@/screens/SecurityScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/context/AuthContext";
import { ThemedView } from "@/components/ThemedView";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export type RootStackParamList = {
  Login: undefined;
  Consent: undefined;
  Main: undefined;
  SOS: undefined;
  SubmitRequest: undefined;
  Settings: undefined;
  ContractDetails: undefined;
  EditProfile: undefined;
  Security: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function LoadingScreen() {
  return (
    <ThemedView style={styles.loading}>
      <ActivityIndicator size="large" />
    </ThemedView>
  );
}

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, isLoading, hasConsent, acceptConsent } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated && !hasConsent) {
    return <ConsentScreen onAccept={acceptConsent} />;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SOS"
            component={SOSScreen}
            options={{
              presentation: "fullScreenModal",
              headerShown: false,
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="SubmitRequest"
            component={SubmitRequestScreen}
            options={{
              presentation: "modal",
              headerTitle: "Submit Request",
            }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerTitle: "Settings",
            }}
          />
          <Stack.Screen
            name="ContractDetails"
            component={ContractDetailsScreen}
            options={{
              headerTitle: "Contract Details",
            }}
          />
          <Stack.Screen
            name="EditProfile"
            component={EditProfileScreen}
            options={{
              headerTitle: "Edit Profile",
            }}
          />
          <Stack.Screen
            name="Security"
            component={SecurityScreen}
            options={{
              headerTitle: "Security",
            }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
