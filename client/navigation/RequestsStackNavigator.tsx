import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import RequestsScreen from "@/screens/RequestsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RequestsStackParamList = {
  Requests: undefined;
};

const Stack = createNativeStackNavigator<RequestsStackParamList>();

export default function RequestsStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Requests"
        component={RequestsScreen}
        options={{
          headerTitle: "Requests",
        }}
      />
    </Stack.Navigator>
  );
}
