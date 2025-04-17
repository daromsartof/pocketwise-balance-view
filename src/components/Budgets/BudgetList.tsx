
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Budget } from '../../types';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BudgetListProps {
  budgets: Budget[];
  onEdit: (budget: Budget) => void;
}

export const BudgetList: React.FC<BudgetListProps> = ({ budgets, onEdit }) => {
  const { categories, deleteBudget } = useFinance();
  const { toast } = useToast();

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date instanceof Date ? date : new Date(date));
  };

  // Format period for display
  const formatPeriod = (period: string) => {
    const capitalized = period.charAt(0).toUpperCase() + period.slice(1);
    return capitalized;
  };

  const handleDelete = (budget: Budget) => {
    deleteBudget(budget.id);
    toast({
      title: "Budget deleted",
      description: "Budget has been successfully deleted",
    });
  };

  if (budgets.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No budgets found. Create your first budget to start tracking your spending.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {budgets.map((budget) => {
        const category = categories.find(c => c.id === budget.categoryId);
        
        return (
          <Card key={budget.id} className="overflow-hidden">
            <div 
              className="h-2" 
              style={{ backgroundColor: category?.color || '#CBD5E0' }}
            ></div>
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{category?.name || "Unknown Category"}</h3>
                  <p className="text-sm text-gray-500">
                    {formatPeriod(budget.period)} budget
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEdit(budget)}
                    className="h-8 w-8"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(budget)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="text-lg font-semibold">
                ${budget.amount.toFixed(2)}
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                <span>From: {formatDate(budget.startDate)}</span>
                {budget.endDate && (
                  <span> • To: {formatDate(budget.endDate)}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
