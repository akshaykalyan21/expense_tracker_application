import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';
import { Plus } from 'lucide-react';
import { Transaction } from '../types';

const Transactions: React.FC = () => {
  const { transactions } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your income and expenses
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Stats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {transactions.length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {transactions.filter(t => {
                const transactionDate = new Date(t.date);
                const now = new Date();
                return transactionDate.getMonth() === now.getMonth() && 
                       transactionDate.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Categories Used</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(transactions.map(t => t.category)).size}
            </p>
          </div>
        </div>
      </div>

      <TransactionList onEditTransaction={handleEditTransaction} />

      <TransactionForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        editingTransaction={editingTransaction}
      />
    </div>
  );
};

export default Transactions;