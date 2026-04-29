import "./global.css";
import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import mobileAds from 'react-native-google-mobile-ads';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeScreen } from "./src/screens/HomeScreen";
import { AddTransactionScreen } from "./src/screens/AddTransactionScreen";
import { StatisticsScreen } from "./src/screens/StatisticsScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { ManageCategoriesScreen } from "./src/screens/ManageCategoriesScreen";
import { PremiumScreen } from "./src/screens/PremiumScreen";
import { NotificationScreen } from "./src/screens/NotificationScreen";
import { RootStackParamList } from "./src/types";
import { SettingsProvider, useSettings } from "./src/context/SettingsContext";
import { CategoriesProvider } from "./src/context/CategoriesContext";
import { PremiumProvider } from "./src/context/PremiumContext";
import { ProfileProvider } from "./src/context/ProfileContext";
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
        headerTitleStyle: { fontWeight: "800", fontSize: 20 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
        animation: "slide_from_right",
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
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
      <Stack.Screen
        name="Premium"
        component={PremiumScreen}
        options={{
          title: "👑 Premium",
          presentation: "modal",
          headerStyle: { backgroundColor: "#020617" },
          headerTintColor: "#fbbf24",
          headerTitleStyle: { fontWeight: "700", fontSize: 18, color: "#fbbf24" },
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{ title: language === "id" ? "Notifikasi" : "Notifications" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => { })
      .catch(err => {
        console.error("AdMob initialization failed", err);
      });
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <PremiumProvider>
          <CategoriesProvider>
            <ProfileProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </ProfileProvider>
          </CategoriesProvider>
        </PremiumProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
