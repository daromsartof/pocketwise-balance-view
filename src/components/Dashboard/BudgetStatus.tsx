
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ChevronRight } from 'lucide-react';

const BudgetStatus: React.FC = () => {
  const { summary, categories, budgets } = useFinance();
  
  // Combine budget status with category information
  const budgetItems = summary.budgets.map(budget => {
    const category = categories.find(c => c.id === budget.categoryId);
    const originalBudget = budgets.find(b => b.categoryId === budget.categoryId);
    
    return {
      ...budget,
      category,
      period: originalBudget?.period || 'monthly'
    };
  });
  
  // Sort by percentage spent (highest first)
  const sortedBudgets = [...budgetItems]
    .sort((a, b) => {
      const aPercentage = a.allocated > 0 ? (a.spent / a.allocated) * 100 : 0;
      const bPercentage = b.allocated > 0 ? (b.spent / b.allocated) * 100 : 0;
      return bPercentage - aPercentage;
    });
  
  const formatPeriod = (period: string) => {
    switch (period) {
      case 'daily': return 'Day';
      case 'weekly': return 'Week';
      case 'monthly': return 'Month';
      case 'yearly': return 'Year';
      default: return 'Month';
    }
  };
  
  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm text-gray-500">Budget Status</h2>
        <a href="/budgets" className="text-xs text-finance-blue font-medium">
          View All
        </a>
      </div>
      
      <div className="space-y-4">
        {sortedBudgets.length > 0 ? (
          sortedBudgets.slice(0, 3).map((budget, index) => {
            const percentage = budget.allocated > 0 
              ? Math.min(100, (budget.spent / budget.allocated) * 100) 
              : 0;
            
            let statusColor = 'bg-green-500';
            if (percentage >= 90) {
              statusColor = 'bg-red-500';
            } else if (percentage >= 75) {
              statusColor = 'bg-orange-500';
            } else if (percentage >= 50) {
              statusColor = 'bg-yellow-500';
            }
            
            return (
              <div key={index} className="flex items-start">
                {/* Category Icon */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                  style={{ backgroundColor: budget.category?.color + '20' }}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: budget.category?.color }}
                  >
                    <span className="text-white text-xs">
                      {budget.category?.name.charAt(0)}
                    </span>
                  </div>
                </div>
                
                {/* Budget Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium text-sm truncate">
                      {budget.category?.name || 'Unnamed Category'}
                    </div>
                    <div className="flex flex-col items-end ml-2 text-xs">
                      <span className="font-medium">
                        ${budget.spent.toFixed(2)} of ${budget.allocated.toFixed(2)}
                      </span>
                      <span className="text-gray-500">
                        per {formatPeriod(budget.period)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${statusColor}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1 text-xs">
                    <span className="text-gray-500">
                      {percentage.toFixed(0)}% used
                    </span>
                    <span className={budget.remaining >= 0 ? 'text-green-500' : 'text-red-500'}>
                      {budget.remaining >= 0 ? `$${budget.remaining.toFixed(2)} left` : `$${Math.abs(budget.remaining).toFixed(2)} over`}
                    </span>
                  </div>
                </div>
                
                <ChevronRight size={16} className="text-gray-400 ml-2 mt-2 flex-shrink-0" />
              </div>
            );
          })
        ) : (
          <div className="text-center text-gray-400 py-4">
            No budgets set up
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetStatus;
