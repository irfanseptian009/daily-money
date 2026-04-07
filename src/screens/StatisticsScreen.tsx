import React, { useCallback, useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StatusBar, Share, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../context/CategoriesContext";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";
import { formatCurrency } from "../config/currencies";
import { TransactionType, RootStackParamList, CategoryId, CategoryInfo } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Statistics">;

interface CategoryBreakdown {
  category: CategoryId; emoji: string; label: string; total: number; count: number; percentage: number;
}

export const StatisticsScreen: React.FC<Props> = ({ navigation }) => {
  const { transactions, totalIncome, totalExpense, refresh } = useTransactions();
  const { colors, language, currency } = useSettings();
  const { getCategoryInfo } = useCategories();
  const [viewType, setViewType] = useState<TransactionType>(TransactionType.EXPENSE);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const fmt = useCallback((amount: number) => formatCurrency(amount, currency), [currency]);

  const breakdown = useMemo((): CategoryBreakdown[] => {
    const filtered = transactions.filter((tx) => tx.type === viewType);
    const total = filtered.reduce((s, tx) => s + tx.amount, 0);
    const map = new Map<CategoryId, { total: number; count: number }>();
    filtered.forEach((tx) => {
      const cat = tx.category || (viewType === TransactionType.EXPENSE ? "other_expense" : "other_income");
      const e = map.get(cat) || { total: 0, count: 0 };
      map.set(cat, { total: e.total + tx.amount, count: e.count + 1 });
    });
    const result: CategoryBreakdown[] = [];
    map.forEach((v, k) => {
      const info = getCategoryInfo(k);
      result.push({ category: k, emoji: info.emoji, label: info.label, total: v.total, count: v.count, percentage: total > 0 ? (v.total / total) * 100 : 0 });
    });
    return result.sort((a, b) => b.total - a.total);
  }, [transactions, viewType, getCategoryInfo]);

  const monthlyData = useMemo(() => {
    const months = new Map<string, { income: number; expense: number }>();
    transactions.forEach((tx) => {
      const mk = tx.date.substring(0, 7);
      const e = months.get(mk) || { income: 0, expense: 0 };
      if (tx.type === TransactionType.INCOME) e.income += tx.amount; else e.expense += tx.amount;
      months.set(mk, e);
    });
    return Array.from(months.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);
  }, [transactions]);

  const stats = useMemo(() => {
    if (transactions.length === 0) return null;
    const expenses = transactions.filter((tx) => tx.type === TransactionType.EXPENSE);
    const avgExpense = expenses.length > 0 ? expenses.reduce((s, tx) => s + tx.amount, 0) / expenses.length : 0;
    const largestExpense = expenses.length > 0 ? Math.max(...expenses.map((tx) => tx.amount)) : 0;
    return {
      totalTransactions: transactions.length, avgExpense, largestExpense,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
    };
  }, [transactions, totalIncome, totalExpense]);

  const handleExport = useCallback(async () => {
    if (transactions.length === 0) { Alert.alert(t(language, "noData"), t(language, "noDataDesc")); return; }
    const header = "Date,Type,Category,Note,Amount\n";
    const rows = transactions.map((tx) => {
      const ci = tx.category ? getCategoryInfo(tx.category) : null;
      const catLabel = ci ? (ci.isCustom ? ci.label : t(language, ci.label)) : "Other";
      return `${tx.date},${tx.type},${catLabel},${(tx.note || "").replace(/,/g, ";")},${tx.amount}`;
    }).join("\n");
    try { await Share.share({ message: header + rows, title: "Daily Money - Export" }); } catch (e) { console.error(e); }
  }, [transactions, language, getCategoryInfo]);

  const fmtMonth = (mk: string) => {
    const [y, m] = mk.split("-");
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  };

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {stats && (
          <View className="mx-4 mt-4 mb-4">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-3">{t(language, "overview")}</Text>
            <View className="flex-row flex-wrap">
              <View className="w-1/2 pr-1.5 mb-3">
                <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-xl p-4">
                  <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">{t(language, "savingsRate")}</Text>
                  <Text className={`text-2xl font-bold ${stats.savingsRate >= 0 ? "text-income-400" : "text-expense-400"}`}>{stats.savingsRate.toFixed(0)}%</Text>
                </View>
              </View>
              <View className="w-1/2 pl-1.5 mb-3">
                <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-xl p-4">
                  <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">{t(language, "transactions")}</Text>
                  <Text style={{ color: colors.text }} className="text-2xl font-bold">{stats.totalTransactions}</Text>
                </View>
              </View>
              <View className="w-1/2 pr-1.5 mb-3">
                <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-xl p-4">
                  <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">{t(language, "avgExpense")}</Text>
                  <Text className="text-lg font-bold text-expense-400">{fmt(stats.avgExpense)}</Text>
                </View>
              </View>
              <View className="w-1/2 pl-1.5 mb-3">
                <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-xl p-4">
                  <Text style={{ color: colors.textSecondary }} className="text-xs mb-1">{t(language, "largestExpense")}</Text>
                  <Text className="text-lg font-bold text-expense-400">{fmt(stats.largestExpense)}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className="mx-4 mb-4">
          <View className="flex-row items-center justify-between mb-3">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider">{t(language, "byCategory")}</Text>
            <View style={{ backgroundColor: colors.bgCard }} className="flex-row rounded-lg p-0.5">
              <TouchableOpacity
              onPress={() => setViewType(TransactionType.EXPENSE)}
              className={`flex-1 py-1.5 items-center rounded-lg ${viewType === TransactionType.EXPENSE ? "bg-expense-500 shadow-sm" : ""}`}
            >
              <Text className={`text-xs font-bold`} style={{ color: viewType === TransactionType.EXPENSE ? "#fff" : colors.textSecondary }}>{t(language, "expense")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewType(TransactionType.INCOME)}
              className={`flex-1 py-1.5 items-center rounded-lg ${viewType === TransactionType.INCOME ? "bg-income-500 shadow-sm" : ""}`}
            >
              <Text className={`text-xs font-bold`} style={{ color: viewType === TransactionType.INCOME ? "#fff" : colors.textSecondary }}>{t(language, "income")}</Text>
            </TouchableOpacity>
            </View>
          </View>

          {breakdown.length === 0 ? (
            <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-xl p-6 items-center">
              <Text style={{ color: colors.textSecondary }} className="text-sm">{t(language, "noData")}</Text>
            </View>
          ) : (
            breakdown.map((item) => (
              <View key={item.category} style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-xl p-4 mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center flex-1">
                    <Text className="text-lg mr-2">{item.emoji}</Text>
                    <View className="flex-1">
                      <Text style={{ color: colors.text }} className="text-sm font-semibold">{getCategoryInfo(item.category).isCustom ? item.label : t(language, item.label)}</Text>
                      <Text style={{ color: colors.textMuted }} className="text-xs">{item.count} {t(language, "items")}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className={`text-base font-bold ${viewType === TransactionType.INCOME ? "text-income-400" : "text-expense-400"}`}>{fmt(item.total)}</Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">{item.percentage.toFixed(1)}%</Text>
                  </View>
                </View>
                <View style={{ backgroundColor: colors.border }} className="h-1.5 rounded-full overflow-hidden">
                  <View className={`h-full rounded-full ${viewType === TransactionType.INCOME ? "bg-income-500" : "bg-expense-500"}`} style={{ width: `${item.percentage}%` }} />
                </View>
              </View>
            ))
          )}
        </View>

        {monthlyData.length > 0 && (
          <View className="mx-4 mb-4">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-3">{t(language, "monthlyTrend")}</Text>
            {monthlyData.map(([month, data]) => {
              const maxVal = Math.max(...monthlyData.map(([, d]) => Math.max(d.income, d.expense)));
              return (
                <View key={month} style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-xl p-4 mb-2">
                  <Text style={{ color: colors.text }} className="text-sm font-semibold mb-2">{fmtMonth(month)}</Text>
                  <View className="flex-row items-center mb-1.5">
                    <Text style={{ color: colors.textMuted }} className="text-xs w-16">{t(language, "income")}</Text>
                    <View style={{ backgroundColor: colors.border }} className="flex-1 h-3 rounded-full overflow-hidden mr-2">
                      <View className="h-full bg-income-500 rounded-full" style={{ width: `${maxVal > 0 ? (data.income / maxVal) * 100 : 0}%` }} />
                    </View>
                    <Text className="text-xs font-medium text-income-400 w-20 text-right">{fmt(data.income)}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text style={{ color: colors.textMuted }} className="text-xs w-16">{t(language, "expense")}</Text>
                    <View style={{ backgroundColor: colors.border }} className="flex-1 h-3 rounded-full overflow-hidden mr-2">
                      <View className="h-full bg-expense-500 rounded-full" style={{ width: `${maxVal > 0 ? (data.expense / maxVal) * 100 : 0}%` }} />
                    </View>
                    <Text className="text-xs font-medium text-expense-400 w-20 text-right">{fmt(data.expense)}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <View className="mx-4 mb-4">
          <TouchableOpacity onPress={handleExport} activeOpacity={0.7} style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-xl p-4 flex-row items-center justify-center">
            <Text className="text-base mr-2">📤</Text>
            <Text style={{ color: colors.text }} className="text-sm font-semibold">{t(language, "exportCSV")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
