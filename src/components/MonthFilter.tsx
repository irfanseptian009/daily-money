import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";

interface MonthFilterProps {
  selectedMonth: string; // "YYYY-MM" or "all"
  onSelect: (month: string) => void;
  availableMonths: string[]; // ["2026-04", "2026-03", ...]
}

const formatMonthLabel = (monthKey: string, lang: string): string => {
  if (monthKey === "all") return t(lang as any, "all");
  const [year, month] = monthKey.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  const now = new Date();

  if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
    return t(lang as any, "thisMonth");
  }

  return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "2-digit" : undefined,
  });
};

export const MonthFilter: React.FC<MonthFilterProps> = ({
  selectedMonth,
  onSelect,
  availableMonths,
}) => {
  const { colors, language, palette } = useSettings();
  const months = useMemo(() => {
    return ["all", ...availableMonths];
  }, [availableMonths]);

  return (
    <View className="mb-2">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {months.map((month) => {
          const isSelected = month === selectedMonth;
          return (
            <TouchableOpacity
              key={month}
              onPress={() => onSelect(month)}
              activeOpacity={0.7}
              className={`mr-2 px-4 py-2.5 rounded-full`}
              style={{
                backgroundColor: isSelected ? palette.main : colors.bgCard,
                borderColor: colors.border,
                borderWidth: isSelected ? 0 : 1,
                shadowColor: palette.main,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isSelected ? 0.2 : 0.05,
                shadowRadius: 8,
                elevation: isSelected ? 2 : 1,
              }}
            >
              <Text className="text-xs font-bold" style={{ color: isSelected ? "#fff" : colors.textSecondary }}>
                {formatMonthLabel(month, language)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
