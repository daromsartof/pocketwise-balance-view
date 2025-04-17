
import React from 'react';
import { useFinance } from '../../context/FinanceContext';

interface BudgetProgressProps {
  categoryId: string;
  allocated: number;
  spent: number;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  categoryId,
  allocated,
  spent
}) => {
  const { categories } = useFinance();
  const category = categories.find(c => c.id === categoryId);
  
  // Calculate percentage spent
  const percentage = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
  const remaining = allocated - spent;
  
  // Determine color based on percentage
  let statusColor = 'bg-green-500';
  if (percentage >= 90) {
    statusColor = 'bg-red-500';
  } else if (percentage >= 75) {
    statusColor = 'bg-orange-500';
  } else if (percentage >= 50) {
    statusColor = 'bg-yellow-500';
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium text-sm">
          {category?.name || 'Unnamed Category'}
        </div>
        <div className="text-xs">
          <span className="font-medium">
            ${spent.toFixed(2)} of ${allocated.toFixed(2)}
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
        <span className={remaining >= 0 ? 'text-green-500' : 'text-red-500'}>
          {remaining >= 0 ? `$${remaining.toFixed(2)} left` : `$${Math.abs(remaining).toFixed(2)} over`}
        </span>
      </div>
    </div>
  );
};
