import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { X, Target, Calculator } from 'lucide-react';

interface SavingsGoalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ isOpen, onClose }) => {
  const { addSavingsGoal } = useTransactions();
  
  const [formData, setFormData] = useState({
    itemName: '',
    cost: '',
    targetMonths: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.itemName.trim()) {
      newErrors.itemName = 'Please enter an item name';
    }
    
    if (!formData.cost || parseFloat(formData.cost) <= 0) {
      newErrors.cost = 'Please enter a valid cost';
    }
    
    if (!formData.targetMonths || parseInt(formData.targetMonths) <= 0) {
      newErrors.targetMonths = 'Please enter valid target months';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const cost = parseFloat(formData.cost);
    const targetMonths = parseInt(formData.targetMonths);
    const monthlySavingRequired = cost / targetMonths;
    
    addSavingsGoal({
      itemName: formData.itemName,
      cost,
      targetMonths,
      monthlySavingRequired
    });
    
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      cost: '',
      targetMonths: ''
    });
    setErrors({});
  };

  const monthlySavingRequired = formData.cost && formData.targetMonths 
    ? parseFloat(formData.cost) / parseInt(formData.targetMonths)
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Set Savings Goal
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                What are you saving for?
              </label>
              <input
                type="text"
                value={formData.itemName}
                onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.itemName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., New Laptop, Vacation, Emergency Fund"
              />
              {errors.itemName && <p className="mt-1 text-sm text-red-600">{errors.itemName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.cost ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Months
              </label>
              <input
                type="number"
                min="1"
                value={formData.targetMonths}
                onChange={(e) => setFormData({ ...formData, targetMonths: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.targetMonths ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12"
              />
              {errors.targetMonths && <p className="mt-1 text-sm text-red-600">{errors.targetMonths}</p>}
            </div>

            {monthlySavingRequired > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Monthly Savings Required
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${monthlySavingRequired.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Target className="h-4 w-4" />
              <span>Create Goal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SavingsGoalForm;