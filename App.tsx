import "./global.css";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AddTransactionScreen } from "./src/screens/AddTransactionScreen";
import { StatisticsScreen } from "./src/screens/StatisticsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ManageCategoriesScreen } from "./src/screens/ManageCategoriesScreen";
import { RootStackParamList } from "./src/types";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import { CategoriesProvider } from "./src/context/CategoriesContext";
import { t } from "./src/config/translations";

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { colors, language } = useSettings();

  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700", fontSize: 18 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t(language, "appName"), headerTitleAlign: "left" }}
      />
      <Stack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={({ route }) => ({
          title: route.params?.transaction
            ? t(language, "editTransaction")
            : t(language, "addTransaction"),
          presentation: "modal",
        })}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: t(language, "statistics") }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t(language, "settings") }}
      />
      <Stack.Screen
        name="ManageCategories"
        component={ManageCategoriesScreen}
        options={{ title: t(language, "manageCategories"), presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <CategoriesProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </CategoriesProvider>
    </SettingsProvider>
  );
}
