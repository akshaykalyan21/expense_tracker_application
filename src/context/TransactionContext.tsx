import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Transaction, TransactionSummary } from '../types';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  darkMode: boolean;
}

interface TransactionContextType extends TransactionState {
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getSummary: () => TransactionSummary;
  toggleDarkMode: () => void;
}

type TransactionAction =
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; transaction: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
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
  loading: true,
  darkMode: false
};

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  useEffect(() => {
    // Load data from localStorage
    const savedTransactions = localStorage.getItem('finance-tracker-transactions');
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

  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  return (
    <TransactionContext.Provider value={{
      ...state,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getSummary,
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