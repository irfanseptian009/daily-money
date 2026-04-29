import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useSettings } from "../context/SettingsContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search transactions...",
}) => {
  const { colors } = useSettings();

  return (
    <View className="mx-4 mb-3">
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          borderWidth: 1,
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.06,
          shadowRadius: 12,
          elevation: 2,
        }}
        className="flex-row items-center rounded-2xl px-3"
      >
        <View className="w-8 h-8 rounded-full items-center justify-center mr-2" style={{ backgroundColor: colors.bgSecondary }}>
          <Text className="text-sm">🔍</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={{ color: colors.text }}
          className="flex-1 py-3.5 text-sm"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")} activeOpacity={0.7} className="w-7 h-7 rounded-full items-center justify-center" style={{ backgroundColor: colors.bgSecondary }}>
            <Text style={{ color: colors.textSecondary }} className="text-xs font-bold">✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
