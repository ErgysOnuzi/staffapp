import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import TeamScreen from "@/screens/TeamScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type TeamStackParamList = {
  Team: undefined;
};

const Stack = createNativeStackNavigator<TeamStackParamList>();

export default function TeamStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Team"
        component={TeamScreen}
        options={{
          headerTitle: () => <HeaderTitle title="My Team" />,
        }}
      />
    </Stack.Navigator>
  );
}
