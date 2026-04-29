import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Switch, Alert, Platform } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useSettings } from "../context/SettingsContext";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIF_KEY = "@daily_money_notifications";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

interface NotifSettings {
  dailyReminder: boolean;
  dailyReminderHour: number;
  dailyReminderMinute: number;
  weeklyReport: boolean;
  weeklyReportDay: number; // 0=Sun, 1=Mon...
}

const DEFAULT_SETTINGS: NotifSettings = {
  dailyReminder: false,
  dailyReminderHour: 20,
  dailyReminderMinute: 0,
  weeklyReport: false,
  weeklyReportDay: 0,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationScreen: React.FC<Props> = () => {
  const { colors, language, palette, theme } = useSettings();
  const isDark = theme === "dark";
  const panelBg = isDark ? "#0f172a" : "#ffffff";
  const panelBorder = isDark ? "#1f2937" : "#f1f5f9";

  const [settings, setSettings] = useState<NotifSettings>(DEFAULT_SETTINGS);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(NOTIF_KEY);
      if (stored) setSettings(JSON.parse(stored));

      const { status } = await Notifications.getPermissionsAsync();
      setPermissionGranted(status === "granted");
    })();
  }, []);

  const requestPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionGranted(status === "granted");
    if (status !== "granted") {
      Alert.alert(
        language === "id" ? "Izin Diperlukan" : "Permission Required",
        language === "id"
          ? "Aktifkan notifikasi di pengaturan HP untuk menerima pengingat."
          : "Enable notifications in your device settings to receive reminders."
      );
    }
    return status === "granted";
  }, [language]);

  const saveAndSchedule = useCallback(async (newSettings: NotifSettings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem(NOTIF_KEY, JSON.stringify(newSettings));

    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Schedule daily reminder
    if (newSettings.dailyReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: language === "id" ? "💰 Jangan Lupa Catat!" : "💰 Don't Forget to Record!",
          body: language === "id"
            ? "Sudahkah Anda mencatat pengeluaran hari ini?"
            : "Have you recorded today's expenses?",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: newSettings.dailyReminderHour,
          minute: newSettings.dailyReminderMinute,
        },
      });
    }

    // Schedule weekly report reminder
    if (newSettings.weeklyReport) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: language === "id" ? "📊 Laporan Mingguan" : "📊 Weekly Report",
          body: language === "id"
            ? "Cek statistik keuangan Anda minggu ini!"
            : "Check your financial statistics this week!",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: newSettings.weeklyReportDay + 1, // expo uses 1-7 (Sun=1)
          hour: 9,
          minute: 0,
        },
      });
    }
  }, [language]);

  const toggleDailyReminder = useCallback(async (value: boolean) => {
    if (value && !permissionGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    const updated = { ...settings, dailyReminder: value };
    await saveAndSchedule(updated);
  }, [settings, permissionGranted, requestPermission, saveAndSchedule]);

  const toggleWeeklyReport = useCallback(async (value: boolean) => {
    if (value && !permissionGranted) {
      const granted = await requestPermission();
      if (!granted) return;
    }
    const updated = { ...settings, weeklyReport: value };
    await saveAndSchedule(updated);
  }, [settings, permissionGranted, requestPermission, saveAndSchedule]);

  const changeHour = useCallback(async (delta: number) => {
    const newHour = (settings.dailyReminderHour + delta + 24) % 24;
    const updated = { ...settings, dailyReminderHour: newHour };
    await saveAndSchedule(updated);
  }, [settings, saveAndSchedule]);

  const changeMinute = useCallback(async (delta: number) => {
    const newMin = (settings.dailyReminderMinute + delta + 60) % 60;
    const updated = { ...settings, dailyReminderMinute: newMin };
    await saveAndSchedule(updated);
  }, [settings, saveAndSchedule]);

  const changeWeekDay = useCallback(async (day: number) => {
    const updated = { ...settings, weeklyReportDay: day };
    await saveAndSchedule(updated);
  }, [settings, saveAndSchedule]);

  const dayNames = language === "id"
    ? ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const formatTime = (h: number, m: number) =>
    `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}>
        {/* Permission Status */}
        {!permissionGranted && (
          <TouchableOpacity
            onPress={requestPermission}
            className="mx-4 mb-4 p-4 rounded-2xl flex-row items-center"
            style={{ backgroundColor: "#fef3c7", borderColor: "#fcd34d", borderWidth: 1 }}
          >
            <Text className="text-lg mr-3">⚠️</Text>
            <View className="flex-1">
              <Text style={{ color: "#92400e" }} className="text-sm font-bold">
                {language === "id" ? "Izin Notifikasi Belum Aktif" : "Notification Permission Required"}
              </Text>
              <Text style={{ color: "#a16207" }} className="text-xs mt-0.5">
                {language === "id" ? "Ketuk untuk mengaktifkan" : "Tap to enable"}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Daily Reminder */}
        <View className="mx-4 mb-6">
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest mb-3">
            {language === "id" ? "Pengingat Harian" : "Daily Reminder"}
          </Text>
          <View
            style={{
              backgroundColor: panelBg,
              borderColor: panelBorder,
              borderWidth: 1,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <View className="flex-row items-center px-4 py-4" style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}>
              <Text className="text-lg mr-3">🔔</Text>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-[15px] font-semibold">
                  {language === "id" ? "Pengingat Pencatatan" : "Recording Reminder"}
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-xs mt-0.5">
                  {language === "id" ? "Ingatkan catat pengeluaran harian" : "Remind to record daily expenses"}
                </Text>
              </View>
              <Switch
                value={settings.dailyReminder}
                onValueChange={toggleDailyReminder}
                trackColor={{ false: isDark ? "#1f2937" : "#e2e8f0", true: palette.main }}
                thumbColor="#fff"
              />
            </View>

            {settings.dailyReminder && (
              <View className="px-4 py-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-3">
                  {language === "id" ? "Waktu Pengingat" : "Reminder Time"}
                </Text>
                <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
                  {/* Hour */}
                  <View className="items-center">
                    <TouchableOpacity onPress={() => changeHour(1)} className="p-2">
                      <Text style={{ color: palette.main }} className="text-lg font-bold">▲</Text>
                    </TouchableOpacity>
                    <View
                      className="px-5 py-3 rounded-2xl"
                      style={{ backgroundColor: isDark ? "#111827" : "#f8fafc", borderColor: colors.border, borderWidth: 1 }}
                    >
                      <Text style={{ color: colors.text }} className="text-2xl font-black">
                        {settings.dailyReminderHour.toString().padStart(2, "0")}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => changeHour(-1)} className="p-2">
                      <Text style={{ color: palette.main }} className="text-lg font-bold">▼</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: colors.text }} className="text-3xl font-black">:</Text>

                  {/* Minute */}
                  <View className="items-center">
                    <TouchableOpacity onPress={() => changeMinute(5)} className="p-2">
                      <Text style={{ color: palette.main }} className="text-lg font-bold">▲</Text>
                    </TouchableOpacity>
                    <View
                      className="px-5 py-3 rounded-2xl"
                      style={{ backgroundColor: isDark ? "#111827" : "#f8fafc", borderColor: colors.border, borderWidth: 1 }}
                    >
                      <Text style={{ color: colors.text }} className="text-2xl font-black">
                        {settings.dailyReminderMinute.toString().padStart(2, "0")}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => changeMinute(-5)} className="p-2">
                      <Text style={{ color: palette.main }} className="text-lg font-bold">▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={{ color: colors.textMuted }} className="text-center text-xs mt-2">
                  {language === "id"
                    ? `Notifikasi setiap hari pukul ${formatTime(settings.dailyReminderHour, settings.dailyReminderMinute)}`
                    : `Notification every day at ${formatTime(settings.dailyReminderHour, settings.dailyReminderMinute)}`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Weekly Report */}
        <View className="mx-4 mb-6">
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest mb-3">
            {language === "id" ? "Laporan Mingguan" : "Weekly Report"}
          </Text>
          <View
            style={{
              backgroundColor: panelBg,
              borderColor: panelBorder,
              borderWidth: 1,
              borderRadius: 24,
              overflow: "hidden",
            }}
          >
            <View className="flex-row items-center px-4 py-4" style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}>
              <Text className="text-lg mr-3">📊</Text>
              <View className="flex-1">
                <Text style={{ color: colors.text }} className="text-[15px] font-semibold">
                  {language === "id" ? "Laporan Mingguan" : "Weekly Summary"}
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-xs mt-0.5">
                  {language === "id" ? "Pengingat cek statistik mingguan" : "Remind to check weekly statistics"}
                </Text>
              </View>
              <Switch
                value={settings.weeklyReport}
                onValueChange={toggleWeeklyReport}
                trackColor={{ false: isDark ? "#1f2937" : "#e2e8f0", true: palette.main }}
                thumbColor="#fff"
              />
            </View>

            {settings.weeklyReport && (
              <View className="px-4 py-4">
                <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-3">
                  {language === "id" ? "Hari Pengingat" : "Reminder Day"}
                </Text>
                <View className="flex-row justify-between">
                  {dayNames.map((name, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => changeWeekDay(idx)}
                      className="items-center justify-center rounded-xl"
                      style={{
                        width: 42,
                        height: 42,
                        backgroundColor: settings.weeklyReportDay === idx ? palette.main : (isDark ? "#111827" : "#f8fafc"),
                        borderColor: settings.weeklyReportDay === idx ? palette.main : colors.border,
                        borderWidth: 1,
                      }}
                    >
                      <Text
                        style={{
                          color: settings.weeklyReportDay === idx ? "#fff" : colors.text,
                          fontWeight: "800",
                          fontSize: 11,
                        }}
                      >
                        {name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={{ color: colors.textMuted }} className="text-center text-xs mt-3">
                  {language === "id"
                    ? `Notifikasi setiap ${dayNames[settings.weeklyReportDay]} pukul 09:00`
                    : `Notification every ${dayNames[settings.weeklyReportDay]} at 09:00 AM`}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
