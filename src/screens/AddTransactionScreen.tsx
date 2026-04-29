import React, { useState, useCallback } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, StatusBar, ImageBackground } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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
  const { colors, language, currency, theme, palette } = useSettings();
  const { getCategoriesByType } = useCategories();
  const currencyInfo = getCurrencyByCode(currency);
  const editingTransaction = route.params?.transaction;
  const isEditing = !!editingTransaction;
  const isDark = theme === "dark";

  const panelBg = isDark ? palette.bgLight : palette.bgLight;
  const panelBorder = palette.soft;

  const formatAmount = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    if (!cleaned) return "";
    const parts = cleaned.split(".");
    if (parts[0]) parts[0] = parseInt(parts[0], 10).toLocaleString("en-US");
    return parts.slice(0, 2).join(".");
  };

  const [amount, setAmount] = useState(editingTransaction ? formatAmount(editingTransaction.amount.toString()) : "");
  const [type, setType] = useState<TransactionType>(editingTransaction?.type ?? TransactionType.EXPENSE);
  const [category, setCategory] = useState<CategoryId>(editingTransaction?.category || "food");
  const [note, setNote] = useState(editingTransaction?.note ?? "");
  const [date, setDate] = useState(editingTransaction?.date ?? new Date().toISOString().split("T")[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleTypeChange = useCallback((newType: TransactionType) => {
    setType(newType);
    const firstCat = getCategoriesByType(newType)[0];
    if (firstCat) setCategory(firstCat.id);
  }, [getCategoriesByType]);

  const handleCalcResult = useCallback((value: string) => { setAmount(formatAmount(value)); setShowCalculator(false); }, []);

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


      <View className="px-4 pt-1 pb-2">
        <View style={{ backgroundColor: panelBg, borderColor: panelBorder, borderWidth: 1 }} className="flex-row rounded-2xl p-1.5">
          <TouchableOpacity onPress={() => handleTypeChange(TransactionType.EXPENSE)} className="flex-1 py-3 items-center rounded-xl" style={{ backgroundColor: type === TransactionType.EXPENSE ? palette.main : "transparent" }}>
            <Text className="text-sm font-bold" style={{ color: type === TransactionType.EXPENSE ? "#fff" : colors.textSecondary }}>{t(language, "expense")}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleTypeChange(TransactionType.INCOME)} className="flex-1 py-3 items-center rounded-xl" style={{ backgroundColor: type === TransactionType.INCOME ? palette.main : "transparent" }}>
            <Text className="text-sm font-bold" style={{ color: type === TransactionType.INCOME ? "#fff" : colors.textSecondary }}>{t(language, "income")}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">

          {/* Amount Input */}
          <View className="mb-6 rounded-3xl p-4" style={{ backgroundColor: panelBg, borderColor: panelBorder, borderWidth: 1 }}>
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-2">
              {t(language, "amount")}
            </Text>
            <View className="flex-row items-center mb-2">
              <TouchableOpacity onPress={() => setShowCalculator(true)} activeOpacity={0.7} style={{ backgroundColor: colors.bgCard, borderColor: panelBorder, borderWidth: 1 }} className="flex-row items-center px-3 py-2.5 rounded-2xl mr-3">
                <Text className="text-base mr-1" style={{ color: palette.deep }}>◫</Text>
                <Text style={{ color: palette.deep }} className="text-xs font-bold">{t(language, "calculator")}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: colors.bgCard, borderColor: panelBorder, borderWidth: 1 }} className="flex-row items-center rounded-2xl px-4">
              <Text style={{ color: palette.deep }} className="text-2xl font-black mr-2">{currencyInfo.symbol}</Text>
              <TextInput
                value={amount}
                onChangeText={(text) => setAmount(formatAmount(text))}
                keyboardType="numeric"
                style={{ color: colors.text }}
                className="flex-1 text-3xl font-extrabold py-4"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                autoFocus={!isEditing}
              />
            </View>
          </View>

          {/* Category Picker */}
          <CategoryPicker
            type={type}
            selectedCategory={category}
            onSelect={setCategory}
            onManageCategoriesPress={() => navigation.navigate("ManageCategories")}
          />

          {/* Note Input */}
          <View className="mb-6 rounded-3xl p-4" style={{ backgroundColor: panelBg, borderColor: panelBorder, borderWidth: 1 }}>
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              {t(language, "noteOptional")}
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              style={{ backgroundColor: colors.bgCard, borderColor: panelBorder, borderWidth: 1, color: colors.text }}
              className="rounded-2xl px-4 py-4 text-base"
              placeholder={t(language, "notePlaceholder")}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Date Input */}
          <View className="mb-8 rounded-3xl p-4" style={{ backgroundColor: panelBg, borderColor: panelBorder, borderWidth: 1 }}>
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              {t(language, "date")}
            </Text>
            <View className="flex-row mb-3 flex-wrap gap-2">
              <TouchableOpacity onPress={() => setDateOffset(0)} style={{ backgroundColor: date === new Date().toISOString().split("T")[0] ? palette.main : colors.bgCard, borderColor: panelBorder, borderWidth: 1 }} className="px-4 py-2.5 rounded-full">
                <Text className="font-semibold text-sm" style={{ color: date === new Date().toISOString().split("T")[0] ? "#fff" : colors.textSecondary }}>{t(language, "today")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDateOffset(-1)} style={{ backgroundColor: date === new Date(Date.now() - 86400000).toISOString().split("T")[0] ? palette.main : colors.bgCard, borderColor: panelBorder, borderWidth: 1 }} className="px-4 py-2.5 rounded-full">
                <Text className="font-semibold text-sm" style={{ color: date === new Date(Date.now() - 86400000).toISOString().split("T")[0] ? "#fff" : colors.textSecondary }}>{t(language, "yesterday")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ backgroundColor: colors.bgCard, borderColor: panelBorder, borderWidth: 1 }} className="px-4 py-2.5 rounded-full flex-row items-center">
                <Text className="font-semibold text-sm mr-1" style={{ color: colors.textSecondary }}>📅</Text>
                <Text className="font-semibold text-sm" style={{ color: colors.textSecondary }}>Pick</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              value={date}
              onChangeText={setDate}
              style={{ backgroundColor: colors.bgCard, borderColor: panelBorder, borderWidth: 1, color: colors.text }}
              className="rounded-2xl px-4 py-4 text-base"
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              maxLength={10}
            />
            {showDatePicker && (
              <DateTimePicker
                value={new Date(isValidDate(date) ? date : new Date().toISOString().split("T")[0])}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    setDate(selectedDate.toISOString().split('T')[0]);
                  }
                }}
              />
            )}
            <Text style={{ color: colors.textMuted }} className="text-xs mt-2 ml-1">{t(language, "dateFormat")}</Text>
          </View>

          {/* Save Button */}
          <View className="pb-8 mt-2">
            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              activeOpacity={0.8}
              className={`py-4 rounded-[20px] items-center flex-row justify-center ${isSaving ? "opacity-70" : ""}`}
              style={{
                backgroundColor: palette.main,
                shadowColor: palette.main,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.15,
                shadowRadius: 16,
                elevation: 5,
              }}
            >
              <Text className="text-white text-lg font-bold">{isSaving ? t(language, "saving") : (isEditing ? t(language, "update") : t(language, "save"))}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Calculator visible={showCalculator} onClose={() => setShowCalculator(false)} onConfirm={handleCalcResult} initialValue={amount} />

    </View>
  );
};
