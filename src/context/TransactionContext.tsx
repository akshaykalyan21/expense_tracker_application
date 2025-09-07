import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Transaction, TransactionSummary, SavingsGoal, SavingsContribution, AverageStats } from '../types';

interface TransactionState {
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  loading: boolean;
  darkMode: boolean;
}

interface TransactionContextType extends TransactionState {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'progress' | 'contributions'>) => void;
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number) => void;
  getSummary: () => TransactionSummary;
  getAverageStats: () => AverageStats;
  toggleDarkMode: () => void;
}

type TransactionAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; transaction: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: { id: string; goal: Partial<SavingsGoal> } }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'SET_SAVINGS_GOALS'; payload: SavingsGoal[] }
  | { type: 'ADD_CONTRIBUTION'; payload: { goalId: string; contribution: SavingsContribution } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_DARK_MODE' };

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const transactionReducer = (state: TransactionState, action: TransactionAction): TransactionState => {
  switch (action.type) {
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id 
            ? { ...t, ...action.payload.transaction }
            : t
        )
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload)
      };
    case 'SET_TRANSACTIONS':
      return {
        ...state,
        transactions: action.payload,
        loading: false
      };
    case 'ADD_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: [action.payload, ...state.savingsGoals]
      };
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(g => 
          g.id === action.payload.id 
            ? { ...g, ...action.payload.goal }
            : g
        )
      };
    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter(g => g.id !== action.payload)
      };
    case 'SET_SAVINGS_GOALS':
      return {
        ...state,
        savingsGoals: action.payload
      };
    case 'ADD_CONTRIBUTION':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map(goal => 
          goal.id === action.payload.goalId
            ? {
                ...goal,
                contributions: [...goal.contributions, action.payload.contribution],
                progress: goal.contributions.reduce((sum, c) => sum + c.amount, 0) + action.payload.contribution.amount
              }
            : goal
        )
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode
      };
    default:
      return state;
  }
};

const initialState: TransactionState = {
  transactions: [],
  savingsGoals: [],
  loading: true,
  darkMode: false
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  useEffect(() => {
    // Load data from localStorage
    const savedTransactions = localStorage.getItem('finance-tracker-transactions');
    const savedSavingsGoals = localStorage.getItem('finance-tracker-savings-goals');
    const savedDarkMode = localStorage.getItem('finance-tracker-dark-mode');
    
    if (savedTransactions) {
      try {
        const transactions = JSON.parse(savedTransactions);
        dispatch({ type: 'SET_TRANSACTIONS', payload: transactions });
      } catch (error) {
        console.error('Error loading transactions:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }

    if (savedSavingsGoals) {
      try {
        const savingsGoals = JSON.parse(savedSavingsGoals);
        dispatch({ type: 'SET_SAVINGS_GOALS', payload: savingsGoals });
      } catch (error) {
        console.error('Error loading savings goals:', error);
      }
    }

    if (savedDarkMode === 'true') {
      dispatch({ type: 'TOGGLE_DARK_MODE' });
    }
  }, []);

  useEffect(() => {
    // Save transactions to localStorage
    if (!state.loading) {
      localStorage.setItem('finance-tracker-transactions', JSON.stringify(state.transactions));
    }
  }, [state.transactions, state.loading]);

  useEffect(() => {
    // Save savings goals to localStorage
    localStorage.setItem('finance-tracker-savings-goals', JSON.stringify(state.savingsGoals));
  }, [state.savingsGoals]);

  useEffect(() => {
    // Save dark mode preference
    localStorage.setItem('finance-tracker-dark-mode', state.darkMode.toString());
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, transaction } });
  };

  const deleteTransaction = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'progress' | 'contributions'>) => {
    const goal: SavingsGoal = {
      ...goalData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      progress: 0,
      contributions: []
    };
    dispatch({ type: 'ADD_SAVINGS_GOAL', payload: goal });
  };

  const updateSavingsGoal = (id: string, goal: Partial<SavingsGoal>) => {
    dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: { id, goal } });
  };

  const deleteSavingsGoal = (id: string) => {
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id });
  };

  const addContribution = (goalId: string, amount: number) => {
    const contribution: SavingsContribution = {
      id: crypto.randomUUID(),
      amount,
      date: new Date().toISOString()
    };
    dispatch({ type: 'ADD_CONTRIBUTION', payload: { goalId, contribution } });
  };
  const getSummary = (): TransactionSummary => {
    const totalIncome = state.transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = state.transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses
    };
  };

  const getAverageStats = (): AverageStats => {
    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    
    state.transactions.forEach(transaction => {
      const monthKey = new Date(transaction.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'numeric' 
      });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });
    
    const months = Object.values(monthlyData);
    const monthCount = months.length || 1;
    
    const avgMonthlyIncome = months.reduce((sum, month) => sum + month.income, 0) / monthCount;
    const avgMonthlyExpenses = months.reduce((sum, month) => sum + month.expenses, 0) / monthCount;
    
    return {
      avgMonthlyIncome,
      avgMonthlyExpenses
    };
  };
  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  return (
    <TransactionContext.Provider value={{
      ...state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addSavingsGoal,
      updateSavingsGoal,
      deleteSavingsGoal,
      addContribution,
      getSummary,
      getAverageStats,
      toggleDarkMode
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};