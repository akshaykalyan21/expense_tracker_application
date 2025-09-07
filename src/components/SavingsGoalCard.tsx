import React, { useState } from 'react';
import { SavingsGoal } from '../types';
import { useTransactions } from '../context/TransactionContext';
import { Target, Plus, Trash2, DollarSign } from 'lucide-react';

interface SavingsGoalCardProps {
  goal: SavingsGoal;
}

const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({ goal }) => {
  const { addContribution, deleteSavingsGoal } = useTransactions();
  const [contributionAmount, setContributionAmount] = useState('');
  const [showContributionForm, setShowContributionForm] = useState(false);

  const progressPercentage = (goal.progress / goal.cost) * 100;
  const remainingAmount = goal.cost - goal.progress;
  const isCompleted = goal.progress >= goal.cost;

  const handleContribution = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(contributionAmount);
    if (amount > 0) {
      addContribution(goal.id, amount);
      setContributionAmount('');
      setShowContributionForm(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 border-l-4 ${
      isCompleted ? 'border-green-500' : 'border-blue-500'
    } shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isCompleted ? 'bg-green-100 dark:bg-green-900/20' : 'bg-blue-100 dark:bg-blue-900/20'
          }`}>
            <Target className={`h-5 w-5 ${
              isCompleted ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400'
            }`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.itemName}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Target: {formatAmount(goal.cost)} in {goal.targetMonths} months
            </p>
          </div>
        </div>
        
        <button
          onClick={() => deleteSavingsGoal(goal.id)}
          className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Amount Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Saved</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatAmount(goal.progress)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Remaining</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {formatAmount(remainingAmount)}
          </p>
        </div>
      </div>

      {/* Monthly Requirement */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Target</p>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
          {formatAmount(goal.monthlySavingRequired)}
        </p>
      </div>

      {/* Contribution Form */}
      {!isCompleted && (
        <div>
          {!showContributionForm ? (
            <button
              onClick={() => setShowContributionForm(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Contribution</span>
            </button>
          ) : (
            <form onSubmit={handleContribution} className="space-y-3">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowContributionForm(false);
                  setContributionAmount('');
                }}
                className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      )}

      {isCompleted && (
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
          <p className="text-green-600 dark:text-green-400 font-semibold">
            🎉 Goal Completed!
          </p>
        </div>
      )}
    </div>
  );
};

export default SavingsGoalCard;