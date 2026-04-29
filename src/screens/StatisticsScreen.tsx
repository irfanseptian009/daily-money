import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  StatusBar,
  Share,
  Alert,
  Dimensions,
  Animated,
  Easing,
  Modal,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { useTransactions } from "../hooks/useTransactions";
import { useCategories } from "../context/CategoriesContext";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";
import { formatCurrency } from "../config/currencies";
import { TransactionType, RootStackParamList, CategoryId } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "Statistics">;

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TRACK_WIDTH = SCREEN_WIDTH - 92;

interface CategoryBreakdown {
  category: CategoryId;
  label: string;
  total: number;
  count: number;
  percentage: number;
}

const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  valueColor?: string;
  cardBg: string;
  cardBorder: string;
  text: string;
  textMuted: string;
  isDark: boolean;
}> = ({ label, value, icon, valueColor, cardBg, cardBorder, text, textMuted, isDark }) => {
  const cardBgColor = isDark ? "#1a1f3a" : "#ffffff";
  const shadowColor = isDark ? (valueColor || "#000000") : "#000000";
  const labelColor = isDark ? "#9ca3af" : "#6b7280";
  const valueTextColor = isDark ? "#f3f4f6" : "#1f2937";

  return (
    <View
      style={{
        width: 160,
        marginRight: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: cardBgColor,
        shadowColor: shadowColor,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: isDark ? 0.25 : 0.08,
        shadowRadius: isDark ? 10 : 12,
        elevation: isDark ? 6 : 4,
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
      }}
    >
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 12,
          backgroundColor: valueColor ? valueColor + "18" : "#00000018",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Text style={{ fontSize: 18, color: valueColor || "#000", fontWeight: "800" }}>{icon}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: labelColor, fontSize: 9, fontWeight: "600", letterSpacing: 0.2 }} numberOfLines={1}>
          {label}
        </Text>
        <Text style={{ color: valueTextColor, fontWeight: "900", fontSize: 18, letterSpacing: -0.3, marginTop: 2 }} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
      </View>
    </View>
  );
};

const AnimatedTrendChart: React.FC<{
  data: { label: string; income: number; expense: number }[];
  maxVal: number;
  textMuted: string;
}> = ({ data, maxVal, textMuted }) => {
  const animBars = useRef<Animated.Value[]>([]);

  if (animBars.current.length !== data.length * 2) {
    animBars.current = Array.from({ length: data.length * 2 }, () => new Animated.Value(0));
  }

  useEffect(() => {
    animBars.current.forEach((v) => v.setValue(0));
    Animated.stagger(
      70,
      animBars.current.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      )
    ).start();
  }, [data]);

  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 170 }}>
      {data.map((d, i) => {
        const incomeTarget = Math.max((d.income / maxVal) * 120, 4);
        const expenseTarget = Math.max((d.expense / maxVal) * 120, 4);
        const incomeAnim = animBars.current[i * 2];
        const expenseAnim = animBars.current[i * 2 + 1];

        return (
          <View key={d.label} style={{ flex: 1, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", height: 124 }}>
              <Animated.View
                style={{
                  width: 9,
                  marginRight: 3,
                  borderRadius: 6,
                  backgroundColor: "#fdba74",
                  height: incomeAnim.interpolate({ inputRange: [0, 1], outputRange: [3, incomeTarget] }),
                }}
              />
              <Animated.View
                style={{
                  width: 9,
                  borderRadius: 6,
                  backgroundColor: "#ea580c",
                  height: expenseAnim.interpolate({ inputRange: [0, 1], outputRange: [3, expenseTarget] }),
                }}
              />
            </View>
            <Text style={{ color: textMuted, fontSize: 10, marginTop: 6 }} numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const AnimatedLineTrendChart: React.FC<{
  data: { label: string; income: number; expense: number }[];
  maxVal: number;
  text: string;
  textMuted: string;
  cardBorder: string;
  incomeColor: string;
  expenseColor: string;
}> = ({ data, maxVal, text, textMuted, cardBorder, incomeColor, expenseColor }) => {
  const lineAnim = useRef(new Animated.Value(0)).current;
  const chartWidth = TRACK_WIDTH;
  const axisWidth = 36;
  const plotWidth = chartWidth - axisWidth - 8;
  const chartHeight = 122;

  useEffect(() => {
    lineAnim.setValue(0);
    Animated.timing(lineAnim, {
      toValue: 1,
      duration: 480,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [data, lineAnim]);

  const compactAmount = useCallback((value: number) => {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return `${Math.round(value)}`;
  }, []);

  const makePoints = useCallback(
    (key: "income" | "expense") => {
      if (data.length === 0) return [] as { x: number; y: number; label: string }[];
      const step = data.length > 1 ? plotWidth / (data.length - 1) : 0;
      return data.map((d, i) => ({
        label: d.label,
        x: i * step,
        y: chartHeight - ((d[key] / maxVal) * chartHeight || 0),
      }));
    },
    [data, plotWidth, chartHeight, maxVal]
  );

  const incomePoints = makePoints("income");
  const expensePoints = makePoints("expense");

  const renderSegments = (points: { x: number; y: number }[], color: string, prefix: string) =>
    points.slice(0, -1).map((p, i) => {
      const n = points[i + 1];
      const dx = n.x - p.x;
      const dy = n.y - p.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const midX = (p.x + n.x) / 2;
      const midY = (p.y + n.y) / 2;

      return (
        <View
          key={`${prefix}-seg-${i}`}
          style={{
            position: "absolute",
            left: midX - length / 2,
            top: midY - 1.25,
            width: length,
            height: 2.5,
            borderRadius: 2,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      );
    });

  const renderPoints = (points: { x: number; y: number }[], color: string, prefix: string) =>
    points.map((p, i) => (
      <View
        key={`${prefix}-dot-${i}`}
        style={{
          position: "absolute",
          left: p.x - 4,
          top: p.y - 4,
          width: 8,
          height: 8,
          borderRadius: 999,
          backgroundColor: color,
          borderWidth: 1.6,
          borderColor: "#fff",
        }}
      />
    ));

  const lastPoint = data.length > 0 ? data[data.length - 1] : null;

  return (
    <Animated.View
      style={{
        opacity: lineAnim,
        transform: [{ translateY: lineAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
      }}
    >
      <View style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text style={{ color: text, fontSize: 13, fontWeight: "800" }}>Flow Curve</Text>
        <Text style={{ color: textMuted, fontSize: 11 }}>Income vs Expense</Text>
      </View>

      {lastPoint && (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: incomeColor, marginRight: 6 }} />
            <Text style={{ color: textMuted, fontSize: 11, fontWeight: "600" }}>Income {compactAmount(lastPoint.income)}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View style={{ width: 9, height: 9, borderRadius: 999, backgroundColor: expenseColor, marginRight: 6 }} />
            <Text style={{ color: textMuted, fontSize: 11, fontWeight: "600" }}>Expense {compactAmount(lastPoint.expense)}</Text>
          </View>
        </View>
      )}

      <View
        style={{
          width: chartWidth,
          height: chartHeight + 42,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: cardBorder,
          paddingHorizontal: 8,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <View style={{ width: axisWidth, height: chartHeight, justifyContent: "space-between", paddingBottom: 2 }}>
            <Text style={{ color: textMuted, fontSize: 10, textAlign: "right" }}>{compactAmount(maxVal)}</Text>
            <Text style={{ color: textMuted, fontSize: 10, textAlign: "right" }}>{compactAmount(maxVal / 2)}</Text>
            <Text style={{ color: textMuted, fontSize: 10, textAlign: "right" }}>0</Text>
          </View>

          <View style={{ width: plotWidth, height: chartHeight, marginLeft: 8 }}>
            {[0, 1, 2].map((idx) => (
              <View
                key={`grid-${idx}`}
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: (chartHeight / 2) * idx,
                  height: 1,
                  backgroundColor: cardBorder,
                  opacity: 0.6,
                }}
              />
            ))}

            {renderSegments(incomePoints, incomeColor, "income")}
            {renderSegments(expensePoints, expenseColor, "expense")}
            {renderPoints(incomePoints, incomeColor, "income")}
            {renderPoints(expensePoints, expenseColor, "expense")}
          </View>
        </View>

        <View style={{ marginLeft: axisWidth + 8, marginTop: 6 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {data.map((d, i) => (
              <Text
                key={`label-${d.label}-${i}`}
                style={{
                  color: textMuted,
                  fontSize: 10,
                  width: data.length > 1 ? plotWidth / data.length : plotWidth,
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                {d.label}
              </Text>
            ))}
          </View>
          <Text style={{ color: textMuted, fontSize: 10, marginTop: 4, textAlign: "center" }}>Month</Text>
        </View>
      </View>
    </Animated.View>
  );
};

export const StatisticsScreen: React.FC<Props> = () => {
  const { transactions, totalIncome, totalExpense, refresh } = useTransactions();
  const { colors, language, currency, theme, palette } = useSettings();
  const { getCategoryInfo } = useCategories();
  const [viewType, setViewType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [exporting, setExporting] = useState(false);
  const [filterMonth, setFilterMonth] = useState<string>("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [trendInterval, setTrendInterval] = useState<"daily" | "weekly" | "monthly">("monthly");

  const isDark = theme === "dark";
  const cardBg = isDark ? "#0f172a" : "#ffffff";
  const cardBorder = isDark ? "#1f2937" : "#f1f5f9";

  const heroAnim = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(0)).current;
  const chartAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    heroAnim.setValue(0);
    cardsAnim.setValue(0);
    chartAnim.setValue(0);
    listAnim.setValue(0);

    Animated.sequence([
      Animated.timing(heroAnim, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(cardsAnim, { toValue: 1, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(chartAnim, { toValue: 1, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]),
      Animated.timing(listAnim, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
    ]).start();
  }, [heroAnim, cardsAnim, chartAnim, listAnim]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      animateIn();
    }, [refresh, animateIn])
  );

  const fmt = useCallback((amount: number) => formatCurrency(amount, currency), [currency]);

  const filteredData = useMemo(() => {
    return filterMonth === "all" ? transactions : transactions.filter((tx) => tx.date.startsWith(filterMonth));
  }, [transactions, filterMonth]);

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((tx) => months.add(tx.date.substring(0, 7)));
    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  const fTotalIncome = useMemo(() => filteredData.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0), [filteredData]);
  const fTotalExpense = useMemo(() => filteredData.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0), [filteredData]);
  const balance = fTotalIncome - fTotalExpense;
  const savingsRate = fTotalIncome > 0 ? ((fTotalIncome - fTotalExpense) / fTotalIncome) * 100 : 0;

  const breakdown = useMemo((): CategoryBreakdown[] => {
    const filtered = filteredData.filter((tx) => tx.type === viewType);
    const total = filtered.reduce((s, tx) => s + tx.amount, 0);
    const map = new Map<CategoryId, { total: number; count: number }>();

    filtered.forEach((tx) => {
      const cat = tx.category || (viewType === TransactionType.EXPENSE ? "other_expense" : "other_income");
      const e = map.get(cat) || { total: 0, count: 0 };
      map.set(cat, { total: e.total + tx.amount, count: e.count + 1 });
    });

    const result: CategoryBreakdown[] = [];
    map.forEach((v, k) => {
      const info = getCategoryInfo(k);
      result.push({
        category: k,
        label: info.label,
        total: v.total,
        count: v.count,
        percentage: total > 0 ? (v.total / total) * 100 : 0,
      });
    });

    return result.sort((a, b) => b.total - a.total);
  }, [filteredData, viewType, getCategoryInfo]);

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { income: number; expense: number; label: string }>();

    transactions.forEach((tx) => {
      let key = "";
      let label = "";
      const date = new Date(tx.date);
      if (trendInterval === "daily") {
        key = tx.date;
        label = date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", { weekday: "short", day: "numeric" });
      } else if (trendInterval === "weekly") {
        const d = new Date(date);
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        key = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
        label = `W${weekNo}`;
      } else {
        key = tx.date.substring(0, 7);
        label = date.toLocaleDateString(language === "id" ? "id-ID" : "en-US", { month: "short" });
      }

      const e = dataMap.get(key) || { income: 0, expense: 0, label };
      if (tx.type === TransactionType.INCOME) e.income += tx.amount;
      else e.expense += tx.amount;
      dataMap.set(key, e);
    });

    const entries = Array.from(dataMap.entries()).sort((a, b) => b[0].localeCompare(a[0]));
    return entries.slice(0, 6).reverse().map(([_, val]) => val);
  }, [transactions, trendInterval, language]);

  const chartMaxVal = useMemo(() => Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 1), [chartData]);

  const expenses = useMemo(() => filteredData.filter((tx) => tx.type === TransactionType.EXPENSE), [filteredData]);
  const avgExpense = expenses.length > 0 ? expenses.reduce((s, tx) => s + tx.amount, 0) / expenses.length : 0;
  const largestExpense = expenses.length > 0 ? Math.max(...expenses.map((tx) => tx.amount)) : 0;

  const handleExport = useCallback(async () => {
    if (transactions.length === 0) {
      Alert.alert(t(language, "noData"), t(language, "noDataDesc"));
      return;
    }

    setExporting(true);
    try {
      const header = "No,Date,Type,Category,Note,Amount,Currency\n";
      const rows = transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((tx, idx) => {
          const ci = tx.category ? getCategoryInfo(tx.category) : null;
          const catLabel = ci ? (ci.isCustom ? ci.label : t(language, ci.label)) : "Other";
          const safeNote = (tx.note || "").replace(/"/g, '""').replace(/,/g, ";");
          const typeLabel = tx.type === TransactionType.INCOME ? "Income" : "Expense";
          return `${idx + 1},${tx.date},${typeLabel},"${catLabel}","${safeNote}",${tx.amount},${currency}`;
        })
        .join("\n");

      const totalRow = `\n,,,,Total Income,,${totalIncome},${currency}\n,,,,Total Expense,,${totalExpense},${currency}\n,,,,Net Balance,,${balance},${currency}`;
      const csvContent = header + rows + totalRow;

      const now = new Date();
      const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
      const title = `DailyMoney_${dateStr}.csv`;

      await Share.share({ message: csvContent, title });
    } catch {
      Alert.alert("Export Error", "Could not export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [transactions, language, getCategoryInfo, currency, totalIncome, totalExpense, balance]);

  const hasData = filteredData.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40, paddingTop: 16 }} showsVerticalScrollIndicator={false}>

        {/* Hero Section */}
        <Animated.View
          style={{
            opacity: heroAnim,
            transform: [{ translateY: heroAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
            marginHorizontal: 16,
            marginTop: 16,
            marginBottom: 10,
            borderRadius: 32,
            overflow: "hidden",
            borderWidth: 1.25,
            borderColor: palette.soft,
            backgroundColor: palette.main,
            shadowColor: palette.main,
            shadowOffset: { width: 0, height: 14 },
            shadowOpacity: 0.2,
            shadowRadius: 24,
            elevation: 7,
          }}
        >
          <View className="absolute -right-12 -top-16 w-40 h-40 rounded-full" style={{ backgroundColor: "#ffffff22" }} />
          <View className="absolute -left-14 -bottom-16 w-48 h-48 rounded-full" style={{ backgroundColor: "#ffffff12" }} />

          <ImageBackground
            source={require("../../assets/statistic_summary.png")}
            resizeMode="cover"
            imageStyle={{ opacity: isDark ? 0.2 : 0.18 }}
            style={{ width: "100%" }}
          >

            <View style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 18, alignItems: "center" }}>
              <Text style={{ color: "#fff7ed", fontSize: 12, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 7 }}>
                {t(language, "overview")}
              </Text>
              <Text style={{ fontSize: 42, fontWeight: "900", color: "#fff", letterSpacing: -1.7 }}>{fmt(balance)}</Text>
              <Text style={{ color: "#fff7ed", fontSize: 13, marginTop: 4, fontWeight: "500" }}>{t(language, "currentBalance")}</Text>


              <TouchableOpacity
                onPress={handleExport}
                disabled={exporting}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#ffffff24",
                  marginTop: 12,
                  borderRadius: 999,
                  paddingHorizontal: 15,
                  paddingVertical: 8,
                  borderWidth: 1,
                  borderColor: "#ffffff16"
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12, letterSpacing: 0.4 }}>
                  {exporting ? "Exporting..." : "Export CSV"}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: "row", borderTopWidth: 1.25, borderTopColor: "#ffffff30" }}>
              <View style={{ flex: 1, alignItems: "center", paddingVertical: 16, borderRightWidth: 1.25, borderRightColor: "#ffffff22" }}>
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>▲ {fmt(fTotalIncome)}</Text>
                <Text style={{ color: "#fff7ed", fontSize: 12, marginTop: 3, fontWeight: "600" }}>{t(language, "income")}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "center", paddingVertical: 16 }}>
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>▼ {fmt(fTotalExpense)}</Text>
                <Text style={{ color: "#fff7ed", fontSize: 12, marginTop: 3, fontWeight: "600" }}>{t(language, "expense")}</Text>
              </View>
            </View>
          </ImageBackground>
        </Animated.View>

        {/* Stat Cards */}
        {hasData && (
          <Animated.View
            style={{
              opacity: cardsAnim,
              transform: [{ translateY: cardsAnim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
              marginBottom: 8,
            }}
          >
            <View style={{ marginHorizontal: 16, marginBottom: 10 }}>


            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
              decelerationRate="fast"
              snapToInterval={182}
            >
              <StatCard
                label={t(language, "savingsRate")}
                value={`${savingsRate.toFixed(1)}%`}
                icon="$"
                valueColor={palette.deep}
                cardBg={cardBg}
                cardBorder={cardBorder}
                text={colors.text}
                textMuted={colors.textMuted}
                isDark={isDark}
              />
              <StatCard
                label={t(language, "transactions")}
                value={String(filteredData.length)}
                icon="🧾"
                valueColor={palette.deep}
                cardBg={cardBg}
                cardBorder={cardBorder}
                text={colors.text}
                textMuted={colors.textMuted}
                isDark={isDark}
              />
              <StatCard
                label={t(language, "avgExpense")}
                value={fmt(avgExpense)}
                icon="📉"
                valueColor={palette.main}
                cardBg={cardBg}
                cardBorder={cardBorder}
                text={colors.text}
                textMuted={colors.textMuted}
                isDark={isDark}
              />
              <StatCard
                label={t(language, "largestExpense")}
                value={fmt(largestExpense)}
                icon="💸"
                valueColor={palette.deep}
                cardBg={cardBg}
                cardBorder={cardBorder}
                text={colors.text}
                textMuted={colors.textMuted}
                isDark={isDark}
              />
              <View style={{ width: 4 }} />
            </ScrollView>
          </Animated.View>
        )}

        {chartData.length > 0 && (
          <Animated.View
            style={{
              opacity: chartAnim,
              transform: [{ translateY: chartAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
              marginHorizontal: 16,
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingHorizontal: 2 }}>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 }}>
                  {trendInterval === "daily" ? "Daily Trend" : trendInterval === "weekly" ? "Weekly Trend" : t(language, "monthlyTrend")}
                </Text>
              </View>
              <View style={{ flexDirection: "row", backgroundColor: cardBg, borderColor: cardBorder, borderWidth: 1, borderRadius: 999, overflow: "hidden" }}>
                <TouchableOpacity onPress={() => setTrendInterval("daily")} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: trendInterval === "daily" ? palette.main : "transparent" }}>
                  <Text style={{ color: trendInterval === "daily" ? "#fff" : colors.textMuted, fontSize: 10, fontWeight: "800" }}>DAY</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTrendInterval("weekly")} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: trendInterval === "weekly" ? palette.main : "transparent" }}>
                  <Text style={{ color: trendInterval === "weekly" ? "#fff" : colors.textMuted, fontSize: 10, fontWeight: "800" }}>WEEK</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setTrendInterval("monthly")} style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: trendInterval === "monthly" ? palette.main : "transparent" }}>
                  <Text style={{ color: trendInterval === "monthly" ? "#fff" : colors.textMuted, fontSize: 10, fontWeight: "800" }}>MONTH</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 30,
                borderWidth: 1.25,
                borderColor: cardBorder,
                padding: 18,
                shadowColor: palette.main,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 18,
                elevation: 2,
              }}
            >
              <Text style={{ color: colors.text, fontSize: 13, fontWeight: "800", marginBottom: 10 }}>Bar Chart</Text>
              <AnimatedTrendChart data={chartData} maxVal={chartMaxVal} textMuted={colors.textMuted} />

              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 12, gap: 20 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: palette.soft, marginRight: 6 }} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}>{t(language, "income")}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: palette.deep, marginRight: 6 }} />
                  <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "600" }}>{t(language, "expense")}</Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: cardBorder, marginVertical: 14, opacity: 0.8 }} />

              <AnimatedLineTrendChart
                data={chartData}
                maxVal={chartMaxVal}
                text={colors.text}
                textMuted={colors.textMuted}
                cardBorder={cardBorder}
                incomeColor={palette.soft}
                expenseColor={palette.deep}
              />
            </View>
          </Animated.View>
        )}

        <Animated.View
          style={{
            opacity: listAnim,
            transform: [{ translateY: listAnim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
            marginHorizontal: 16,
            marginTop: 18,
          }}
        >
          <View style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ color: colors.textSecondary, fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 }}>
                  {t(language, "byCategory")}
                </Text>

              </View>
            </View>

            <View style={{ flexDirection: "row", backgroundColor: cardBg, borderRadius: 18, borderWidth: 1.25, borderColor: cardBorder, overflow: "hidden", padding: 3, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => setViewType(TransactionType.EXPENSE)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 11,
                  backgroundColor: viewType === TransactionType.EXPENSE ? palette.main : "transparent",
                  borderRadius: 12,
                  marginRight: 3,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: viewType === TransactionType.EXPENSE ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "800" }}>
                  {t(language, "expense")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewType(TransactionType.INCOME)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 11,
                  backgroundColor: viewType === TransactionType.INCOME ? palette.main : "transparent",
                  borderRadius: 12,
                  marginLeft: 3,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: viewType === TransactionType.INCOME ? "#fff" : colors.textMuted, fontSize: 13, fontWeight: "800" }}>
                  {t(language, "income")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {breakdown.length === 0 ? (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 24,
                borderWidth: 1.25,
                borderColor: cardBorder,
                padding: 40,
                alignItems: "center",
                shadowColor: palette.main,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.1,
                shadowRadius: 16,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 44, marginBottom: 10, color: colors.textMuted }}>◫</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 15, fontWeight: "800" }}>{t(language, "noData")}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 6, textAlign: "center" }}>
                {viewType === TransactionType.EXPENSE ? "Belum ada pengeluaran" : "Belum ada pemasukan"}
              </Text>
            </View>
          ) : (
            <View
              style={{
                backgroundColor: cardBg,
                borderRadius: 30,
                borderWidth: 1.5,
                borderColor: cardBorder,
                overflow: "hidden",
                shadowColor: palette.main,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 18,
                elevation: 3,
              }}
            >
              {breakdown.map((item, idx) => {
                const targetBar = (item.percentage / 100) * TRACK_WIDTH;
                return (
                  <View
                    key={item.category}
                    style={{
                      paddingHorizontal: 18,
                      paddingVertical: 16,
                      borderBottomWidth: idx < breakdown.length - 1 ? 1.25 : 0,
                      borderBottomColor: cardBorder,
                      backgroundColor: idx % 2 === 0 ? "transparent" : (isDark ? "#ffffff08" : palette.bgLight),
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                      <View
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 10,
                          backgroundColor: idx % 2 === 0 ? palette.bgLight : palette.bgLight,
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 16, color: idx % 2 === 0 ? palette.main : palette.deep, fontWeight: "700" }}>
                          {idx + 1}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: "800", fontSize: 14 }}>
                          {getCategoryInfo(item.category).isCustom ? item.label : t(language, item.label)}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 12, fontWeight: "500", marginTop: 2 }}>
                          {item.count} {t(language, "items")} • {item.percentage.toFixed(1)}%
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ color: idx % 2 === 0 ? palette.main : palette.deep, fontWeight: "900", fontSize: 15 }}>
                          {fmt(item.total)}
                        </Text>
                      </View>
                    </View>

                    <View style={{ width: TRACK_WIDTH, height: 8, backgroundColor: cardBorder, borderRadius: 4, overflow: "hidden", marginTop: 4 }}>
                      <Animated.View
                        style={{
                          width: listAnim.interpolate({ inputRange: [0, 1], outputRange: [0, targetBar] }),
                          height: "100%",
                          backgroundColor: idx % 2 === 0 ? palette.main : palette.deep,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};
