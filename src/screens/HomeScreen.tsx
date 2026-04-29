import React, { useCallback, useState, useMemo, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StatusBar, Modal, ScrollView, Image
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BalanceSummary } from "../components/BalanceSummary";
import { TransactionCard } from "../components/TransactionCard";
import { EmptyState } from "../components/EmptyState";
import { SearchBar } from "../components/SearchBar";
import { useTransactions } from "../hooks/useTransactions";
import { useSettings } from "../context/SettingsContext";
import { usePremium } from "../context/PremiumContext";
import { useCategories } from "../context/CategoriesContext";
import { useProfile } from "../context/ProfileContext";
import { t } from "../config/translations";
import { normalizeCategoryEmoji } from "../config/categoryEmojis";
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { Transaction, RootStackParamList, TransactionType, CategoryId } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { transactions, isLoading, totalIncome, totalExpense, balance, deleteTransaction, refresh } = useTransactions();
  const { colors, language, currency, theme, palette } = useSettings();
  const { isPremium } = usePremium();
  const { categories } = useCategories();
  const { profile, getInitials } = useProfile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<CategoryId | "all">("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const currentMonthLabel = useMemo(
    () => new Date().toLocaleDateString(language === "id" ? "id-ID" : "en-US", { month: "long", year: "numeric" }),
    [language]
  );

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => months.add(tx.date.substring(0, 7)));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;
    if (selectedMonth !== "all") filtered = filtered.filter((tx) => tx.date.startsWith(selectedMonth));
    if (filterType !== "all") filtered = filtered.filter((tx) => tx.type === filterType);
    if (filterCategory !== "all") filtered = filtered.filter((tx) => tx.category === filterCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((tx) =>
        (tx.note && tx.note.toLowerCase().includes(q)) || tx.amount.toString().includes(q) || tx.type.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [transactions, selectedMonth, filterType, filterCategory, searchQuery]);

  const handleDelete = useCallback(async (id: string) => { await deleteTransaction(id); }, [deleteTransaction]);
  const handleEdit = useCallback((tx: Transaction) => { navigation.navigate("AddTransaction", { transaction: tx }); }, [navigation]);
  const handleAddPress = useCallback(() => { navigation.navigate("AddTransaction"); }, [navigation]);
  const navBottomOffset = 14;
  const adBottomOffset = 96;

  const renderTransaction = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionCard transaction={item} onDelete={handleDelete} onEdit={handleEdit} />
    ),
    [handleDelete, handleEdit]
  );

  const keyExtractor = useCallback((item: Transaction) => item.id, []);

  const getGreeting = useCallback(() => {
    const hour = new Date().getHours();
    if (hour < 12) return language === "id" ? "Selamat Pagi" : "Good Morning";
    if (hour < 17) return language === "id" ? "Selamat Siang" : "Good Afternoon";
    if (hour < 19) return language === "id" ? "Selamat Sore" : "Good Evening";
    return language === "id" ? "Selamat Malam" : "Good Night";
  }, [language]);

  const [greeting, setGreeting] = useState(getGreeting());

  useEffect(() => {
    setGreeting(getGreeting());
    const interval = setInterval(() => setGreeting(getGreeting()), 60000);
    return () => clearInterval(interval);
  }, [getGreeting]);

  const AVATAR_GRADIENTS = [
    ["#667eea", "#764ba2"],
    ["#f093fb", "#f5576c"],
    ["#4facfe", "#00f2fe"],
    ["#43e97b", "#38f9d7"],
    ["#fa709a", "#fee140"],
    ["#a18cd1", "#fbc2eb"],
  ];

  const avatarGradient = useMemo(() => {
    const name = profile.name || "U";
    const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
  }, [profile.name]);

  const ListHeader = useCallback(() => (
    <>
      {/* Modern Header Bar */}
      <View className="px-4 pt-3 pb-4">
        <View className="flex-row items-center justify-between">
          {/* Left: Avatar + Greeting */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              activeOpacity={0.8}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                overflow: "hidden",
                borderWidth: 2.5,
                borderColor: palette.main,
                shadowColor: palette.main,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {profile.photoUri ? (
                profile.photoUri.startsWith("emoji:") ? (
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: avatarGradient[0],
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{profile.photoUri.replace("emoji:", "")}</Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: profile.photoUri }}
                    style={{ width: 44, height: 44, borderRadius: 22 }}
                  />
                )
              ) : (
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: avatarGradient[0],
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", letterSpacing: 1 }}>
                    {getInitials()}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="ml-3 flex-1">
              <Text style={{ color: colors.textMuted }} className="text-xs font-semibold">
                {greeting} 👋
              </Text>
              <Text style={{ color: colors.text }} className="text-lg font-black" numberOfLines={1}>
                {profile.name || "User"}
              </Text>
            </View>
          </View>

          {/* Right: Notification bell */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Notifications")}
            activeOpacity={0.7}
            style={{
              width: 42,
              height: 42,
              borderRadius: 21,
              backgroundColor: theme === "dark" ? "#1f293750" : "#f1f5f9",
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      <BalanceSummary totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />
      <View className="mt-2">
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} placeholder={t(language, "searchTransactions")} />
      </View>
      <View className="mx-4 mt-2 mb-3 flex-row items-center justify-between">
        <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest">
          {selectedMonth === "all" ? t(language, "allTransactions") : t(language, "filteredTransactions")}
        </Text>
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="px-4 py-2 rounded-xl flex-row items-center"
          style={{
            backgroundColor: (filterType !== "all" || filterCategory !== "all" || selectedMonth !== "all") ? palette.main : colors.bgCard,
            borderColor: (filterType !== "all" || filterCategory !== "all" || selectedMonth !== "all") ? palette.main : colors.border,
            borderWidth: 1
          }}
        >
          <Text style={{ color: (filterType !== "all" || filterCategory !== "all" || selectedMonth !== "all") ? "#fff" : colors.textMuted }} className="text-[12px] font-bold">
            {(filterType !== "all" || filterCategory !== "all" || selectedMonth !== "all") ? "Filtered" : "Filter"} ᯤ
          </Text>
        </TouchableOpacity>
      </View>
    </>
  ), [totalIncome, totalExpense, balance, searchQuery, selectedMonth, filterType, filterCategory, availableMonths, filteredTransactions.length, language, colors, currentMonthLabel]);

  if (isLoading) {
    return (
      <View style={{ backgroundColor: colors.bg }} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={palette.main} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ backgroundColor: colors.bg, flex: 1 }} edges={["top"]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          searchQuery || selectedMonth !== "all" ? (
            <View className="items-center py-16 px-8">
              <Text className="text-3xl mb-3" style={{ color: colors.textMuted }}>⌕</Text>
              <Text style={{ color: colors.text }} className="text-base font-semibold text-center">{t(language, "noResults")}</Text>
              <Text style={{ color: colors.textMuted }} className="text-sm text-center mt-1">{t(language, "noResultsDesc")}</Text>
            </View>
          ) : <EmptyState />
        }
        contentContainerStyle={filteredTransactions.length === 0 ? { flex: 1, paddingBottom: 220 } : { paddingBottom: 240 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Ad / Premium Area */}
      {/* <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: adBottomOffset,
        }}
      >
        {isPremium ? (
          <View
            className="items-center py-1.5 flex-row justify-center rounded-t-2xl"
            style={{ backgroundColor: palette.bgLight, borderTopColor: palette.soft, borderTopWidth: 1 }}
          >
            <Text className="text-xs font-semibold" style={{ color: palette.main }}>
              Premium — {t(language, "premiumBenefitNoAds")}
            </Text>
          </View>
        ) : (
          <View>
            <TouchableOpacity
              onPress={() => navigation.navigate("Premium")}
              activeOpacity={0.85}
              className="flex-row items-center justify-center py-2 px-4"
              style={{
                backgroundColor: palette.bgLight,
                borderTopColor: palette.soft,
                borderTopWidth: 1,
                borderTopLeftRadius: 18,
                borderTopRightRadius: 18,
              }}
            >
              <Text className="text-xs font-semibold mr-1" style={{ color: palette.main }}>
                {t(language, "unlockPremium")}
              </Text>
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                · Rp10rb - Rp20rb
              </Text>
            </TouchableOpacity>

            <View className="items-center pb-2 bg-transparent justify-end">
              {false && <BannerAd
                unitId={TestIds.BANNER}
                size={BannerAdSize.BANNER}
                requestOptions={{
                  requestNonPersonalizedAdsOnly: true,
                }}
                onAdFailedToLoad={(error) => {
                  console.warn('Ad Failed To Load', error);
                }}
              />}
            </View>
          </View>
        )}
      </View> */}

      <View
        className="absolute left-4 right-4 flex-row items-center justify-between rounded-[32px] px-3"
        style={{
          bottom: navBottomOffset,
          height: 70,
          backgroundColor: theme === "dark" ? "rgba(15, 23, 42, 0.85)" : "rgba(255, 255, 255, 0.9)",
          borderColor: palette.soft,
          borderWidth: 0.3,
          shadowColor: palette.main,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.15,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate("Statistics")}
          activeOpacity={0.8}
          className="h-12 flex-1 rounded-[20px] items-center justify-center"
          style={{ backgroundColor: palette.bgLight, borderColor: "transparent", borderWidth: 1 }}
        >
          <Text className="text-[22px] font-black" style={{ color: palette.deep, marginBottom: 2 }}>ﮩ٨ـﮩﮩ٨ـ</Text>
        </TouchableOpacity>

        <View style={{ width: 86 }} />

        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          activeOpacity={0.8}
          className="h-12 flex-1 rounded-[20px] items-center justify-center"
          style={{ backgroundColor: palette.bgLight, borderColor: "transparent", borderWidth: 1 }}
        >
          <Text className="text-[22px] font-black" style={{ color: palette.deep, marginBottom: 2 }}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handleAddPress}
        activeOpacity={0.85}
        className="absolute items-center justify-center"
        style={{
          left: "50%",
          marginLeft: -34,
          bottom: navBottomOffset + 24,
          width: 68,
          height: 68,
          borderRadius: 34,
          backgroundColor: palette.main,
          borderWidth: 6,
          borderColor: theme === "dark" ? "#0f172a" : "#ffffff",
          shadowColor: palette.main,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 18,
          elevation: 10,
        }}
      >
        <Text className="text-[32px] font-black text-white" style={{ marginTop: -5 }}>✚</Text>
      </TouchableOpacity>

      <Modal visible={showFilterModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/60">
          <View style={{ backgroundColor: colors.bg }} className="rounded-t-[32px] p-6 pb-12">
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ color: colors.text }} className="text-2xl font-black">Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)} className="p-2 rounded-full" style={{ backgroundColor: colors.bgSecondary }}>
                <Text style={{ color: colors.textSecondary }} className="font-bold text-lg">✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.textSecondary }} className="text-sm font-bold uppercase tracking-widest mb-3">Type</Text>
            <View className="flex-row mb-6">
              {["all", TransactionType.INCOME, TransactionType.EXPENSE].map((tVal) => (
                <TouchableOpacity
                  key={tVal}
                  onPress={() => setFilterType(tVal as any)}
                  className="flex-1 py-3 items-center rounded-2xl mr-2"
                  style={{
                    backgroundColor: filterType === tVal ? palette.main : colors.bgCard,
                    borderColor: filterType === tVal ? palette.main : colors.border,
                    borderWidth: 1,
                  }}
                >
                  <Text style={{ color: filterType === tVal ? "#fff" : colors.text, fontWeight: "bold" }}>
                    {tVal === "all" ? "All" : t(language, tVal)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {availableMonths.length > 0 && (
              <>
                <Text style={{ color: colors.textSecondary }} className="text-sm font-bold uppercase tracking-widest mb-3">Month</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                  <TouchableOpacity
                    onPress={() => setSelectedMonth("all")}
                    className="px-4 py-2.5 rounded-xl mr-2"
                    style={{
                      backgroundColor: selectedMonth === "all" ? palette.main : colors.bgCard,
                      borderColor: selectedMonth === "all" ? palette.main : colors.border,
                      borderWidth: 1,
                    }}
                  >
                    <Text style={{ color: selectedMonth === "all" ? "#fff" : colors.text, fontWeight: "bold" }}>All Time</Text>
                  </TouchableOpacity>
                  {availableMonths.map((m) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setSelectedMonth(m)}
                      className="px-4 py-2.5 rounded-xl mr-2"
                      style={{
                        backgroundColor: selectedMonth === m ? palette.main : colors.bgCard,
                        borderColor: selectedMonth === m ? palette.main : colors.border,
                        borderWidth: 1,
                      }}
                    >
                      <Text style={{ color: selectedMonth === m ? "#fff" : colors.text, fontWeight: "bold" }}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={{ color: colors.textSecondary }} className="text-sm font-bold uppercase tracking-widest mb-3">Category</Text>
            <ScrollView className="max-h-60 mb-6" showsVerticalScrollIndicator={false}>
              <View className="flex-row flex-wrap">
                <TouchableOpacity
                  onPress={() => setFilterCategory("all")}
                  className="px-4 py-2.5 rounded-xl mr-2 mb-2"
                  style={{
                    backgroundColor: filterCategory === "all" ? palette.main : colors.bgCard,
                    borderColor: filterCategory === "all" ? palette.main : colors.border,
                    borderWidth: 1,
                  }}
                >
                  <Text style={{ color: filterCategory === "all" ? "#fff" : colors.text, fontWeight: "bold" }}>All</Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setFilterCategory(cat.id)}
                    className="px-4 py-2.5 rounded-xl mr-2 mb-2 flex-row items-center"
                    style={{
                      backgroundColor: filterCategory === cat.id ? palette.main : colors.bgCard,
                      borderColor: filterCategory === cat.id ? palette.main : colors.border,
                      borderWidth: 1,
                    }}
                  >
                    <Text className="mr-2 text-base">{normalizeCategoryEmoji(cat.icon, cat.type)}</Text>
                    <Text style={{ color: filterCategory === cat.id ? "#fff" : colors.text, fontWeight: "bold" }}>
                      {cat.isCustom ? cat.label : t(language, cat.label)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowFilterModal(false)}
              className="py-4 items-center rounded-2xl"
              style={{ backgroundColor: palette.main }}
            >
              <Text className="text-white font-bold text-lg">Apply Filter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
