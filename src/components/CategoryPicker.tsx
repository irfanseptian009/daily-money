import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { CategoryId, TransactionType } from "../types";
import { useCategories } from "../context/CategoriesContext";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";

interface CategoryPickerProps {
  type: TransactionType;
  selectedCategory: CategoryId;
  onSelect: (category: CategoryId) => void;
}

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  type,
  selectedCategory,
  onSelect,
}) => {
  const { getCategoriesByType } = useCategories();
  const { language, colors } = useSettings();
  const categories = getCategoriesByType(type);

  return (
    <View className="mb-6">
      <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-3">
        {t(language, "category")}
      </Text>
      <View className="flex-row flex-wrap">
        {categories.map((cat) => {
          const isSelected = cat.id === selectedCategory;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSelect(cat.id)}
              activeOpacity={0.7}
              className={`mr-2 mb-2 px-3 py-2.5 rounded-xl flex-row items-center`}
              style={{
                backgroundColor: isSelected
                  ? type === TransactionType.INCOME
                    ? "#10b98120"
                    : "#ef444420"
                  : colors.bgCard,
                borderColor: isSelected
                  ? type === TransactionType.INCOME
                    ? "#10b981"
                    : "#ef4444"
                  : colors.border,
                borderWidth: 1,
              }}
            >
              <Text className="text-base mr-1.5">{cat.emoji}</Text>
              <Text
                className={`text-sm font-medium`}
                style={{
                  color: isSelected
                    ? type === TransactionType.INCOME
                      ? "#10b981"
                      : "#ef4444"
                    : colors.textSecondary
                }}
              >
                {cat.isCustom ? cat.label : t(language, cat.label)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
