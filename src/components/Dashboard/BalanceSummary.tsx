
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ArrowDown, ArrowUp, Wallet } from 'lucide-react';

const BalanceSummary: React.FC = () => {
  const { summary } = useFinance();
  
  const balanceChange = summary.balance - summary.previousBalance;
  const percentChange = summary.previousBalance !== 0 
    ? (balanceChange / Math.abs(summary.previousBalance)) * 100 
    : 0;
  
  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm text-gray-500">Balance</h2>
        <div className="flex items-center">
          <Wallet size={16} className="text-finance-blue mr-1" />
          <span className="text-xs">All Accounts</span>
        </div>
      </div>
      
      <div className="text-3xl font-bold text-finance-navy mb-3">
        ${summary.balance.toFixed(2)}
      </div>
      
      <div className="flex justify-between">
        <div className="w-1/2 pr-2">
          <div className="flex items-center mb-1">
            <ArrowUp size={16} className="text-green-500 mr-1" />
            <span className="text-xs text-gray-600">Income</span>
          </div>
          <div className="text-lg font-semibold text-green-500">
            ${summary.totalIncome.toFixed(2)}
          </div>
        </div>
        
        <div className="w-1/2 pl-2 border-l">
          <div className="flex items-center mb-1">
            <ArrowDown size={16} className="text-red-500 mr-1" />
            <span className="text-xs text-gray-600">Expenses</span>
          </div>
          <div className="text-lg font-semibold text-red-500">
            ${summary.totalExpense.toFixed(2)}
          </div>
        </div>
      </div>
      
      {summary.previousBalance !== 0 && (
        <div className={`mt-3 pt-3 border-t text-sm flex items-center ${
          balanceChange >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          {balanceChange >= 0 ? <ArrowUp size={14} className="mr-1" /> : <ArrowDown size={14} className="mr-1" />}
          <span>
            {balanceChange >= 0 ? '+' : ''}{balanceChange.toFixed(2)} ({percentChange.toFixed(2)}%)
            from previous period
          </span>
        </div>
      )}
    </div>
  );
};

export default BalanceSummary;
