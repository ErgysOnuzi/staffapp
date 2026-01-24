import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import UsersScreen from "@/screens/UsersScreen";
import UserDetailScreen from "@/screens/UserDetailScreen";
import AddUserScreen from "@/screens/AddUserScreen";
import CompanyScreen from "@/screens/CompanyScreen";
import MarketsScreen from "@/screens/MarketsScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { HeaderTitle } from "@/components/HeaderTitle";

export type UsersStackParamList = {
  UsersHome: undefined;
  Users: undefined;
  UserDetail: { userId: string };
  AddUser: undefined;
  Company: undefined;
  Markets: undefined;
};

const Stack = createNativeStackNavigator<UsersStackParamList>();

export default function UsersStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="UsersHome"
        component={CompanyScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Admin" />,
        }}
      />
      <Stack.Screen
        name="Users"
        component={UsersScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Users" />,
        }}
      />
      <Stack.Screen
        name="UserDetail"
        component={UserDetailScreen}
        options={{
          headerTitle: () => <HeaderTitle title="User Details" />,
        }}
      />
      <Stack.Screen
        name="AddUser"
        component={AddUserScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Add User" />,
        }}
      />
      <Stack.Screen
        name="Company"
        component={CompanyScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Company" />,
        }}
      />
      <Stack.Screen
        name="Markets"
        component={MarketsScreen}
        options={{
          headerTitle: () => <HeaderTitle title="Locations" />,
        }}
      />
    </Stack.Navigator>
  );
}
