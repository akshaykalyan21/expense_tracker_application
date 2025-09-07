import React, { useState } from 'react';
import { TransactionProvider } from './context/TransactionContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <Transactions />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <TransactionProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {renderCurrentPage()}
      </Layout>
    </TransactionProvider>
  );
}

export default App;