import React, { useCallback } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { Transaction, TransactionType } from "../types";
import { useSettings } from "../context/SettingsContext";
import { useCategories } from "../context/CategoriesContext";
import { t } from "../config/translations";
import { formatCurrency } from "../config/currencies";
import { DEFAULT_EXPENSE_EMOJI, DEFAULT_INCOME_EMOJI, normalizeCategoryEmoji } from "../config/categoryEmojis";

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
    const { colors, language, currency, palette } = useSettings();
    const { getCategoryInfo } = useCategories();
    const isIncome = transaction.type === TransactionType.INCOME;
    const categoryInfo = transaction.category ? getCategoryInfo(transaction.category) : null;

    const confirmDelete = useCallback(() => {
      Alert.alert(t(language, "deleteConfirm"), t(language, "deleteConfirmDesc"), [
        { text: t(language, "cancel"), style: "cancel" },
        { text: t(language, "delete"), style: "destructive", onPress: () => onDelete(transaction.id) },
      ]);
    }, [language, onDelete, transaction.id]);

    const renderRightActions = () => (
      <View className="flex-row items-center mr-4 mb-3">
        {onEdit ? (
          <TouchableOpacity
            onPress={() => onEdit(transaction)}
            activeOpacity={0.85}
            className="w-20 h-20 rounded-2xl items-center justify-center mr-2"
            style={{
              backgroundColor: palette.main,
              shadowColor: palette.main,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
              elevation: 3,
            }}
          >
            <Text className="text-white text-xs font-bold">EDIT</Text>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={confirmDelete}
          activeOpacity={0.85}
          className="w-20 h-20 rounded-2xl items-center justify-center"
          style={{
            backgroundColor: "#ef4444",
            shadowColor: "#ef4444",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 3,
          }}
        >
          <Text className="text-white text-xs font-bold">DELETE</Text>
        </TouchableOpacity>
      </View>
    );

    return (
      <Swipeable
        renderRightActions={renderRightActions}
        friction={1.8}
        rightThreshold={36}
        overshootRight={false}
      >
        <TouchableOpacity activeOpacity={0.9} className="mx-4 mb-3">
          <View
            style={{
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
              borderWidth: 1,
              shadowColor: "#0f172a",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.04,
              shadowRadius: 16,
              elevation: 2,
            }}
            className="flex-row items-center rounded-[20px] p-4"
          >
            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-3 ${isIncome ? "bg-income-500/20" : "bg-expense-500/20"}`}>
              <Text className="text-xl">
                {categoryInfo
                  ? normalizeCategoryEmoji(categoryInfo.icon, categoryInfo.type)
                  : (isIncome ? DEFAULT_INCOME_EMOJI : DEFAULT_EXPENSE_EMOJI)}
              </Text>
            </View>
            <View className="flex-1">
              <Text style={{ color: colors.text }} className="text-[15px] font-bold" numberOfLines={1}>
                {transaction.note || (categoryInfo ? (categoryInfo.isCustom ? categoryInfo.label : t(language, categoryInfo.label)) : (isIncome ? t(language, "income") : t(language, "expense")))}
              </Text>
              <View className="flex-row items-center mt-1">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-medium">{formatDate(transaction.date, language)}</Text>
                {categoryInfo && (
                  <><Text style={{ color: colors.textMuted }} className="text-xs mx-1">•</Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs">{categoryInfo.isCustom ? categoryInfo.label : t(language, categoryInfo.label)}</Text></>
                )}
              </View>
            </View>
            <Text className={`text-base font-extrabold ${isIncome ? "text-income-400" : "text-expense-400"}`}>
              {isIncome ? "+" : "-"}{formatCurrency(transaction.amount, currency)}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  }
);
