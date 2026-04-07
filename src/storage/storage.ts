import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction } from "../types";

const STORAGE_KEY = "@daily_money_transactions";

export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data) as Transaction[];
    }
    return [];
  } catch (error) {
    console.error("Error loading transactions:", error);
    return [];
  }
};

export const saveTransactions = async (
  transactions: Transaction[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Error saving transactions:", error);
  }
};

export const addTransaction = async (
  transaction: Transaction
): Promise<Transaction[]> => {
  const transactions = await getTransactions();
  const updated = [transaction, ...transactions];
  await saveTransactions(updated);
  return updated;
};

export const deleteTransaction = async (
  id: string
): Promise<Transaction[]> => {
  const transactions = await getTransactions();
  const updated = transactions.filter((t) => t.id !== id);
  await saveTransactions(updated);
  return updated;
};

export const updateTransaction = async (
  id: string,
  updatedData: Partial<Omit<Transaction, "id">>
): Promise<Transaction[]> => {
  const transactions = await getTransactions();
  const updated = transactions.map((t) =>
    t.id === id ? { ...t, ...updatedData } : t
  );
  await saveTransactions(updated);
  return updated;
};
