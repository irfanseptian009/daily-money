import React, { useCallback, useState, useMemo } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StatusBar,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { BalanceSummary } from "../components/BalanceSummary";
import { TransactionCard } from "../components/TransactionCard";
import { EmptyState } from "../components/EmptyState";
import { SearchBar } from "../components/SearchBar";
import { MonthFilter } from "../components/MonthFilter";
import { useTransactions } from "../hooks/useTransactions";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";
import { Transaction, RootStackParamList } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { transactions, isLoading, totalIncome, totalExpense, balance, deleteTransaction, refresh } = useTransactions();
  const { colors, language, currency } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => months.add(tx.date.substring(0, 7)));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (selectedMonth !== "all") filtered = filtered.filter((tx) => tx.date.startsWith(selectedMonth));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((tx) =>
        (tx.note && tx.note.toLowerCase().includes(q)) || tx.amount.toString().includes(q) || tx.type.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [transactions, selectedMonth, searchQuery]);

  const handleDelete = useCallback(async (id: string) => { await deleteTransaction(id); }, [deleteTransaction]);
  const handleEdit = useCallback((tx: Transaction) => { navigation.navigate("AddTransaction", { transaction: tx }); }, [navigation]);
  const handleAddPress = useCallback(() => { navigation.navigate("AddTransaction"); }, [navigation]);

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionCard transaction={item} onDelete={handleDelete} onEdit={handleEdit} />
    ),
    [handleDelete, handleEdit]
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const ListHeader = useCallback(() => (
    <>
      <BalanceSummary totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />
      <View className="mt-3">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t(language, "searchTransactions")} />
      </View>
      {availableMonths.length > 0 && (
        <MonthFilter selectedMonth={selectedMonth} onSelect={setSelectedMonth} availableMonths={availableMonths} />
      )}
      {filteredTransactions.length > 0 && (
        <View className="mx-4 mt-2 mb-3 flex-row items-center justify-between">
          <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider">
            {selectedMonth === "all" ? t(language, "allTransactions") : t(language, "filteredTransactions")}
          </Text>
          <Text style={{ color: colors.textMuted }} className="text-xs">
            {filteredTransactions.length} {t(language, "items")}
          </Text>
        </View>
      )}
    </>
  ), [totalIncome, totalExpense, balance, searchQuery, selectedMonth, availableMonths, filteredTransactions.length, language, colors]);

  if (isLoading) {
    return (
      <View style={{ backgroundColor: colors.bg }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          searchQuery || selectedMonth !== "all" ? (
            <View className="items-center py-16 px-8">
              <Text className="text-3xl mb-3">🔍</Text>
              <Text style={{ color: colors.text }} className="text-base font-semibold text-center">{t(language, "noResults")}</Text>
              <Text style={{ color: colors.textMuted }} className="text-sm text-center mt-1">{t(language, "noResultsDesc")}</Text>
            </View>
          ) : <EmptyState />
        }
        contentContainerStyle={filteredTransactions.length === 0 ? { flex: 1 } : { paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom buttons */}
      <View className="absolute bottom-8 right-5 items-center">
        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.8}
          className="w-12 h-12 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, elevation: 4 }}
        >
          <Text className="text-lg">⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate("Statistics")}
          activeOpacity={0.8}
          className="w-12 h-12 rounded-full items-center justify-center mb-3"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, elevation: 4 }}
        >
          <Text className="text-lg">📊</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAddPress}
          activeOpacity={0.8}
          className="w-14 h-14 rounded-full bg-income-500 items-center justify-center"
          style={{ shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
        >
          <Text className="text-2xl font-bold text-white" style={{ marginTop: -2 }}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
