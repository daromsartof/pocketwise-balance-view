
import React, { useState } from 'react';
import { useFinance, FinanceProvider } from '../context/FinanceContext';
import MainLayout from '../components/MainLayout';
import { BudgetList } from '../components/Budgets/BudgetList';
import { BudgetForm } from '../components/Budgets/BudgetForm';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Budget } from '../types';

const BudgetsContent = () => {
  const { budgets } = useFinance();
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const handleAddClick = () => {
    setIsAddingBudget(true);
    setEditingBudget(null);
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setIsAddingBudget(true);
  };

  const handleClose = () => {
    setIsAddingBudget(false);
    setEditingBudget(null);
  };

  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Budgets</h1>
          {!isAddingBudget && (
            <Button onClick={handleAddClick} className="flex items-center">
              <Plus size={16} className="mr-1" />
              Add Budget
            </Button>
          )}
          {isAddingBudget && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="ml-auto"
            >
              <X size={20} />
            </Button>
          )}
        </div>

        {isAddingBudget ? (
          <BudgetForm 
            existingBudget={editingBudget} 
            onCancel={handleClose} 
            onSuccess={handleClose}
          />
        ) : (
          <BudgetList 
            budgets={budgets} 
            onEdit={handleEditBudget} 
          />
        )}
      </div>
    </MainLayout>
  );
};

const Budgets: React.FC = () => {
  return (
    <FinanceProvider>
      <BudgetsContent />
    </FinanceProvider>
  );
};

export default Budgets;
