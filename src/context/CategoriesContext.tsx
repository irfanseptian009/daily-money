import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CategoryId, CategoryInfo, TransactionType } from "../types";

export const DEFAULT_CATEGORIES: CategoryInfo[] = [
  // Expense
  { id: "food", label: "food", emoji: "🍔", type: TransactionType.EXPENSE, isCustom: false },
  { id: "transport", label: "transport", emoji: "🚗", type: TransactionType.EXPENSE, isCustom: false },
  { id: "shopping", label: "shopping", emoji: "🛍️", type: TransactionType.EXPENSE, isCustom: false },
  { id: "bills", label: "bills", emoji: "📄", type: TransactionType.EXPENSE, isCustom: false },
  { id: "entertainment", label: "entertainment", emoji: "🎬", type: TransactionType.EXPENSE, isCustom: false },
  { id: "health", label: "health", emoji: "💊", type: TransactionType.EXPENSE, isCustom: false },
  { id: "education", label: "education", emoji: "📚", type: TransactionType.EXPENSE, isCustom: false },
  { id: "other_expense", label: "otherExpense", emoji: "📦", type: TransactionType.EXPENSE, isCustom: false },
  // Income
  { id: "salary", label: "salary", emoji: "💼", type: TransactionType.INCOME, isCustom: false },
  { id: "freelance", label: "freelance", emoji: "💻", type: TransactionType.INCOME, isCustom: false },
  { id: "investment", label: "investment", emoji: "📈", type: TransactionType.INCOME, isCustom: false },
  { id: "gift", label: "gift", emoji: "🎁", type: TransactionType.INCOME, isCustom: false },
  { id: "other_income", label: "otherIncome", emoji: "💵", type: TransactionType.INCOME, isCustom: false },
];

const CATEGORIES_STORAGE_KEY = "@daily_money_custom_categories";

interface CategoriesContextType {
  categories: CategoryInfo[];
  addCategory: (category: Omit<CategoryInfo, "id" | "isCustom">) => Promise<void>;
  deleteCategory: (id: CategoryId) => Promise<void>;
  getCategoryInfo: (id: CategoryId) => CategoryInfo;
  getCategoriesByType: (type: TransactionType) => CategoryInfo[];
}

const CategoriesContext = createContext<CategoriesContextType>({
  categories: DEFAULT_CATEGORIES,
  addCategory: async () => {},
  deleteCategory: async () => {},
  getCategoryInfo: () => DEFAULT_CATEGORIES[7], // other_expense
  getCategoriesByType: () => [],
});

export const CategoriesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customCategories, setCustomCategories] = useState<CategoryInfo[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
        if (stored) {
          setCustomCategories(JSON.parse(stored));
        }
      } catch (err) {
        console.error("Failed to load custom categories:", err);
      }
    })();
  }, []);

  const saveCustomCategories = async (updatedCategories: CategoryInfo[]) => {
    try {
      await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(updatedCategories));
      setCustomCategories(updatedCategories);
    } catch (err) {
      console.error("Failed to save custom categories:", err);
      throw err;
    }
  };

  const addCategory = useCallback(async (category: Omit<CategoryInfo, "id" | "isCustom">) => {
    const newCategory: CategoryInfo = {
      ...category,
      id: `custom_${Date.now()}_${Math.random().toString(36).substring(2,7)}`,
      isCustom: true,
    };
    await saveCustomCategories([...customCategories, newCategory]);
  }, [customCategories]);

  const deleteCategory = useCallback(async (id: CategoryId) => {
    const updated = customCategories.filter(c => c.id !== id);
    await saveCustomCategories(updated);
  }, [customCategories]);

  const allCategories = useMemo(() => {
    return [...DEFAULT_CATEGORIES, ...customCategories];
  }, [customCategories]);

  const getCategoryInfo = useCallback((id: CategoryId): CategoryInfo => {
    return allCategories.find((c) => c.id === id) || 
      (id.includes("income") ? DEFAULT_CATEGORIES.find(c => c.id === "other_income")! : DEFAULT_CATEGORIES.find(c => c.id === "other_expense")!);
  }, [allCategories]);

  const getCategoriesByType = useCallback((type: TransactionType): CategoryInfo[] => {
    return allCategories.filter((c) => c.type === type);
  }, [allCategories]);

  return (
    <CategoriesContext.Provider
      value={{
        categories: allCategories,
        addCategory,
        deleteCategory,
        getCategoryInfo,
        getCategoriesByType,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => useContext(CategoriesContext);
