import React from "react";
import { View, Text } from "react-native";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";

export const EmptyState: React.FC = () => {
  const { colors, language } = useSettings();

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View style={{ backgroundColor: colors.bgCard }} className="w-20 h-20 rounded-full items-center justify-center mb-5">
        <Text className="text-4xl">💰</Text>
      </View>
      <Text style={{ color: colors.text }} className="text-xl font-bold text-center mb-2">
        {t(language, "noTransactions")}
      </Text>
      <Text style={{ color: colors.textSecondary }} className="text-sm text-center leading-5">
        {t(language, "noTransactionsDesc")}
      </Text>
      <View style={{ backgroundColor: colors.bgCard }} className="flex-row items-center mt-6 px-4 py-2.5 rounded-full">
        <Text style={{ color: colors.textSecondary }} className="text-xs">
          {t(language, "tapToStart")}
        </Text>
      </View>
    </View>
  );
};
