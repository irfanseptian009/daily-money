import React from "react";
import { View, Text, ImageBackground } from "react-native";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";
import { formatCurrency } from "../config/currencies";

interface BalanceSummaryProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export const BalanceSummary: React.FC<BalanceSummaryProps> = ({ totalIncome, totalExpense, balance }) => {
  const { language, currency, palette } = useSettings();
  const isPositive = balance >= 0;
  const subtleWhite = "#fff3e8";
  const strongWhite = "#ffffff";
  const softPanel = "#ffffff1c";
  const softPanelBorder = "#ffffff2d";

  return (
    <ImageBackground
      source={require("../../assets/balance_summary.png")}
      resizeMode="cover"
      imageStyle={{ opacity: 0.25, borderRadius: 28 }}
      style={{
        backgroundColor: palette.main,
        borderColor: palette.soft,
        borderWidth: 1,
        shadowColor: palette.main,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 18,
        elevation: 7,
        overflow: "hidden",
      }}
      className="mx-4 mt-4 mb-2 rounded-[32px] p-6 shadow-lg"
    >


      <View className="absolute -right-8 -top-10 w-32 h-32 rounded-full" style={{ backgroundColor: "#ffffff22" }} />
      <View className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full" style={{ backgroundColor: "#ffffff12" }} />
      <View className="absolute right-20 -bottom-12 w-24 h-24 rounded-full" style={{ backgroundColor: "#ffffff10" }} />

      <View className="mb-4 flex-row items-center justify-between">
        <View>

          <Text style={{ color: strongWhite }} className="text-lg font-extrabold mt-1">
            {t(language, "currentBalance")}
          </Text>
        </View>

        <View
          className="px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: "#ffffff24",
            borderWidth: 1,
            borderColor: "#ffffff2f",
          }}
        >
          <Text className="text-xs font-bold" style={{ color: strongWhite, letterSpacing: 0.4 }}>
            {isPositive ? "▲ Positive" : "▼ Negative"}
          </Text>
        </View>
      </View>

      <View className="mb-4">
        <Text
          className="text-[38px] font-black text-center"
          style={{ color: strongWhite, letterSpacing: -1 }}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatCurrency(balance, currency)}
        </Text>
        <Text style={{ color: subtleWhite }} className="text-xs text-center font-semibold mt-1">
          {isPositive ? "Great job, your finances are healthy" : "Watch spending to improve balance"}
        </Text>
      </View>

      <View style={{ backgroundColor: "#ffffff2a" }} className="h-px mb-4 opacity-90" />

      <View className="flex-row items-stretch">
        <View
          className="flex-1 p-3 rounded-2xl"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.79)",
          }}
        >
          <View className="flex-row items-center mb-1">

            <Text style={{ color: "#059669" }} className="text-[11px] font-bold uppercase tracking-[1.5px]">
              ▼{t(language, "income")}
            </Text>
          </View>
          <Text className="text-xl font-extrabold" style={{ color: "#047857", letterSpacing: -0.2 }} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(totalIncome, currency)}
          </Text>
        </View>

        <View className="w-2" />

        <View
          className="flex-1 p-3 rounded-2xl"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.79)",
          }}
        >
          <View className="flex-row items-center mb-1">
            <Text style={{ color: "#e11d48", }} className="text-[11px] font-bold uppercase tracking-[1.5px]">
              🔺{t(language, "expense")}
            </Text>
          </View>
          <Text className="text-xl font-extrabold" style={{ color: "#be123c", letterSpacing: -0.2 }} numberOfLines={1} adjustsFontSizeToFit>
            {formatCurrency(totalExpense, currency)}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};
