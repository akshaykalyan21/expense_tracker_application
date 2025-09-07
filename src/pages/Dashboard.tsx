import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import SummaryCard from '../components/SummaryCard';
import Charts from '../components/Charts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { transactions, getSummary } = useTransactions();
  const summary = getSummary();

  // Calculate recent activity
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const thisMonth = new Date();
  const lastMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth() - 1);

  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === thisMonth.getMonth() && 
           transactionDate.getFullYear() === thisMonth.getFullYear();
  });

  const lastMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === lastMonth.getMonth() && 
           transactionDate.getFullYear() === lastMonth.getFullYear();
  });

  const thisMonthExpenses = thisMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseChange = lastMonthExpenses === 0 ? 0 : 
    ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          title="Total Balance"
          amount={summary.balance}
          type="balance"
        />
        <SummaryCard
          title="Total Income"
          amount={summary.totalIncome}
          type="income"
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary.totalExpenses}
          type="expense"
          change={expenseChange}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              This Month
            </h3>
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Income</span>
              <span className="font-semibold text-green-600 dark:text-green-400">
                {formatAmount(thisMonthTransactions
                  .filter(t => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0)
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Expenses</span>
              <span className="font-semibold text-red-600 dark:text-red-400">
                {formatAmount(thisMonthExpenses)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900 dark:text-white">Net</span>
                <span className={`font-bold ${
                  (thisMonthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0) - thisMonthExpenses) >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatAmount(
                    thisMonthTransactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0) - thisMonthExpenses
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No recent transactions
              </p>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.category} • {formatDate(transaction.date)}
                    </p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'income'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          Financial Overview
        </h2>
        <Charts />
      </div>
    </div>
  );
};

export default Dashboard;