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
      <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="flex-row items-center rounded-xl px-3">
        <Text className="text-base mr-2">🔍</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          style={{ color: colors.text }}
          className="flex-1 py-3 text-sm"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => onChangeText("")} activeOpacity={0.7}>
            <Text style={{ color: colors.textSecondary }} className="text-sm font-bold px-1">✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
