
import React, { useState } from 'react';
import { FinanceProvider } from '../context/FinanceContext';
import MainLayout from '../components/MainLayout';
import BalanceSummary from '../components/Dashboard/BalanceSummary';
import ExpenseChart from '../components/Dashboard/ExpenseChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import BudgetStatus from '../components/Dashboard/BudgetStatus';
import AddTransaction from '../components/Transactions/AddTransaction';
import { TransactionType } from '../types';
import { Calendar, ChevronDown } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [addingTransaction, setAddingTransaction] = useState<TransactionType | null>(null);
  
  return (
    <FinanceProvider>
      <MainLayout>
        {/* Date Range Selector */}
        <div className="p-4 flex items-center justify-center bg-white border-b">
          <button className="flex items-center text-sm text-gray-700">
            <Calendar size={16} className="mr-2 text-finance-blue" />
            <span>April 2025</span>
            <ChevronDown size={16} className="ml-1 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4">
          {/* Balance Summary */}
          <BalanceSummary />
          
          {/* Expense Chart */}
          <ExpenseChart />
          
          {/* Budget Status */}
          <BudgetStatus />
          
          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
        
        {/* Transaction Form Modal */}
        {addingTransaction !== null && (
          <AddTransaction 
            type={addingTransaction} 
            onClose={() => setAddingTransaction(null)} 
          />
        )}
      </MainLayout>
    </FinanceProvider>
  );
};

export default Dashboard;
