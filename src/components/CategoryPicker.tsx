import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CategoryId, TransactionType } from "../types";
import { useCategories } from "../context/CategoriesContext";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";
import { normalizeCategoryEmoji } from "../config/categoryEmojis";

interface CategoryPickerProps {
  type: TransactionType;
  selectedCategory: CategoryId;
  onSelect: (category: CategoryId) => void;
  onManageCategoriesPress?: () => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  type,
  selectedCategory,
  onSelect,
  onManageCategoriesPress,
}) => {
  const { getCategoriesByType } = useCategories();
  const { language, colors, theme, palette } = useSettings();
  const categories = getCategoriesByType(type);
  const isDark = theme === "dark";

  const panelBg = isDark ? palette.bgLight : palette.bgLight;
  const panelBorder = palette.soft;
  const chipBg = isDark ? "#111827" : "#ffffff";

  const [isOpen, setIsOpen] = useState(false);
  const selectedCatObj = categories.find((c) => c.id === selectedCategory);

  return (
    <View className="mb-6 rounded-3xl p-4" style={{ backgroundColor: panelBg, borderColor: panelBorder, borderWidth: 1 }}>
      <View className="flex-row items-center justify-between mb-3">
        <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider">
          {t(language, "category")}
        </Text>
        <View className="flex-row items-center">
          {!!onManageCategoriesPress && (
            <TouchableOpacity
              onPress={onManageCategoriesPress}
              activeOpacity={0.8}
              className="w-8 h-8 rounded-full items-center justify-center"
              style={{ backgroundColor: chipBg, borderColor: panelBorder, borderWidth: 1 }}
            >
              <Text className="text-lg">✏️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {categories.length > 0 ? (
        <>
          <TouchableOpacity
            onPress={() => setIsOpen(!isOpen)}
            activeOpacity={0.7}
            className="flex-row items-center justify-between p-4 rounded-2xl"
            style={{ backgroundColor: colors.bgCard, borderColor: panelBorder, borderWidth: 1 }}
          >
            {selectedCatObj ? (
              <View className="flex-row items-center">
                <Text className="text-xl mr-3">{normalizeCategoryEmoji(selectedCatObj.icon, selectedCatObj.type)}</Text>
                <Text className="text-base font-semibold" style={{ color: colors.text }}>
                  {selectedCatObj.isCustom ? selectedCatObj.label : t(language, selectedCatObj.label)}
                </Text>
              </View>
            ) : (
              <Text className="text-base font-semibold" style={{ color: colors.textMuted }}>
                Select Category
              </Text>
            )}
            <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {isOpen && (
            <View className="mt-2 rounded-2xl overflow-hidden" style={{ backgroundColor: colors.bgCard, borderColor: panelBorder, borderWidth: 1 }}>
              {categories.map((cat, index) => {
                const isSelected = cat.id === selectedCategory;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => { onSelect(cat.id); setIsOpen(false); }}
                    activeOpacity={0.7}
                    className="flex-row items-center px-4 py-3"
                    style={{
                      backgroundColor: isSelected ? palette.bgLight : "transparent",
                      borderBottomWidth: index < categories.length - 1 ? 1 : 0,
                      borderBottomColor: panelBorder,
                    }}
                  >
                    <Text className="text-xl mr-3">{normalizeCategoryEmoji(cat.icon, cat.type)}</Text>
                    <Text
                      className="text-base font-medium flex-1"
                      style={{ color: isSelected ? palette.deep : colors.text }}
                    >
                      {cat.isCustom ? cat.label : t(language, cat.label)}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={20} color={palette.main} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </>
      ) : (
        <View className="rounded-2xl p-4" style={{ backgroundColor: chipBg, borderWidth: 1, borderColor: panelBorder }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center pr-2">
              <Text className="text-base">🗂️</Text>
              <Text className="ml-2 text-sm font-semibold" style={{ color: colors.textSecondary }}>
                Belum ada kategori
              </Text>
            </View>
            {!!onManageCategoriesPress && (
              <TouchableOpacity
                onPress={onManageCategoriesPress}
                activeOpacity={0.8}
                className="w-9 h-9 rounded-xl items-center justify-center"
                style={{ backgroundColor: palette.main }}
              >
                <Text className="text-base">➕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
