import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";

import HomeStackNavigator from "@/navigation/HomeStackNavigator";
import ScheduleStackNavigator from "@/navigation/ScheduleStackNavigator";
import RequestsStackNavigator from "@/navigation/RequestsStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import UsersStackNavigator from "@/navigation/UsersStackNavigator";
import TeamStackNavigator from "@/navigation/TeamStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/context/AuthContext";

export type MainTabParamList = {
  HomeTab: undefined;
  ScheduleTab: undefined;
  RequestsTab: undefined;
  ProfileTab: undefined;
  UsersTab: undefined;
  TeamTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isManager = user?.role === "manager";
  const isStaff = user?.role === "staff";

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      {isAdmin ? (
        <Tab.Screen
          name="UsersTab"
          component={UsersStackNavigator}
          options={{
            title: "Users",
            tabBarIcon: ({ color, size }) => (
              <Feather name="users" size={size} color={color} />
            ),
          }}
        />
      ) : null}

      {isManager ? (
        <Tab.Screen
          name="TeamTab"
          component={TeamStackNavigator}
          options={{
            title: "Team",
            tabBarIcon: ({ color, size }) => (
              <Feather name="users" size={size} color={color} />
            ),
          }}
        />
      ) : null}

      {isStaff ? (
        <Tab.Screen
          name="ScheduleTab"
          component={ScheduleStackNavigator}
          options={{
            title: "Schedule",
            tabBarIcon: ({ color, size }) => (
              <Feather name="calendar" size={size} color={color} />
            ),
          }}
        />
      ) : null}

      <Tab.Screen
        name="RequestsTab"
        component={RequestsStackNavigator}
        options={{
          title: "Requests",
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
