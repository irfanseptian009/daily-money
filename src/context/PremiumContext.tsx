import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREMIUM_KEY = "@daily_money_premium";

interface PremiumContextType {
  isPremium: boolean;
  activatePremium: () => Promise<void>;
  deactivatePremium: () => Promise<void>; // for testing/dev
  isLoadingPremium: boolean;
}

const PremiumContext = createContext<PremiumContextType>({
  isPremium: false,
  activatePremium: async () => {},
  deactivatePremium: async () => {},
  isLoadingPremium: true,
});

export const PremiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoadingPremium, setIsLoadingPremium] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(PREMIUM_KEY);
        if (stored === "true") setIsPremium(true);
      } catch (e) {
        console.error("Failed to load premium state:", e);
      } finally {
        setIsLoadingPremium(false);
      }
    })();
  }, []);

  const activatePremium = useCallback(async () => {
    try {
      await AsyncStorage.setItem(PREMIUM_KEY, "true");
      setIsPremium(true);
    } catch (e) {
      console.error("Failed to activate premium:", e);
    }
  }, []);

  const deactivatePremium = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(PREMIUM_KEY);
      setIsPremium(false);
    } catch (e) {
      console.error("Failed to deactivate premium:", e);
    }
  }, []);

  return (
    <PremiumContext.Provider value={{ isPremium, activatePremium, deactivatePremium, isLoadingPremium }}>
      {children}
    </PremiumContext.Provider>
  );
};

export const usePremium = () => useContext(PremiumContext);
