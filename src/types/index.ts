export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface SavingsGoal {
  id: string;
  itemName: string;
  cost: number;
  targetMonths: number;
  monthlySavingRequired: number;
  progress: number;
  createdAt: string;
  contributions: SavingsContribution[];
}

export interface SavingsContribution {
  id: string;
  amount: number;
  date: string;
}

export interface AverageStats {
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
}