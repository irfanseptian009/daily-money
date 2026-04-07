import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Transaction, TransactionType } from "../types";
import { useSettings } from "../context/SettingsContext";
import { useCategories } from "../context/CategoriesContext";
import { t } from "../config/translations";
import { formatCurrency } from "../config/currencies";

interface TransactionCardProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

const formatDate = (dateString: string, lang: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return lang === "id" ? "Hari Ini" : "Today";
  if (date.toDateString() === yesterday.toDateString()) return lang === "id" ? "Kemarin" : "Yesterday";
  return date.toLocaleDateString("en-US", {
    month: "short", day: "numeric",
    year: date.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

export const TransactionCard: React.FC<TransactionCardProps> = React.memo(
  ({ transaction, onDelete, onEdit }) => {
    const { colors, language, currency } = useSettings();
    const { getCategoryInfo } = useCategories();
    const isIncome = transaction.type === TransactionType.INCOME;
    const categoryInfo = transaction.category ? getCategoryInfo(transaction.category) : null;

    const handleLongPress = useCallback(() => {
      Alert.alert(t(language, "transactionOptions"), t(language, "transactionOptionsDesc"), [
        { text: t(language, "cancel"), style: "cancel" },
        ...(onEdit ? [{ text: t(language, "edit"), onPress: () => onEdit(transaction) }] : []),
        {
          text: t(language, "delete"), style: "destructive" as const,
          onPress: () => {
            Alert.alert(t(language, "deleteConfirm"), t(language, "deleteConfirmDesc"), [
              { text: t(language, "cancel"), style: "cancel" },
              { text: t(language, "delete"), style: "destructive", onPress: () => onDelete(transaction.id) },
            ]);
          },
        },
      ]);
    }, [transaction, onDelete, onEdit, language]);

    return (
      <TouchableOpacity onLongPress={handleLongPress} activeOpacity={0.7} className="mx-4 mb-3">
        <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="flex-row items-center rounded-xl p-4">
          <View className={`w-11 h-11 rounded-xl items-center justify-center mr-3 ${isIncome ? "bg-income-500/20" : "bg-expense-500/20"}`}>
            <Text className="text-lg">{categoryInfo?.emoji || (isIncome ? "↗" : "↙")}</Text>
          </View>
          <View className="flex-1">
            <Text style={{ color: colors.text }} className="text-base font-semibold" numberOfLines={1}>
              {transaction.note || (categoryInfo ? (categoryInfo.isCustom ? categoryInfo.label : t(language, categoryInfo.label)) : (isIncome ? t(language, "income") : t(language, "expense")))}
            </Text>
            <View className="flex-row items-center mt-0.5">
              <Text style={{ color: colors.textSecondary }} className="text-xs">{formatDate(transaction.date, language)}</Text>
              {categoryInfo && (
                <><Text style={{ color: colors.textMuted }} className="text-xs mx-1">•</Text>
                <Text style={{ color: colors.textMuted }} className="text-xs">{categoryInfo.isCustom ? categoryInfo.label : t(language, categoryInfo.label)}</Text></>
              )}
            </View>
          </View>
          <Text className={`text-base font-bold ${isIncome ? "text-income-400" : "text-expense-400"}`}>
            {isIncome ? "+" : "-"}{formatCurrency(transaction.amount, currency)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);
