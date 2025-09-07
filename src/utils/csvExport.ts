import Papa from 'papaparse';
import { Transaction } from '../types';

export const exportToCSV = (transactions: Transaction[], filename = 'transactions.csv') => {
  const csvData = transactions.map(transaction => ({
    Date: new Date(transaction.date).toLocaleDateString(),
    Type: transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1),
    Category: transaction.category,
    Description: transaction.description,
    Amount: transaction.amount.toFixed(2)
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const generateMonthlyReport = (transactions: Transaction[]) => {
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  
  transactions.forEach(transaction => {
    const month = new Date(transaction.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
    
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 };
    }
    
    if (transaction.type === 'income') {
      monthlyData[month].income += transaction.amount;
    } else {
      monthlyData[month].expenses += transaction.amount;
    }
  });
  
  return Object.entries(monthlyData).map(([month, data]) => ({
    Month: month,
    Income: data.income.toFixed(2),
    Expenses: data.expenses.toFixed(2),
    Balance: (data.income - data.expenses).toFixed(2)
  }));
};