import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, KeyboardAvoidingView, Platform, StatusBar } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, TransactionType, CategoryInfo } from "../types";
import { useSettings } from "../context/SettingsContext";
import { useCategories } from "../context/CategoriesContext";
import { t } from "../config/translations";
import { CATEGORY_EMOJI_OPTIONS, normalizeCategoryEmoji } from "../config/categoryEmojis";

type Props = NativeStackScreenProps<RootStackParamList, "ManageCategories">;

export const ManageCategoriesScreen: React.FC<Props> = () => {
  const { colors, language, palette } = useSettings();
  const { categories, addCategory, deleteCategory } = useCategories();
  const [activeTab, setActiveTab] = useState<TransactionType>(TransactionType.EXPENSE);
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState(CATEGORY_EMOJI_OPTIONS[0]);

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
    if (!newName.trim() || !newIcon.trim()) return;
    const safeIcon = normalizeCategoryEmoji(newIcon.trim(), activeTab);
    await addCategory({ label: newName.trim(), icon: safeIcon, type: activeTab });
    setNewName("");
    setNewIcon(CATEGORY_EMOJI_OPTIONS[0]);
    setModalVisible(false);
  };

  const renderCategoryItem = (cat: CategoryInfo) => (
    <View
      key={cat.id}
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 2,
      }}
      className="flex-row items-center p-3.5 rounded-2xl mb-2"
    >
      <View className="w-11 h-11 rounded-[16px] items-center justify-center mr-3" style={{ backgroundColor: palette.bgLight }}>
        <Text className="text-xl">{normalizeCategoryEmoji(cat.icon, cat.type)}</Text>
      </View>
      <Text style={{ color: colors.text }} className="flex-1 text-base font-semibold">{cat.isCustom ? cat.label : t(language, cat.label)}</Text>
      {cat.isCustom && (
        <TouchableOpacity onPress={() => handleDelete(cat)} className="p-2.5 rounded-[12px]" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)" }}>
          <Text className="text-base">🗑️</Text>
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
          className="flex-1 py-3.5 items-center rounded-l-[20px]"
        >
          <Text style={{ color: activeTab === TransactionType.EXPENSE ? palette.main : colors.textSecondary }} className="font-bold text-sm uppercase">
            {t(language, "expense")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab(TransactionType.INCOME)}
          style={{ backgroundColor: activeTab === TransactionType.INCOME ? colors.bgCard : colors.bgSecondary, borderColor: colors.border, borderWidth: 1, borderLeftWidth: 0 }}
          className="flex-1 py-3.5 items-center rounded-r-[20px]"
        >
          <Text style={{ color: activeTab === TransactionType.INCOME ? palette.main : colors.textSecondary }} className="font-bold text-sm uppercase">
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
           <View style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, borderWidth: 1 }} className="p-5 rounded-2xl items-center mb-2">
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
          className={`w-14 h-14 rounded-[20px] items-center justify-center`}
          style={{ backgroundColor: palette.main, elevation: 8, shadowColor: palette.main, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
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
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text className="text-base font-bold" style={{ color: palette.main }}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">{t(language, "pickEmoji")}</Text>
            <View className="flex-row flex-wrap mb-6">
              {CATEGORY_EMOJI_OPTIONS.map((icon) => {
                const isSelected = icon === newIcon;
                return (
                  <TouchableOpacity
                    key={icon}
                    onPress={() => setNewIcon(icon)}
                    activeOpacity={0.8}
                    className="w-12 h-12 rounded-[16px] items-center justify-center mr-2 mb-2"
                    style={{
                      backgroundColor: isSelected ? palette.main : colors.bgCard,
                      borderWidth: 1,
                      borderColor: isSelected ? "transparent" : colors.border,
                    }}
                  >
                    <Text className="text-xl" style={{ opacity: isSelected ? 1 : 0.9 }}>{icon}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold mb-2">{t(language, "categoryName")}</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              style={{ backgroundColor: colors.bgCard, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
              className="px-4 py-4 rounded-2xl text-base mb-8"
              placeholder="..."
              placeholderTextColor={colors.textMuted}
            />

            <TouchableOpacity
              onPress={handleAdd}
              disabled={!newName.trim() || !newIcon.trim()}
              className={`py-4 rounded-[20px] items-center ${!newName.trim() || !newIcon.trim() ? "opacity-50" : ""}`}
              style={{ backgroundColor: palette.main }}
            >
              <Text className="text-white font-bold text-base">{t(language, "save")}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
