import React from "react";
import { View, Text } from "react-native";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";

export const EmptyState: React.FC = () => {
  const { colors, language } = useSettings();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          borderWidth: 1,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.08,
          shadowRadius: 18,
          elevation: 3,
        }}
        className="w-24 h-24 rounded-3xl items-center justify-center mb-5"
      >
        <Text className="text-6xl">📋</Text>
      </View>
      <Text style={{ color: colors.text }} className="text-2xl font-extrabold text-center mb-2">
        {t(language, "noTransactions")}
      </Text>

    </View>
  );
};
