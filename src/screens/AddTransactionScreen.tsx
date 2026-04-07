import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Transaction, TransactionType, RootStackParamList, CategoryId } from "../types";
import { addTransaction, updateTransaction } from "../storage/storage";
import { CategoryPicker } from "../components/CategoryPicker";
import { Calculator } from "../components/Calculator";
import { useSettings } from "../context/SettingsContext";
import { useCategories } from "../context/CategoriesContext";
import { t } from "../config/translations";
import { getCurrencyByCode } from "../config/currencies";

type Props = NativeStackScreenProps<RootStackParamList, "AddTransaction">;

export const AddTransactionScreen: React.FC<Props> = ({ navigation, route }) => {
  const { colors, language, currency } = useSettings();
  const { getCategoriesByType } = useCategories();
  const currencyInfo = getCurrencyByCode(currency);
  const editingTransaction = route.params?.transaction;
  const isEditing = !!editingTransaction;

  const [amount, setAmount] = useState(editingTransaction?.amount.toString() || "");
  const [type, setType] = useState<TransactionType>(editingTransaction?.type ?? TransactionType.EXPENSE);
  const [category, setCategory] = useState<CategoryId>(editingTransaction?.category || "food");
  const [note, setNote] = useState(editingTransaction?.note ?? "");
  const [date, setDate] = useState(editingTransaction?.date ?? new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);

  const handleTypeChange = useCallback((newType: TransactionType) => {
    setType(newType);
    const firstCat = getCategoriesByType(newType)[0];
    if (firstCat) setCategory(firstCat.id);
  }, [getCategoriesByType]);

  const handleCalcResult = useCallback((value: string) => { setAmount(value); setShowCalculator(false); }, []);

  const isValidDate = (dateString: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regex)) return false;
    const d = new Date(dateString);
    const dNum = d.getTime();
    if (!dNum && dNum !== 0) return false;
    return d.toISOString().slice(0, 10) === dateString;
  };

  const handleSave = async () => {
    try {
      const parsedAmount = parseFloat(amount.replace(/,/g, ""));
      if (isNaN(parsedAmount) || parsedAmount <= 0) { Alert.alert(t(language, "invalidAmount"), t(language, "invalidAmountDesc")); return; }
      if (!isValidDate(date)) { Alert.alert(t(language, "invalidDate"), t(language, "invalidDateDesc")); return; }

      setIsSaving(true);
      const transaction: Transaction = {
        id: isEditing ? editingTransaction!.id : `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        amount: parsedAmount,
        type,
        category,
        note: note.trim(),
        date,
        createdAt: isEditing ? editingTransaction!.createdAt : new Date().toISOString(),
      };

      if (isEditing) await updateTransaction(transaction.id, transaction); else await addTransaction(transaction);
      navigation.goBack();
    } catch (error) {
      console.error("Save transaction error:", error);
      Alert.alert(t(language, "error"), t(language, "saveError"));
      setIsSaving(false);
    }
  };

  const setDateOffset = (offset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().split("T")[0]);
  };

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      
      {/* Type Toggle */}
      <View className="px-4 pt-6 pb-2">
        <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="flex-row rounded-xl p-1">
          <TouchableOpacity onPress={() => handleTypeChange(TransactionType.EXPENSE)} className="flex-1 py-3 items-center rounded-lg" style={{ backgroundColor: type === TransactionType.EXPENSE ? "#ef4444" : "transparent" }}>
            <Text className="text-sm font-bold" style={{ color: type === TransactionType.EXPENSE ? "#fff" : colors.textSecondary }}>{t(language, "expense")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTypeChange(TransactionType.INCOME)} className="flex-1 py-3 items-center rounded-lg" style={{ backgroundColor: type === TransactionType.INCOME ? "#10b981" : "transparent" }}>
            <Text className="text-sm font-bold" style={{ color: type === TransactionType.INCOME ? "#fff" : colors.textSecondary }}>{t(language, "income")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
          
          {/* Amount Input */}
          <View className="mb-6">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-2">
              {t(language, "amount")}
            </Text>
            <View className="flex-row items-center mb-2">
              <TouchableOpacity onPress={() => setShowCalculator(true)} activeOpacity={0.7} style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="flex-row items-center px-3 py-2.5 rounded-xl mr-3">
                <Text className="text-base mr-1">🔢</Text>
                <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">{t(language, "calculator")}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="flex-row items-center rounded-xl px-4">
              <Text style={{ color: colors.textSecondary }} className="text-2xl font-bold mr-2">{currencyInfo.symbol}</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                style={{ color: colors.text }}
                className="flex-1 text-2xl font-bold py-4"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                autoFocus={!isEditing}
              />
            </View>
          </View>

          {/* Category Picker */}
          <CategoryPicker type={type} selectedCategory={category} onSelect={setCategory} />

          {/* Note Input */}
          <View className="mb-6">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              {t(language, "noteOptional")}
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, color: colors.text }}
              className="rounded-xl px-4 py-4 text-base"
              placeholder={t(language, "notePlaceholder")}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Date Input */}
          <View className="mb-8">
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              {t(language, "date")}
            </Text>
            <View className="flex-row mb-3">
              <TouchableOpacity onPress={() => setDateOffset(0)} style={{ backgroundColor: date === new Date().toISOString().split("T")[0] ? "#10b981" : colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="px-4 py-2 rounded-full mr-2">
                <Text className="font-semibold text-sm" style={{ color: date === new Date().toISOString().split("T")[0] ? "#fff" : colors.textSecondary }}>{t(language, "today")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDateOffset(-1)} style={{ backgroundColor: date === new Date(Date.now() - 86400000).toISOString().split("T")[0] ? "#10b981" : colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="px-4 py-2 rounded-full">
                <Text className="font-semibold text-sm" style={{ color: date === new Date(Date.now() - 86400000).toISOString().split("T")[0] ? "#fff" : colors.textSecondary }}>{t(language, "yesterday")}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={date}
              onChangeText={setDate}
              style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, color: colors.text }}
              className="rounded-xl px-4 py-4 text-base"
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              maxLength={10}
            />
            <Text style={{ color: colors.textMuted }} className="text-xs mt-2 ml-1">{t(language, "dateFormat")}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View className="px-4 pb-8 border-t border-transparent" style={{ borderTopColor: colors.border }}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.8}
          className={`py-4 rounded-xl items-center flex-row justify-center mt-4 ${isSaving ? "opacity-70" : ""}`}
          style={{ backgroundColor: type === TransactionType.INCOME ? "#10b981" : "#ef4444" }}
        >
          <Text className="text-white text-lg font-bold">{isSaving ? t(language, "saving") : (isEditing ? t(language, "update") : t(language, "save"))}</Text>
        </TouchableOpacity>
      </View>

      <Calculator visible={showCalculator} onClose={() => setShowCalculator(false)} onConfirm={handleCalcResult} initialValue={amount} />
    </View>
  );
};
