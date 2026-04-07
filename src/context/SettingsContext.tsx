import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Language } from "../config/translations";

export type ThemeMode = "dark" | "light";

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
    bg: "#020617",
    bgSecondary: "#0f172a",
    bgCard: "#1e293b",
    border: "#334155",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    textMuted: "#475569",
    statusBar: "light-content",
  },
  light: {
    bg: "#f8fafc",
    bgSecondary: "#ffffff",
    bgCard: "#ffffff",
    border: "#e2e8f0",
    text: "#0f172a",
    textSecondary: "#64748b",
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
}

const SettingsContext = createContext<SettingsContextType>({
  currency: "IDR",
  setCurrency: () => {},
  language: "id",
  setLanguage: () => {},
  theme: "dark",
  setTheme: () => {},
  colors: themes.dark,
});

const SETTINGS_KEY = "@daily_money_settings";

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState("IDR");
  const [language, setLanguageState] = useState<Language>("id");
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.currency) setCurrencyState(parsed.currency);
          if (parsed.language) setLanguageState(parsed.language);
          if (parsed.theme) setThemeState(parsed.theme);
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    })();
  }, []);

  const saveSettings = useCallback(async (newSettings: Partial<{ currency: string; language: Language; theme: ThemeMode }>) => {
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

  return (
    <SettingsContext.Provider
      value={{
        currency,
        setCurrency,
        language,
        setLanguage,
        theme,
        setTheme,
        colors: themes[theme],
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
