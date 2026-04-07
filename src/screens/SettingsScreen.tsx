import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StatusBar, Modal, FlatList, Switch,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";
import { LANGUAGES } from "../config/translations";
import { CURRENCIES, getCurrencyByCode } from "../config/currencies";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { currency, setCurrency, language, setLanguage, theme, setTheme, colors } = useSettings();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currencyInfo = getCurrencyByCode(currency);
  const isDark = theme === "dark";

  const renderSection = (title: string, children: React.ReactNode) => (
    <View className="mx-4 mb-6">
      <Text style={{ color: colors.textSecondary }} className="text-sm font-semibold uppercase tracking-wider mb-3">
        {title}
      </Text>
      <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border }} className="rounded-xl border overflow-hidden">
        {children}
      </View>
    </View>
  );

  const renderRow = (label: string, value: string, onPress: () => void, icon: string, showChevron: boolean = true) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4"
      style={{ borderBottomColor: colors.border, borderBottomWidth: 0.5 }}
    >
      <Text className="text-lg mr-3">{icon}</Text>
      <Text style={{ color: colors.text }} className="flex-1 text-base font-medium">{label}</Text>
      {value ? <Text style={{ color: colors.textSecondary }} className="text-sm mr-2">{value}</Text> : null}
      {showChevron && <Text style={{ color: colors.textMuted }}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>

        {renderSection(t(language, "theme"), (
          <View className="flex-row items-center px-4 py-4">
            <Text className="text-lg mr-3">{isDark ? "🌙" : "☀️"}</Text>
            <Text style={{ color: colors.text }} className="flex-1 text-base font-medium">
              {isDark ? t(language, "darkMode") : t(language, "lightMode")}
            </Text>
            <Switch
              value={isDark}
              onValueChange={(v) => setTheme(v ? "dark" : "light")}
              trackColor={{ false: "#cbd5e1", true: "#10b981" }}
              thumbColor="#fff"
            />
          </View>
        ))}

        {renderSection(t(language, "currency"), (
          <>
            {renderRow(
              t(language, "currency"),
              `${currencyInfo.symbol} ${currencyInfo.code}`,
              () => setShowCurrencyModal(true),
              "💱"
            )}
          </>
        ))}

        {renderSection(t(language, "manageCategories"), (
          <>
             {renderRow(
               t(language, "manageCategories"),
               "",
               () => navigation.navigate("ManageCategories"),
               "🏷️"
             )}
          </>
        ))}

        {renderSection(t(language, "language"), (
          <>
            {renderRow(
              t(language, "language"),
              LANGUAGES.find((l) => l.code === language)?.nativeName || "English",
              () => setShowLanguageModal(true),
              "🌐"
            )}
          </>
        ))}
      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: colors.bg }} className="rounded-t-3xl max-h-[80%]">
            <View className="flex-row justify-between items-center px-5 py-4" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
              <Text style={{ color: colors.text }} className="text-lg font-bold">{t(language, "selectCurrency")}</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text className="text-income-400 font-bold text-base">✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setCurrency(item.code); setShowCurrencyModal(false); }}
                  className="flex-row items-center px-5 py-3.5"
                  style={{ borderBottomColor: colors.border, borderBottomWidth: 0.5 }}
                  activeOpacity={0.7}
                >
                  <View className="w-12">
                    <Text style={{ color: colors.text }} className="text-base font-bold">{item.symbol}</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-sm font-medium">{item.name}</Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">{item.code}</Text>
                  </View>
                  {currency === item.code && <Text className="text-income-400 text-lg">✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: colors.bg }} className="rounded-t-3xl">
            <View className="flex-row justify-between items-center px-5 py-4" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
              <Text style={{ color: colors.text }} className="text-lg font-bold">{t(language, "selectLanguage")}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text className="text-income-400 font-bold text-base">✕</Text>
              </TouchableOpacity>
            </View>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => { setLanguage(lang.code); setShowLanguageModal(false); }}
                className="flex-row items-center px-5 py-4"
                style={{ borderBottomColor: colors.border, borderBottomWidth: 0.5 }}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="text-base font-medium">{lang.nativeName}</Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs">{lang.name}</Text>
                </View>
                {language === lang.code && <Text className="text-income-400 text-lg">✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};
