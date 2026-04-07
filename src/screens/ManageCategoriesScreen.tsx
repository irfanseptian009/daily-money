import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, TransactionType, CategoryInfo } from "../types";
import { useSettings } from "../context/SettingsContext";
import { useCategories } from "../context/CategoriesContext";
import { t } from "../config/translations";

type Props = NativeStackScreenProps<RootStackParamList, "ManageCategories">;

export const ManageCategoriesScreen: React.FC<Props> = () => {
  const { colors, language } = useSettings();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("🏷️");

  const displayedCategories = categories.filter(c => c.type === activeTab);
  const defaultCats = displayedCategories.filter(c => !c.isCustom);
  const customCats = displayedCategories.filter(c => c.isCustom);

  const handleDelete = (cat: CategoryInfo) => {
    if (!cat.isCustom) {
      Alert.alert(t(language, "error"), t(language, "cannotDeleteDefault"));
      return;
    }
    Alert.alert(t(language, "deleteCategoryConfirm"), `Delete ${cat.label}?`, [
      { text: t(language, "cancel"), style: "cancel" },
      { text: t(language, "delete"), style: "destructive", onPress: () => deleteCategory(cat.id) }
    ]);
  };

  const handleAdd = async () => {
    if (!newName.trim() || !newEmoji.trim()) return;
    await addCategory({ label: newName.trim(), emoji: newEmoji.trim(), type: activeTab });
    setNewName("");
    setNewEmoji("🏷️");
    setModalVisible(false);
  };

  const renderCategoryItem = (cat: CategoryInfo) => (
    <View key={cat.id} style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="flex-row items-center p-3 rounded-xl mb-2">
      <View className="w-10 h-10 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: activeTab === TransactionType.INCOME ? "#10b98120" : "#ef444420" }}>
        <Text className="text-xl">{cat.emoji}</Text>
      </View>
      <Text style={{ color: colors.text }} className="flex-1 text-base font-medium">{cat.isCustom ? cat.label : t(language, cat.label)}</Text>
      {cat.isCustom && (
        <TouchableOpacity onPress={() => handleDelete(cat)} className="p-2">
          <Text className="text-expense-400 text-lg">🗑️</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      
      {/* Tabs */}
      <View className="flex-row px-4 pt-4 pb-2">
        <TouchableOpacity 
          onPress={() => setActiveTab(TransactionType.EXPENSE)}
          style={{ backgroundColor: activeTab === TransactionType.EXPENSE ? colors.bgCard : colors.bgSecondary, borderColor: colors.border, borderWidth: 1 }}
          className="flex-1 py-3 items-center rounded-l-xl"
        >
          <Text style={{ color: activeTab === TransactionType.EXPENSE ? "#ef4444" : colors.textSecondary }} className="font-bold text-sm uppercase">
            {t(language, "expense")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab(TransactionType.INCOME)}
          style={{ backgroundColor: activeTab === TransactionType.INCOME ? colors.bgCard : colors.bgSecondary, borderColor: colors.border, borderWidth: 1, borderLeftWidth: 0 }}
          className="flex-1 py-3 items-center rounded-r-xl"
        >
          <Text style={{ color: activeTab === TransactionType.INCOME ? "#10b981" : colors.textSecondary }} className="font-bold text-sm uppercase">
            {t(language, "income")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Custom Section */}
        <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest mt-4 mb-2 ml-1">
          {t(language, "custom")}
        </Text>
        {customCats.length === 0 ? (
           <View style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, borderWidth: 1 }} className="p-4 rounded-xl items-center mb-2">
             <Text style={{ color: colors.textMuted }} className="text-sm">No custom categories yet.</Text>
           </View>
        ) : customCats.map(renderCategoryItem)}

        {/* Defaults Section */}
        <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest mt-6 mb-2 ml-1">
          {t(language, "defaults")}
        </Text>
        {defaultCats.map(renderCategoryItem)}
      </ScrollView>

      {/* Add FAB */}
      <View className="absolute bottom-6 right-5">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
          className={`w-14 h-14 rounded-full items-center justify-center`}
          style={{ backgroundColor: activeTab === TransactionType.INCOME ? "#10b981" : "#ef4444", elevation: 8, shadowColor: activeTab === TransactionType.INCOME ? "#10b981" : "#ef4444", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
        >
          <Text className="text-2xl font-bold text-white mb-0.5">+</Text>
        </TouchableOpacity>
      </View>

      {/* Add Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: colors.bg }} className="pt-5 pb-8 px-5 rounded-t-3xl border-t border-gray-800">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ color: colors.text }} className="text-xl font-bold">{t(language, "addCategory")}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Text className="text-expense-400 font-bold text-base">✕</Text></TouchableOpacity>
            </View>
            
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">{t(language, "pickEmoji")}</Text>
            <View className="flex-row justify-center mb-6">
              <TextInput
                value={newEmoji}
                onChangeText={e => setNewEmoji(e ? Array.from(e)[0] : "")}
                maxLength={2}
                className="text-4xl text-center pb-2 border-b-2"
                style={{ color: colors.text, borderColor: activeTab === TransactionType.INCOME ? "#10b981" : "#ef4444", width: 80 }}
                placeholder="😊"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">{t(language, "categoryName")}</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={{ backgroundColor: colors.bgCard, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
              className="px-4 py-4 rounded-xl text-base mb-8"
              placeholder="..."
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              onPress={handleAdd}
              disabled={!newName.trim() || !newEmoji.trim()}
              className={`py-4 rounded-xl items-center ${!newName.trim() || !newEmoji.trim() ? "opacity-50" : ""}`}
              style={{ backgroundColor: activeTab === TransactionType.INCOME ? "#10b981" : "#ef4444" }}
            >
              <Text className="text-white font-bold text-base">{t(language, "save")}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
