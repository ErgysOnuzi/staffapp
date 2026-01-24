import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UsersScreen from "@/screens/UsersScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type UsersStackParamList = {
  Users: undefined;
};

const Stack = createNativeStackNavigator<UsersStackParamList>();

export default function UsersStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Users"
        component={UsersScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Users" />,
        }}
      />
    </Stack.Navigator>
  );
}
