import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "../config/translations";

export type ThemeMode = "dark" | "light";
export type PrimaryColor = "orange" | "blue" | "green" | "purple" | "rose" | "yellow";

export interface Palette {
  main: string;
  deep: string;
  soft: string;
  text: string;
  bgLight: string;
  appBgLight: string;
  appBgDark: string;
}

export const primaryPalettes: Record<PrimaryColor, Palette> = {
  orange: { main: "#fb923c", deep: "#ea580c", soft: "#fdba74", text: "#ea580c", bgLight: "#fb923c15", appBgLight: "#fff7ed", appBgDark: "#22130e" },
  blue: { main: "#3b82f6", deep: "#2563eb", soft: "#93c5fd", text: "#2563eb", bgLight: "#3b82f615", appBgLight: "#eff6ff", appBgDark: "#0d1421" },
  green: { main: "#10b981", deep: "#059669", soft: "#6ee7b7", text: "#059669", bgLight: "#10b98115", appBgLight: "#ecfdf5", appBgDark: "#0d1a15" },
  purple: { main: "#8b5cf6", deep: "#7c3aed", soft: "#c4b5fd", text: "#7c3aed", bgLight: "#8b5cf615", appBgLight: "#f5f3ff", appBgDark: "#150d22" },
  rose: { main: "#f43f5e", deep: "#e11d48", soft: "#fda4af", text: "#e11d48", bgLight: "#f43f5e15", appBgLight: "#fff1f2", appBgDark: "#220d13" },
  yellow: { main: "#eab308", deep: "#ca8a04", soft: "#fde047", text: "#ca8a04", bgLight: "#eab30815", appBgLight: "#fefce8", appBgDark: "#1f1b0d" },
};

interface ThemeColors {
  bg: string;
  bgSecondary: string;
  bgCard: string;
  border: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  statusBar: "light-content" | "dark-content";
}

export const themes: Record<ThemeMode, ThemeColors> = {
  dark: {
    bg: "#030712",
    bgSecondary: "#111827",
    bgCard: "#1f2937",
    border: "#374151",
    text: "#f9fafb",
    textSecondary: "#9ca3af",
    textMuted: "#6b7280",
    statusBar: "light-content",
  },
  light: {
    bg: "#f8fafc",
    bgSecondary: "#ffffff",
    bgCard: "#ffffff",
    border: "#e2e8f0",
    text: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    statusBar: "dark-content",
  },
};

interface SettingsContextType {
  currency: string;
  setCurrency: (c: string) => void;
  language: Language;
  setLanguage: (l: Language) => void;
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
  colors: ThemeColors;
  primaryColor: PrimaryColor;
  setPrimaryColor: (c: PrimaryColor) => void;
  palette: Palette;
}

const SettingsContext = createContext<SettingsContextType>({
  currency: "IDR",
  setCurrency: () => {},
  language: "id",
  setLanguage: () => {},
  theme: "dark",
  setTheme: () => {},
  colors: themes.dark,
  primaryColor: "orange",
  setPrimaryColor: () => {},
  palette: primaryPalettes.orange,
});

const SETTINGS_KEY = "@daily_money_settings_v2";

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState("IDR");
  const [language, setLanguageState] = useState<Language>("id");
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>("orange");

  useEffect(() => {
    (async () => {
      try {
        // Migrate from old key if exists
        const oldStored = await AsyncStorage.getItem("@daily_money_settings");
        if (oldStored && !(await AsyncStorage.getItem(SETTINGS_KEY))) {
           await AsyncStorage.setItem(SETTINGS_KEY, oldStored);
        }

        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.currency) setCurrencyState(parsed.currency);
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.theme) setThemeState(parsed.theme);
          if (parsed.primaryColor) setPrimaryColorState(parsed.primaryColor);
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    })();
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<{ currency: string; language: Language; theme: ThemeMode; primaryColor: PrimaryColor }>) => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      const current = stored ? JSON.parse(stored) : {};
      const updated = { ...current, ...newSettings };
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, []);

  const setCurrency = useCallback((c: string) => {
    setCurrencyState(c);
    saveSettings({ currency: c });
  }, [saveSettings]);

  const setLanguage = useCallback((l: Language) => {
    setLanguageState(l);
    saveSettings({ language: l });
  }, [saveSettings]);

  const setTheme = useCallback((t: ThemeMode) => {
    setThemeState(t);
    saveSettings({ theme: t });
  }, [saveSettings]);

  const setPrimaryColor = useCallback((c: PrimaryColor) => {
    setPrimaryColorState(c);
    saveSettings({ primaryColor: c });
  }, [saveSettings]);

  const currentPalette = primaryPalettes[primaryColor];
  const dynamicColors: ThemeColors = {
    ...themes[theme],
    bg: theme === "dark" ? currentPalette.appBgDark : currentPalette.appBgLight,
  };

  return (
    <SettingsContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        theme,
        setTheme,
        colors: dynamicColors,
        primaryColor,
        setPrimaryColor,
        palette: currentPalette,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
