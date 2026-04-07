import { useState, useEffect, useCallback, useMemo } from "react";
import { Transaction, TransactionType } from "../types";
import {
  getTransactions,
  addTransaction as addTx,
  deleteTransaction as deleteTx,
  updateTransaction as updateTx,
} from "../storage/storage";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTransactions();
      // Sort by date descending
      const sorted = data.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sorted);
    } catch (error) {
      console.error("Error loading transactions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    const updated = await addTx(transaction);
    const sorted = updated.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTransactions(sorted);
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    const updated = await deleteTx(id);
    const sorted = updated.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTransactions(sorted);
  }, []);

  const editTransaction = useCallback(
    async (id: string, data: Partial<Omit<Transaction, "id">>) => {
      const updated = await updateTx(id, data);
      const sorted = updated.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setTransactions(sorted);
    },
    []
  );

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const balance = useMemo(
    () => totalIncome - totalExpense,
    [totalIncome, totalExpense]
  );

  return {
    transactions,
    isLoading,
    totalIncome,
    totalExpense,
    balance,
    addTransaction,
    deleteTransaction,
    editTransaction,
    refresh: loadTransactions,
  };
};
