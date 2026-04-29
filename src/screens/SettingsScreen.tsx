import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StatusBar, Modal, FlatList, Switch,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useSettings, PrimaryColor, primaryPalettes } from "../context/SettingsContext";
import { usePremium } from "../context/PremiumContext";
import { t } from "../config/translations";
import { LANGUAGES } from "../config/translations";
import { CURRENCIES, getCurrencyByCode } from "../config/currencies";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { currency, setCurrency, language, setLanguage, theme, setTheme, colors, primaryColor, setPrimaryColor, palette } = useSettings();
  const { isPremium } = usePremium();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const currencyInfo = getCurrencyByCode(currency);
  const isDark = theme === "dark";
  const panelBg = isDark ? "#0f172a" : "#ffffff";
  const panelBorder = isDark ? "#1f2937" : "#f1f5f9";
  const iconBg = isDark ? "#111827" : palette.bgLight;

  const renderSection = (title: string, children: React.ReactNode) => (
    <View className="mx-4 mb-6">
      <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest mb-3">
        {title}
      </Text>
      <View
        style={{
          backgroundColor: panelBg,
          borderColor: panelBorder,
          borderWidth: 1,
          shadowColor: palette.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
        className="rounded-3xl overflow-hidden"
      >
        {children}
      </View>
    </View>
  );

  const renderRow = (label: string, value: string, onPress: () => void, icon: string, showChevron: boolean = true) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4"
      style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}
    >
      <View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: iconBg }}>
        <Text className="text-base">{icon}</Text>
      </View>
      <Text style={{ color: colors.text }} className="flex-1 text-[15px] font-semibold">{label}</Text>
      {value ? <Text style={{ color: palette.deep }} className="text-sm mr-2 font-semibold">{value}</Text> : null}
      {showChevron && <Text style={{ color: colors.textMuted }}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>



        {renderSection(t(language, "theme"), (
          <>
            <View className="flex-row items-center px-4 py-4" style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}>
              <View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: iconBg }}>
                <Text className="text-base">{isDark ? "🌙" : "☀️"}</Text>
              </View>
              <Text style={{ color: colors.text }} className="flex-1 text-[15px] font-semibold">
                {isDark ? t(language, "darkMode") : t(language, "lightMode")}
              </Text>
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? "dark" : "light")}
                trackColor={{ false: isDark ? "#1f2937" : "#e2e8f0", true: palette.main }}
                thumbColor="#fff"
              />
            </View>
            <View className="px-4 py-4">
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-3">
                Color Theme
              </Text>
              <View className="flex-row items-center justify-between">
                {(Object.keys(primaryPalettes) as PrimaryColor[]).map((colorKey) => {
                  const isActive = primaryColor === colorKey;
                  const cPalette = primaryPalettes[colorKey];
                  return (
                    <TouchableOpacity
                      key={colorKey}
                      onPress={() => setPrimaryColor(colorKey)}
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: cPalette.main,
                        borderWidth: isActive ? 3 : 0,
                        borderColor: colors.bgCard,
                        shadowColor: isActive ? cPalette.main : "transparent",
                        shadowOpacity: isActive ? 0.4 : 0,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                      }}
                    >
                      {isActive && <Text className="text-white text-sm font-bold">✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
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

        {/* Premium Section */}
        <View className="mx-4 mb-6">
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest mb-3">
            {t(language, "premium")}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Premium")}
            activeOpacity={0.7}
            className="rounded-[28px] overflow-hidden"
            style={{
              borderWidth: isPremium ? 1.5 : 1,
              borderColor: isPremium ? palette.main : panelBorder,
              backgroundColor: isPremium ? (isDark ? palette.bgLight : palette.bgLight) : panelBg,
              shadowColor: palette.main,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center px-4 py-4">
              <Text className="text-lg mr-3">👑</Text>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: isPremium ? palette.deep : colors.text }}
                >
                  {isPremium ? t(language, "premiumActiveTitle") : t(language, "unlockPremium")}
                </Text>
                <Text
                  className="text-xs mt-0.5 font-medium"
                  style={{ color: isPremium ? palette.deep : colors.textMuted }}
                >
                  {isPremium
                    ? t(language, "premiumBenefitNoAds")
                    : `Rp10.000 – Rp20.000 · ${t(language, "premiumOneTimePay")}`}
                </Text>
              </View>
              {isPremium ? (
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: palette.bgLight, borderColor: palette.soft, borderWidth: 1 }}
                >
                  <Text className="text-xs font-black" style={{ color: palette.deep }}>✓ AKTIF</Text>
                </View>
              ) : (
                <Text style={{ color: colors.textMuted }}>›</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: panelBg, borderColor: panelBorder, borderTopWidth: 1 }} className="rounded-t-3xl max-h-[80%]">
            <View className="flex-row justify-between items-center px-6 py-5" style={{ borderBottomColor: panelBorder, borderBottomWidth: 1 }}>
              <Text style={{ color: colors.text }} className="text-xl font-bold">{t(language, "selectCurrency")}</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text className="font-bold text-lg" style={{ color: palette.main }}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setCurrency(item.code); setShowCurrencyModal(false); }}
                  className="flex-row items-center px-5 py-3.5"
                  style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}
                  activeOpacity={0.7}
                >
                  <View className="w-12">
                    <Text style={{ color: colors.text }} className="text-base font-bold">{item.symbol}</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-base font-semibold">{item.name}</Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">{item.code}</Text>
                  </View>
                  {currency === item.code && <Text className="text-xl font-bold" style={{ color: palette.main }}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: panelBg, borderColor: panelBorder, borderTopWidth: 1 }} className="rounded-t-3xl">
            <View className="flex-row justify-between items-center px-6 py-5" style={{ borderBottomColor: panelBorder, borderBottomWidth: 1 }}>
              <Text style={{ color: colors.text }} className="text-xl font-bold">{t(language, "selectLanguage")}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text className="font-bold text-lg" style={{ color: palette.main }}>✕</Text>
              </TouchableOpacity>
            </View>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => { setLanguage(lang.code); setShowLanguageModal(false); }}
                className="flex-row items-center px-5 py-4"
                style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="text-base font-semibold">{lang.nativeName}</Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs">{lang.name}</Text>
                </View>
                {language === lang.code && <Text className="text-xl font-bold" style={{ color: palette.main }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};
