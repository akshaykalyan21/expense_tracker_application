import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { exportToCSV, generateMonthlyReport } from '../utils/csvExport';
import { Download, Calendar, TrendingUp, DollarSign, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CATEGORY_COLORS } from '../utils/constants';

const Reports: React.FC = () => {
  const { transactions } = useTransactions();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const handleExportCSV = () => {
    const filename = `finance-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(transactions, filename);
  };

  const handleExportMonthlyReport = () => {
    const monthlyData = generateMonthlyReport(transactions);
    const csv = 'Month,Income,Expenses,Balance\n' + 
                monthlyData.map(row => `${row.Month},${row.Income},${row.Expenses},${row.Balance}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `monthly-report-${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate statistics
  const yearTransactions = transactions.filter(t => 
    new Date(t.date).getFullYear() === selectedYear
  );

  const totalIncome = yearTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = yearTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryExpenses = yearTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryExpenses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const monthlyExpenses = yearTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', { month: 'short' });
      acc[month] = (acc[month] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

  const monthlyData = Object.entries(monthlyExpenses)
    .map(([month, amount]) => ({ month, amount }))
    .sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

  const availableYears = Array.from(
    new Set(transactions.map(t => new Date(t.date).getFullYear()))
  ).sort((a, b) => b - a);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-gray-900 dark:text-white font-semibold mb-1">{label}</p>
          <p className="text-sm text-red-600 dark:text-red-400">
            Expenses: {formatAmount(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reports & Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive financial insights and data export
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <button
            onClick={handleExportCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={handleExportMonthlyReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Calendar className="h-4 w-4" />
            <span>Monthly Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Income ({selectedYear})
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatAmount(totalIncome)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Expenses ({selectedYear})
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatAmount(totalExpenses)}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Net Savings ({selectedYear})
              </p>
              <p className={`text-2xl font-bold ${
                totalIncome - totalExpenses >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatAmount(totalIncome - totalExpenses)}
              </p>
            </div>
            <PieChart className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Monthly Expenses
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatAmount(totalExpenses / 12)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Spending Categories ({selectedYear})
          </h3>
          <div className="space-y-4">
            {topCategories.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No expense data available
              </p>
            ) : (
              topCategories.map(([category, amount], index) => {
                const percentage = (amount / totalExpenses) * 100;
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: CATEGORY_COLORS[category] || '#6B7280' }}
                      />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {formatAmount(amount)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Monthly Expenses Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Expenses ({selectedYear})
          </h3>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500 dark:text-gray-400">No data to display</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="month" 
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                />
                <YAxis 
                  className="text-gray-600 dark:text-gray-400"
                  fontSize={12}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  fill="#EF4444" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Financial Summary ({selectedYear})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {yearTransactions.length}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Income Transactions</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {yearTransactions.filter(t => t.type === 'income').length}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Expense Transactions</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {yearTransactions.filter(t => t.type === 'expense').length}
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Categories Used</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(categoryExpenses).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;