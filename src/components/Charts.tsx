import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useTransactions } from '../context/TransactionContext';
import { CATEGORY_COLORS } from '../utils/constants';

const Charts: React.FC = () => {
  const { transactions } = useTransactions();

  // Prepare category-wise expense data for pie chart
  const categoryData = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const existing = acc.find(item => item.name === transaction.category);
      if (existing) {
        existing.value += transaction.amount;
      } else {
        acc.push({
          name: transaction.category,
          value: transaction.amount,
          color: CATEGORY_COLORS[transaction.category] || '#6B7280'
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number; color: string }>)
    .sort((a, b) => b.value - a.value);

  // Prepare monthly data for line chart
  const monthlyData = transactions
    .reduce((acc, transaction) => {
      const month = new Date(transaction.date).toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (!acc[month]) {
        acc[month] = { month, income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expenses += transaction.amount;
      }
      
      return acc;
    }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const sortedMonthlyData = Object.values(monthlyData)
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6); // Show last 6 months

  // Prepare income vs expense comparison data
  const comparisonData = [
    {
      name: 'Income',
      amount: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      color: '#10B981'
    },
    {
      name: 'Expenses',
      amount: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      color: '#EF4444'
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          {label && <p className="text-gray-900 dark:text-white font-semibold mb-1">{label}</p>}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">No data to display</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Expenses by Category - Pie Chart */}
      {categoryData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expenses by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={(entry) => `${entry.name}: $${entry.value.toFixed(0)}`}
                labelLine={false}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Income vs Expenses - Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Income vs Expenses
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
            />
            <YAxis 
              className="text-gray-600 dark:text-gray-400"
              fontSize={12}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
              {comparisonData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trend - Line Chart */}
      {sortedMonthlyData.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 xl:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Monthly Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sortedMonthlyData}>
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
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#EF4444" 
                strokeWidth={3}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default Charts;