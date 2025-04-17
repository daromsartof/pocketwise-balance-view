
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ChevronRight, Banknote, CreditCard, Landmark, Smartphone } from 'lucide-react';
import { PaymentMethod, TransactionType } from '../../types';
import { Link } from 'react-router-dom';

const RecentTransactions: React.FC = () => {
  const { transactions } = useFinance();
  
  // Sort transactions by date (newest first) and take the 5 most recent
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);
  
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <Banknote size={16} className="text-green-500" />;
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return <CreditCard size={16} className="text-blue-500" />;
      case PaymentMethod.BANK_TRANSFER:
        return <Landmark size={16} className="text-purple-500" />;
      case PaymentMethod.MOBILE_PAYMENT:
        return <Smartphone size={16} className="text-orange-500" />;
      default:
        return <Banknote size={16} className="text-gray-500" />;
    }
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm text-gray-500">Recent Transactions</h2>
        <Link to="/transactions" className="text-xs text-finance-blue font-medium">
          View All
        </Link>
      </div>
      
      <div className="space-y-4">
        {recentTransactions.length > 0 ? (
          recentTransactions.map(transaction => (
            <div key={transaction.id} className="flex items-center">
              {/* Category Icon */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                style={{ backgroundColor: transaction.category.color + '20' }}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: transaction.category.color }}
                >
                  {/* Using a basic text representation for the icon */}
                  <span className="text-white text-xs">
                    {transaction.category.name.charAt(0)}
                  </span>
                </div>
              </div>
              
              {/* Transaction Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="truncate">
                    <div className="font-medium text-sm truncate">
                      {transaction.description}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="truncate mr-2">{transaction.category.name}</span>
                      <span className="flex-shrink-0">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <div className={`font-medium text-sm ${
                      transaction.category.type === TransactionType.INCOME
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}>
                      {transaction.category.type === TransactionType.INCOME ? '+' : '-'}
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(transaction.date)}
                    </div>
                  </div>
                </div>
              </div>
              
              <ChevronRight size={16} className="text-gray-400 ml-2 flex-shrink-0" />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            No recent transactions
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTransactions;
