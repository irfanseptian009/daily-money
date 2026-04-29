export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

export type CategoryId = string;

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  icon: string;
  emoji?: string;
  type: TransactionType;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: CategoryId;
  note: string;
  date: string; // ISO date string
  createdAt: string; // ISO datetime string
}

export type RootStackParamList = {
  Home: undefined;
  AddTransaction: { transaction?: Transaction } | undefined;
  Statistics: undefined;
  Calculator: undefined;
  Settings: undefined;
  ManageCategories: undefined;
  Premium: undefined;
};
