import React from "react";
import { View, Text } from "react-native";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";
import { formatCurrency } from "../config/currencies";

interface BalanceSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ totalIncome, totalExpense, balance }) => {
  const { colors, language, currency } = useSettings();

  return (
    <View style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, borderWidth: 1 }} className="mx-4 mt-4 mb-2 rounded-2xl p-5">
      <View className="mb-4 items-center">
        <Text style={{ color: colors.textSecondary }} className="text-sm font-medium tracking-wider uppercase">
          {t(language, "currentBalance")}
        </Text>
        <Text className={`text-4xl font-bold mt-1 ${balance >= 0 ? "text-income-400" : "text-expense-400"}`}>
          {formatCurrency(balance, currency)}
        </Text>
      </View>
      <View style={{ backgroundColor: colors.border }} className="h-px mb-4" />
      <View className="flex-row justify-between">
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-1">
            <View className="w-2.5 h-2.5 rounded-full bg-income-500 mr-2" />
            <Text style={{ color: colors.textSecondary }} className="text-xs font-medium uppercase tracking-wide">
              {t(language, "income")}
            </Text>
          </View>
          <Text className="text-lg font-bold text-income-400">{formatCurrency(totalIncome, currency)}</Text>
        </View>
        <View style={{ backgroundColor: colors.border }} className="w-px" />
        <View className="flex-1 items-center">
          <View className="flex-row items-center mb-1">
            <View className="w-2.5 h-2.5 rounded-full bg-expense-500 mr-2" />
            <Text style={{ color: colors.textSecondary }} className="text-xs font-medium uppercase tracking-wide">
              {t(language, "expense")}
            </Text>
          </View>
          <Text className="text-lg font-bold text-expense-400">{formatCurrency(totalExpense, currency)}</Text>
        </View>
      </View>
    </View>
  );
};
