import React from 'react';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  type: 'income' | 'expense' | 'balance';
  change?: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, type, change }) => {
  const getIcon = () => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-6 w-6 text-green-600" />;
      case 'expense':
        return <TrendingDown className="h-6 w-6 text-red-600" />;
      default:
        return <Wallet className="h-6 w-6 text-blue-600" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'income':
        return 'border-green-200 dark:border-green-800';
      case 'expense':
        return 'border-red-200 dark:border-red-800';
      default:
        return amount >= 0 ? 'border-blue-200 dark:border-blue-800' : 'border-red-200 dark:border-red-800';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Math.abs(amount));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 ${getColorClasses()} shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getIcon()}
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className={`text-2xl font-bold ${
              type === 'balance' && amount < 0 
                ? 'text-red-600 dark:text-red-400' 
                : type === 'income' 
                ? 'text-green-600 dark:text-green-400'
                : type === 'expense'
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}>
              {type === 'balance' && amount < 0 ? '-' : ''}
              {formatAmount(amount)}
            </p>
          </div>
        </div>
        {change !== undefined && (
          <div className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;