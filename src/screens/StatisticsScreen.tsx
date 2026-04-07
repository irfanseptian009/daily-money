import React, { useCallback, useMemo, useState, useRef } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  Share, Alert, Dimensions, Animated,
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

interface CategoryBreakdown {
  category: CategoryId;
  emoji: string;
  label: string;
  total: number;
  count: number;
  percentage: number;
}

// ─── Mini bar chart using plain Views ────────────────────────────────────────
const BarChart: React.FC<{
  data: { label: string; income: number; expense: number }[];
  maxVal: number;
  colors: any;
  fmt: (n: number) => string;
}> = ({ data, maxVal, colors, fmt }) => {
  const BAR_HEIGHT = 120;
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: BAR_HEIGHT + 40 }}>
      {data.map((d, i) => {
        const incomeH = maxVal > 0 ? (d.income / maxVal) * BAR_HEIGHT : 0;
        const expenseH = maxVal > 0 ? (d.expense / maxVal) * BAR_HEIGHT : 0;
        return (
          <View key={i} style={{ flex: 1, alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end", height: BAR_HEIGHT }}>
              <View
                style={{
                  width: 8,
                  height: Math.max(incomeH, 2),
                  backgroundColor: "#10b981",
                  borderRadius: 4,
                  marginRight: 2,
                }}
              />
              <View
                style={{
                  width: 8,
                  height: Math.max(expenseH, 2),
                  backgroundColor: "#ef4444",
                  borderRadius: 4,
                }}
              />
            </View>
            <Text
              style={{ color: colors.textMuted, fontSize: 9, marginTop: 4, textAlign: "center" }}
              numberOfLines={1}
            >
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

// ─── Donut/Pie ring using stacked Views ──────────────────────────────────────
const DonutRing: React.FC<{
  items: { percentage: number; color: string }[];
  size?: number;
  label: string;
  value: string;
  valueColor: string;
}> = ({ items, size = 100, label, value, valueColor }) => {
  const DONUT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];
  return (
    <View style={{ alignItems: "center" }}>
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", position: "relative" }}>
        {items.length === 0 ? (
          <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#334155" }} />
        ) : (
          items.map((item, idx) => {
            const color = DONUT_COLORS[idx % DONUT_COLORS.length];
            return (
              <View
                key={idx}
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  borderRadius: size / 2,
                  backgroundColor: color,
                  opacity: 0.85,
                }}
              />
            );
          })
        )}
        {/* Inner circle to create donut effect */}
        <View
          style={{
            position: "absolute",
            top: size * 0.22,
            left: size * 0.22,
            width: size * 0.56,
            height: size * 0.56,
            borderRadius: size * 0.28,
            backgroundColor: "#0f172a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: valueColor, fontWeight: "800", fontSize: size * 0.16 }} numberOfLines={1}>
            {value}
          </Text>
        </View>
      </View>
      <Text style={{ color: "#94a3b8", fontSize: 11, marginTop: 4 }}>{label}</Text>
    </View>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard: React.FC<{
  label: string;
  value: string;
  emoji: string;
  valueColor?: string;
  colors: any;
}> = ({ label, value, emoji, valueColor, colors }) => (
  <View
    style={{
      flex: 1,
      margin: 4,
      padding: 14,
      borderRadius: 14,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
    }}
  >
    <Text style={{ fontSize: 20, marginBottom: 6 }}>{emoji}</Text>
    <Text style={{ color: colors.textMuted, fontSize: 11, marginBottom: 2 }}>{label}</Text>
    <Text
      style={{ color: valueColor || colors.text, fontWeight: "800", fontSize: 15 }}
      numberOfLines={1}
      adjustsFontSizeToFit
    >
      {value}
    </Text>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
export const StatisticsScreen: React.FC<Props> = ({ navigation }) => {
  const { transactions, totalIncome, totalExpense, refresh } = useTransactions();
  const { colors, language, currency } = useSettings();
  const { getCategoryInfo } = useCategories();
  const [viewType, setViewType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [exporting, setExporting] = useState(false);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const fmt = useCallback((amount: number) => formatCurrency(amount, currency), [currency]);

  const balance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  const breakdown = useMemo((): CategoryBreakdown[] => {
    const filtered = transactions.filter((tx) => tx.type === viewType);
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
        category: k, emoji: info.emoji, label: info.label,
        total: v.total, count: v.count,
        percentage: total > 0 ? (v.total / total) * 100 : 0,
      });
    });
    return result.sort((a, b) => b.total - a.total);
  }, [transactions, viewType, getCategoryInfo]);

  // Last 6 months for bar chart
  const monthlyData = useMemo(() => {
    const months = new Map<string, { income: number; expense: number }>();
    transactions.forEach((tx) => {
      const mk = tx.date.substring(0, 7);
      const e = months.get(mk) || { income: 0, expense: 0 };
      if (tx.type === TransactionType.INCOME) e.income += tx.amount; else e.expense += tx.amount;
      months.set(mk, e);
    });
    return Array.from(months.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 6)
      .reverse();
  }, [transactions]);

  const chartData = useMemo(() =>
    monthlyData.map(([month, d]) => {
      const [y, m] = month.split("-");
      const label = new Date(parseInt(y), parseInt(m) - 1).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      return { label, income: d.income, expense: d.expense };
    }),
    [monthlyData]
  );

  const chartMaxVal = useMemo(() =>
    Math.max(...chartData.map((d) => Math.max(d.income, d.expense)), 1),
    [chartData]
  );

  const DONUT_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];

  const expenses = useMemo(() => transactions.filter((tx) => tx.type === TransactionType.EXPENSE), [transactions]);
  const incomes = useMemo(() => transactions.filter((tx) => tx.type === TransactionType.INCOME), [transactions]);
  const avgExpense = expenses.length > 0 ? expenses.reduce((s, tx) => s + tx.amount, 0) / expenses.length : 0;
  const largestExpense = expenses.length > 0 ? Math.max(...expenses.map((tx) => tx.amount)) : 0;

  // ── CSV Export ────────────────────────────────────────────────────────────
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

      await Share.share({
        message: csvContent,
        title,
      });
    } catch (e) {
      console.error("Export error:", e);
      Alert.alert("Export Error", "Could not export data. Please try again.");
    } finally {
      setExporting(false);
    }
  }, [transactions, language, getCategoryInfo, currency, totalIncome, totalExpense, balance]);

  // ── Render ────────────────────────────────────────────────────────────────
  const hasData = transactions.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header summary ── */}
        <View
          style={{
            margin: 16,
            borderRadius: 20,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.bgCard,
          }}
        >
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 16,
              alignItems: "center",
            }}
          >
            <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              {t(language, "overview")}
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "900",
                color: balance >= 0 ? "#10b981" : "#ef4444",
                letterSpacing: -1,
              }}
            >
              {fmt(balance)}
            </Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 2 }}>
              {t(language, "currentBalance")}
            </Text>
          </View>

          <View style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: colors.border }}>
            <View style={{ flex: 1, alignItems: "center", paddingVertical: 14, borderRightWidth: 1, borderRightColor: colors.border }}>
              <Text style={{ color: "#10b981", fontWeight: "800", fontSize: 16 }}>▲ {fmt(totalIncome)}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{t(language, "income")}</Text>
            </View>
            <View style={{ flex: 1, alignItems: "center", paddingVertical: 14 }}>
              <Text style={{ color: "#ef4444", fontWeight: "800", fontSize: 16 }}>▼ {fmt(totalExpense)}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, marginTop: 2 }}>{t(language, "expense")}</Text>
            </View>
          </View>
        </View>

        {/* ── 4 stat cards ── */}
        {hasData && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: 12, marginBottom: 4 }}>
            <StatCard
              label={t(language, "savingsRate")}
              value={`${savingsRate.toFixed(1)}%`}
              emoji="📈"
              valueColor={savingsRate >= 0 ? "#10b981" : "#ef4444"}
              colors={colors}
            />
            <StatCard
              label={t(language, "transactions")}
              value={String(transactions.length)}
              emoji="📋"
              valueColor="#6366f1"
              colors={colors}
            />
            <StatCard
              label={t(language, "avgExpense")}
              value={fmt(avgExpense)}
              emoji="💸"
              valueColor="#f59e0b"
              colors={colors}
            />
            <StatCard
              label={t(language, "largestExpense")}
              value={fmt(largestExpense)}
              emoji="🔴"
              valueColor="#ef4444"
              colors={colors}
            />
          </View>
        )}

        {/* ── Monthly Bar Chart ── */}
        {chartData.length > 0 && (
          <View style={{ marginHorizontal: 16, marginTop: 12, marginBottom: 4 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              {t(language, "monthlyTrend")}
            </Text>
            <View
              style={{
                backgroundColor: colors.bgCard,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 16,
              }}
            >
              <BarChart data={chartData} maxVal={chartMaxVal} colors={colors} fmt={fmt} />

              {/* Chart legend */}
              <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 8, gap: 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#10b981", marginRight: 5 }} />
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t(language, "income")}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444", marginRight: 5 }} />
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{t(language, "expense")}</Text>
                </View>
              </View>

              {/* Month detail rows */}
              <View style={{ marginTop: 12 }}>
                {chartData.slice().reverse().map((d, i) => {
                  const domainMax = Math.max(d.income, d.expense, 1);
                  return (
                    <View key={i} style={{ marginBottom: i < chartData.length - 1 ? 10 : 0 }}>
                      <Text style={{ color: colors.text, fontSize: 12, fontWeight: "600", marginBottom: 4 }}>{d.label}</Text>
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
                        <Text style={{ color: colors.textMuted, fontSize: 10, width: 48 }}>{t(language, "income")}</Text>
                        <View style={{ flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, marginRight: 8, overflow: "hidden" }}>
                          <View style={{ width: `${(d.income / chartMaxVal) * 100}%`, height: "100%", backgroundColor: "#10b981", borderRadius: 3 }} />
                        </View>
                        <Text style={{ color: "#10b981", fontSize: 10, fontWeight: "700", minWidth: 60, textAlign: "right" }} numberOfLines={1}>{fmt(d.income)}</Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ color: colors.textMuted, fontSize: 10, width: 48 }}>{t(language, "expense")}</Text>
                        <View style={{ flex: 1, height: 6, backgroundColor: colors.border, borderRadius: 3, marginRight: 8, overflow: "hidden" }}>
                          <View style={{ width: `${(d.expense / chartMaxVal) * 100}%`, height: "100%", backgroundColor: "#ef4444", borderRadius: 3 }} />
                        </View>
                        <Text style={{ color: "#ef4444", fontSize: 10, fontWeight: "700", minWidth: 60, textAlign: "right" }} numberOfLines={1}>{fmt(d.expense)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* ── Category Breakdown ── */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1 }}>
              {t(language, "byCategory")}
            </Text>
            {/* Toggle */}
            <View style={{ flexDirection: "row", backgroundColor: colors.bgCard, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
              <TouchableOpacity
                onPress={() => setViewType(TransactionType.EXPENSE)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  backgroundColor: viewType === TransactionType.EXPENSE ? "#ef4444" : "transparent",
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: viewType === TransactionType.EXPENSE ? "#fff" : colors.textMuted, fontSize: 12, fontWeight: "700" }}>
                  {t(language, "expense")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setViewType(TransactionType.INCOME)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  backgroundColor: viewType === TransactionType.INCOME ? "#10b981" : "transparent",
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: viewType === TransactionType.INCOME ? "#fff" : colors.textMuted, fontSize: 12, fontWeight: "700" }}>
                  {t(language, "income")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {breakdown.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.bgCard,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                padding: 32,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 32, marginBottom: 8 }}>📊</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 14, fontWeight: "600" }}>{t(language, "noData")}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4, textAlign: "center" }}>
                {viewType === TransactionType.EXPENSE ? "Belum ada pengeluaran" : "Belum ada pemasukan"}
              </Text>
            </View>
          ) : (
            <View style={{ backgroundColor: colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: colors.border, overflow: "hidden" }}>
              {breakdown.map((item, idx) => {
                const accentColor = viewType === TransactionType.INCOME ? "#10b981" : "#ef4444";
                const barColor = DONUT_COLORS[idx % DONUT_COLORS.length];
                return (
                  <View
                    key={item.category}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      borderBottomWidth: idx < breakdown.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                      {/* Rank */}
                      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: "700", width: 18 }}>#{idx + 1}</Text>
                      {/* Emoji */}
                      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: barColor + "22", alignItems: "center", justifyContent: "center", marginRight: 10 }}>
                        <Text style={{ fontSize: 16 }}>{item.emoji}</Text>
                      </View>
                      {/* Label + Count */}
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 13 }}>
                          {getCategoryInfo(item.category).isCustom ? item.label : t(language, item.label)}
                        </Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
                          {item.count} {t(language, "items")}
                        </Text>
                      </View>
                      {/* Amount + % */}
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ color: accentColor, fontWeight: "800", fontSize: 14 }}>{fmt(item.total)}</Text>
                        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{item.percentage.toFixed(1)}%</Text>
                      </View>
                    </View>
                    {/* Progress bar */}
                    <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
                      <View style={{ width: `${item.percentage}%`, height: "100%", backgroundColor: barColor, borderRadius: 3 }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Export Button ── */}
        <View style={{ marginHorizontal: 16, marginTop: 20, marginBottom: 8 }}>
          <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
            Export Data
          </Text>
          <TouchableOpacity
            onPress={exporting ? undefined : handleExport}
            activeOpacity={0.8}
            style={{
              borderRadius: 16,
              overflow: "hidden",
              opacity: exporting ? 0.7 : 1,
            }}
          >
            <View
              style={{
                backgroundColor: "#6366f1",
                paddingVertical: 16,
                paddingHorizontal: 20,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
              }}
            >
              <Text style={{ fontSize: 20, marginRight: 10 }}>{exporting ? "⏳" : "📤"}</Text>
              <View>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                  {exporting ? "Menyiapkan..." : t(language, "exportCSV")}
                </Text>
                <Text style={{ color: "#c7d2fe", fontSize: 11, marginTop: 1 }}>
                  {transactions.length} transaksi • {currency}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Export summary */}
          {hasData && (
            <View
              style={{
                marginTop: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.bgCard,
                padding: 14,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                Preview Data
              </Text>
              {[
                { label: "Total Transaksi", value: `${transactions.length} baris`, color: colors.text },
                { label: t(language, "income"), value: fmt(totalIncome), color: "#10b981" },
                { label: t(language, "expense"), value: fmt(totalExpense), color: "#ef4444" },
                { label: "Net Balance", value: fmt(balance), color: balance >= 0 ? "#10b981" : "#ef4444" },
                { label: "Format", value: "CSV (Excel-ready)", color: "#6366f1" },
              ].map((row, i) => (
                <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: i < 4 ? 6 : 0 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 12 }}>{row.label}</Text>
                  <Text style={{ color: row.color, fontSize: 12, fontWeight: "700" }}>{row.value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
