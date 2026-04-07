import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  Animated,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useSettings } from "../context/SettingsContext";
import { usePremium } from "../context/PremiumContext";
import { t } from "../config/translations";

type Props = NativeStackScreenProps<RootStackParamList, "Premium">;

type PriceOption = {
  id: string;
  label: string;
  price: number;
  priceDisplay: string;
  highlight: boolean;
  badge?: string;
};

const PRICE_OPTIONS: PriceOption[] = [
  {
    id: "basic",
    label: "premiumBasic",
    price: 10000,
    priceDisplay: "Rp10.000",
    highlight: false,
  },
  {
    id: "premium",
    label: "premiumFull",
    price: 20000,
    priceDisplay: "Rp20.000",
    highlight: true,
    badge: "premiumBestValue",
  },
];

const BENEFITS = [
  { icon: "🚫", key: "premiumBenefitNoAds" },
  { icon: "⚡", key: "premiumBenefitFast" },
  { icon: "📊", key: "premiumBenefitStats" },
  { icon: "🔐", key: "premiumBenefitPrivacy" },
  { icon: "💎", key: "premiumBenefitSupport" },
];

export const PremiumScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, language } = useSettings();
  const { isPremium, activatePremium } = usePremium();
  const [selectedOption, setSelectedOption] = useState<string>("premium");
  const [isPurchasing, setIsPurchasing] = useState(false);

  const selectedPrice = PRICE_OPTIONS.find((o) => o.id === selectedOption);

  const handlePurchase = useCallback(async () => {
    if (isPurchasing) return;

    Alert.alert(
      t(language, "premiumConfirmTitle"),
      `${t(language, "premiumConfirmDesc")} ${selectedPrice?.priceDisplay}`,
      [
        { text: t(language, "cancel"), style: "cancel" },
        {
          text: t(language, "premiumActivate"),
          onPress: async () => {
            setIsPurchasing(true);
            try {
              // In production: integrate with payment gateway (Midtrans/Xendit/Google Pay/Apple Pay)
              // For now: simulate purchase flow
              await new Promise((resolve) => setTimeout(resolve, 1500));
              await activatePremium();
              Alert.alert(
                t(language, "premiumSuccessTitle"),
                t(language, "premiumSuccessDesc"),
                [{ text: "OK", onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              Alert.alert(t(language, "error"), t(language, "saveError"));
            } finally {
              setIsPurchasing(false);
            }
          },
        },
      ]
    );
  }, [isPurchasing, selectedPrice, activatePremium, navigation, language]);

  if (isPremium) {
    return (
      <View style={{ backgroundColor: colors.bg }} className="flex-1 items-center justify-center px-8">
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
        <Text className="text-6xl mb-6">👑</Text>
        <Text style={{ color: colors.text }} className="text-2xl font-bold text-center mb-3">
          {t(language, "premiumActiveTitle")}
        </Text>
        <Text style={{ color: colors.textSecondary }} className="text-base text-center mb-8">
          {t(language, "premiumActiveDesc")}
        </Text>
        {/* Active badge */}
        <View
          className="px-6 py-3 rounded-full"
          style={{ backgroundColor: "#10b981" + "22", borderColor: "#10b981", borderWidth: 1.5 }}
        >
          <Text className="text-income-400 font-bold text-base">✓ {t(language, "premiumActive")}</Text>
        </View>

        {/* Benefits recap */}
        <View className="mt-8 w-full" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} >
          {BENEFITS.map((b, i) => (
            <View
              key={b.key}
              className="flex-row items-center px-5 py-3.5"
              style={{ borderBottomColor: colors.border, borderBottomWidth: i < BENEFITS.length - 1 ? 0.5 : 0 }}
            >
              <Text className="text-lg mr-3">{b.icon}</Text>
              <Text style={{ color: colors.text }} className="text-sm font-medium">{t(language, b.key)}</Text>
              <Text className="ml-auto text-income-400 font-bold">✓</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View
          className="mx-4 mt-4 mb-6 rounded-3xl overflow-hidden"
          style={{
            backgroundColor: "#0f172a",
            borderColor: "#334155",
            borderWidth: 1,
          }}
        >
          {/* Gold gradient header */}
          <View
            className="items-center py-10 px-6"
            style={{
              backgroundColor: "transparent",
            }}
          >
            {/* Crown icon with glow */}
            <View
              className="w-24 h-24 rounded-full items-center justify-center mb-4"
              style={{
                backgroundColor: "#fbbf2422",
                borderColor: "#fbbf24",
                borderWidth: 2,
                shadowColor: "#fbbf24",
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 20,
                elevation: 12,
              }}
            >
              <Text className="text-5xl">👑</Text>
            </View>

            <Text
              className="text-3xl font-bold text-center mb-2"
              style={{ color: "#fbbf24" }}
            >
              Daily Money{" "}
              <Text style={{ color: "#fff" }}>Premium</Text>
            </Text>
            <Text
              className="text-base text-center"
              style={{ color: "#94a3b8" }}
            >
              {t(language, "premiumSubtitle")}
            </Text>
          </View>

          {/* Divider */}
          <View style={{ height: 1, backgroundColor: "#334155" }} />

          {/* Benefits */}
          <View className="px-4 py-4">
            {BENEFITS.map((b, i) => (
              <View
                key={b.key}
                className="flex-row items-center py-3"
                style={{
                  borderBottomColor: "#1e293b",
                  borderBottomWidth: i < BENEFITS.length - 1 ? 1 : 0,
                }}
              >
                <View
                  className="w-9 h-9 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: "#10b98120" }}
                >
                  <Text className="text-base">{b.icon}</Text>
                </View>
                <Text
                  className="text-sm font-medium flex-1"
                  style={{ color: "#f1f5f9" }}
                >
                  {t(language, b.key)}
                </Text>
                <View
                  className="w-5 h-5 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#10b981" }}
                >
                  <Text className="text-white text-xs font-bold">✓</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Price Options */}
        <View className="mx-4 mb-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-sm font-semibold uppercase tracking-wider mb-3"
          >
            {t(language, "premiumChoosePlan")}
          </Text>

          {PRICE_OPTIONS.map((option) => {
            const isSelected = selectedOption === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                onPress={() => setSelectedOption(option.id)}
                activeOpacity={0.8}
                className="mb-3 rounded-2xl overflow-hidden"
                style={{
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected
                    ? option.highlight
                      ? "#fbbf24"
                      : "#10b981"
                    : colors.border,
                  backgroundColor: isSelected
                    ? option.highlight
                      ? "#fbbf2408"
                      : "#10b98108"
                    : colors.bgCard,
                }}
              >
                {option.badge && (
                  <View
                    className="py-1.5 items-center"
                    style={{
                      backgroundColor: option.highlight ? "#fbbf24" : "#10b981",
                    }}
                  >
                    <Text className="text-xs font-bold text-black">
                      ⭐ {t(language, option.badge)}
                    </Text>
                  </View>
                )}

                <View className="flex-row items-center px-5 py-4">
                  {/* Radio */}
                  <View
                    className="w-5 h-5 rounded-full border-2 items-center justify-center mr-4"
                    style={{
                      borderColor: isSelected
                        ? option.highlight
                          ? "#fbbf24"
                          : "#10b981"
                        : colors.border,
                    }}
                  >
                    {isSelected && (
                      <View
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor: option.highlight ? "#fbbf24" : "#10b981",
                        }}
                      />
                    )}
                  </View>

                  {/* Label */}
                  <View className="flex-1">
                    <Text
                      style={{ color: colors.text }}
                      className="text-base font-semibold"
                    >
                      {t(language, option.label)}
                    </Text>
                    <Text
                      style={{ color: colors.textMuted }}
                      className="text-xs mt-0.5"
                    >
                      {t(language, "premiumOneTimePay")}
                    </Text>
                  </View>

                  {/* Price */}
                  <Text
                    className="text-xl font-bold"
                    style={{
                      color: isSelected
                        ? option.highlight
                          ? "#fbbf24"
                          : "#10b981"
                        : colors.text,
                    }}
                  >
                    {option.priceDisplay}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Note */}
        <View
          className="mx-4 mb-6 px-4 py-3 rounded-xl"
          style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text style={{ color: colors.textMuted }} className="text-xs text-center leading-5">
            💡 {t(language, "premiumNote")}
          </Text>
        </View>

        {/* Compare Table */}
        <View className="mx-4 mb-6">
          <Text
            style={{ color: colors.textSecondary }}
            className="text-sm font-semibold uppercase tracking-wider mb-3"
          >
            {t(language, "premiumCompare")}
          </Text>
          <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-2xl overflow-hidden">
            {/* Header row */}
            <View className="flex-row" style={{ borderBottomColor: colors.border, borderBottomWidth: 1 }}>
              <View className="flex-2 py-3 px-4" style={{ flex: 2 }}>
                <Text style={{ color: colors.textMuted }} className="text-xs font-semibold uppercase">Fitur</Text>
              </View>
              <View className="flex-1 py-3 px-2 items-center" style={{ flex: 1, borderLeftColor: colors.border, borderLeftWidth: 1 }}>
                <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">Gratis</Text>
              </View>
              <View className="flex-1 py-3 px-2 items-center" style={{ flex: 1, backgroundColor: "#fbbf2408", borderLeftColor: "#fbbf24", borderLeftWidth: 1 }}>
                <Text className="text-xs font-bold" style={{ color: "#fbbf24" }}>👑 Pro</Text>
              </View>
            </View>

            {[
              { label: t(language, "premiumRowAllFeatures"), free: "✓", pro: "✓" },
              { label: t(language, "premiumRowAds"), free: "😣", pro: "🚫" },
              { label: t(language, "premiumRowSpeed"), free: "Normal", pro: "⚡ Fast" },
              { label: t(language, "premiumRowSupport"), free: "—", pro: "✓" },
            ].map((row, i, arr) => (
              <View
                key={i}
                className="flex-row"
                style={{ borderBottomColor: colors.border, borderBottomWidth: i < arr.length - 1 ? 0.5 : 0 }}
              >
                <View className="flex-2 py-3 px-4" style={{ flex: 2 }}>
                  <Text style={{ color: colors.text }} className="text-xs">{row.label}</Text>
                </View>
                <View className="flex-1 py-3 px-2 items-center" style={{ flex: 1, borderLeftColor: colors.border, borderLeftWidth: 1 }}>
                  <Text style={{ color: colors.textMuted }} className="text-xs">{row.free}</Text>
                </View>
                <View className="flex-1 py-3 px-2 items-center" style={{ flex: 1, backgroundColor: "#fbbf2405", borderLeftColor: "#fbbf24", borderLeftWidth: 1 }}>
                  <Text className="text-xs font-bold" style={{ color: "#10b981" }}>{row.pro}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA Button — fixed at bottom */}
      <View
        className="px-4 pb-8 pt-3"
        style={{ borderTopColor: colors.border, borderTopWidth: 0.5, backgroundColor: colors.bg }}
      >
        <TouchableOpacity
          onPress={handlePurchase}
          disabled={isPurchasing}
          activeOpacity={0.85}
          className="py-4 rounded-2xl items-center flex-row justify-center"
          style={{
            backgroundColor: isPurchasing ? "#94a3b8" : "#fbbf24",
            shadowColor: "#fbbf24",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isPurchasing ? 0 : 0.35,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          {isPurchasing ? (
            <Text className="text-black text-lg font-bold">⏳ {t(language, "premiumProcessing")}...</Text>
          ) : (
            <>
              <Text className="text-black text-lg font-bold mr-2">
                👑 {t(language, "premiumGetPremium")}
              </Text>
              <Text className="text-black text-base font-semibold opacity-80">
                — {selectedPrice?.priceDisplay}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={{ color: colors.textMuted }} className="text-xs text-center mt-3">
          🔒 {t(language, "premiumSecure")}
        </Text>
      </View>
    </View>
  );
};
