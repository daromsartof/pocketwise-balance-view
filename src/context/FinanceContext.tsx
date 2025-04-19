/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Account, 
  Budget, 
  Category, 
  FinanceSummary, 
  PaymentMethod, 
  Transaction, 
  TransactionType 
} from '../types';
import { 
  accounts as mockAccounts, 
  budgets as mockBudgets, 
  transactions as mockTransactions,
  calculateTotalIncome,
  calculateTotalExpense,
  calculateBalance,
  getCategoryBreakdown,
  getBudgetStatus
} from '../data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

interface FinanceContextType {
  // Data
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  summary: FinanceSummary;
  
  // Loading states
  isLoadingCategories: boolean;
  isLoadingBudgets: boolean;
  
  // Active states
  currentAccount: Account | null;
  dateRange: { startDate: Date; endDate: Date };
  
  // Filters
  transactionFilters: {
    categoryIds: string[];
    paymentMethods: PaymentMethod[];
    type?: TransactionType;
    searchText?: string;
    minAmount?: number;
    maxAmount?: number;
  };
  
  // Actions
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (id: string) => void;
  setCurrentAccount: (account: Account | null) => void;
  setDateRange: (range: { startDate: Date; endDate: Date }) => void;
  setTransactionFilters: (filters: Partial<FinanceContextType['transactionFilters']>) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

// Get the first day of the current month
const getFirstDayOfMonth = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
};

// Get the last day of the current month
const getLastDayOfMonth = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0);
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  // State initialization
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingBudgets, setIsLoadingBudgets] = useState(false);
  
  // Active states
  const [currentAccount, setCurrentAccount] = useState<Account | null>(mockAccounts[0]);
  const [dateRange, setDateRange] = useState({
    startDate: getFirstDayOfMonth(),
    endDate: getLastDayOfMonth(),
  });
  
  // Filters
  const [transactionFilters, setTransactionFilters] = useState({
    categoryIds: [] as string[],
    paymentMethods: [] as PaymentMethod[],
  });
  
  // Derived state - summary data
  const [summary, setSummary] = useState<FinanceSummary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    previousBalance: 0,
    budgets: [],
    categoryBreakdown: [],
  });
  
  // Update summary whenever relevant data changes
  useEffect(() => {
    // Filter transactions for the selected date range
    const filteredTransactions = transactions.filter(
      t => t.date >= dateRange.startDate && t.date <= dateRange.endDate
    );
    
    // Calculate totals
    const totalIncome = calculateTotalIncome(filteredTransactions);
    const totalExpense = calculateTotalExpense(filteredTransactions);
    const balance = calculateBalance(filteredTransactions);
    
    // Calculate previous period's balance
    const daysInCurrentPeriod = (dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const previousStartDate = new Date(dateRange.startDate);
    previousStartDate.setDate(previousStartDate.getDate() - daysInCurrentPeriod);
    const previousEndDate = new Date(dateRange.startDate);
    previousEndDate.setDate(previousEndDate.getDate() - 1);
    
    const previousTransactions = transactions.filter(
      t => t.date >= previousStartDate && t.date <= previousEndDate
    );
    const previousBalance = calculateBalance(previousTransactions);
    
    // Calculate budget statuses
    const budgetStatuses = budgets.map(budget => {
      const { spent, remaining } = getBudgetStatus(budget, filteredTransactions);
      return {
        categoryId: budget.categoryId,
        allocated: budget.amount,
        spent,
        remaining,
      };
    });
    
    // Calculate category breakdown for expenses
    const categoryExpenseBreakdown = getCategoryBreakdown(filteredTransactions, TransactionType.EXPENSE);
    const categoryBreakdown = categoryExpenseBreakdown.map(item => ({
      categoryId: item.category.id,
      amount: item.amount,
      percentage: item.percentage,
    }));
    
    // Update summary
    setSummary({
      totalIncome,
      totalExpense,
      balance,
      previousBalance,
      budgets: budgetStatuses,
      categoryBreakdown,
    });
  }, [transactions, budgets, dateRange]);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      if (!session?.user?.id) return;

      setIsLoadingCategories(true);
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', session.user.id)
          .order('name');
        
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        const formattedCategories: Category[] = data.map(category => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
          color: category.color,
          type: category.type.toUpperCase() as TransactionType
        }));
        console.log("formattedCategories ", formattedCategories)
        
        setCategories(formattedCategories);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [session]);

  // Fetch budgets from Supabase
  useEffect(() => {
    const fetchBudgets = async () => {
      if (!session?.user?.id) return;

      setIsLoadingBudgets(true);
      try {
        const { data, error } = await supabase
          .from('budgets')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching budgets:', error);
          return;
        }

        const formattedBudgets: Budget[] = data.map(budget => ({
          id: budget.id,
          categoryId: budget.category_id,
          amount: budget.amount,
          period: budget.period,
          startDate: new Date(budget.start_date),
          endDate: budget.end_date ? new Date(budget.end_date) : undefined
        }));

        setBudgets(formattedBudgets);
      } finally {
        setIsLoadingBudgets(false);
      }
    };

    fetchBudgets();
  }, [session]);

  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    if (!session?.user?.id) {
      console.error('User must be authenticated to add categories');
      return;
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: categoryData.name,
        icon: categoryData.icon,
        color: categoryData.color,
        type: categoryData.type.toLowerCase(),
        user_id: session.user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return;
    }

    const newCategory: Category = {
      id: data.id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      type: data.type.toUpperCase() as TransactionType
    };

    setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = async (updatedCategory: Category) => {
    if (!session?.user?.id) {
      console.error('User must be authenticated to update categories');
      return;
    }

    const { error } = await supabase
      .from('categories')
      .update({
        name: updatedCategory.name,
        icon: updatedCategory.icon,
        color: updatedCategory.color,
        type: updatedCategory.type.toLowerCase()
      })
      .eq('id', updatedCategory.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating category:', error);
      return;
    }

    setCategories(prev => 
      prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
    );
  };

  const deleteCategory = async (id: string) => {
    if (!session?.user?.id) {
      console.error('User must be authenticated to delete categories');
      return;
    }

    // Check if category is in use
    const categoryInUse = transactions.some(t => t.category.id === id) ||
                         budgets.some(b => b.categoryId === id);
    
    if (categoryInUse) {
      console.error("Cannot delete category that is in use");
      return;
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting category:', error);
      return;
    }
    
    setCategories(prev => prev.filter(c => c.id !== id));
  };
  
  // CRUD operations
  const addTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString(), // Simple ID generation
    };
    setTransactions(prev => [...prev, newTransaction]);
  };
  
  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };
  
  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };
  
  const addBudget = async (budgetData: Omit<Budget, 'id'>) => {
    if (!session?.user?.id) {
      console.error('User must be authenticated to add budgets');
      return;
    }

    const { data, error } = await supabase
      .from('budgets')
      .insert({
        category_id: budgetData.categoryId,
        amount: budgetData.amount,
        period: budgetData.period,
        start_date: budgetData.startDate.toISOString().split('T')[0],
        end_date: budgetData.endDate?.toISOString().split('T')[0],
        user_id: session.user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding budget:', error);
      return;
    }

    const newBudget: Budget = {
      id: data.id,
      categoryId: data.category_id,
      amount: data.amount,
      period: data.period,
      startDate: new Date(data.start_date),
      endDate: data.end_date ? new Date(data.end_date) : undefined
    };

    setBudgets(prev => [...prev, newBudget]);
  };
  
  const updateBudget = async (updatedBudget: Budget) => {
    if (!session?.user?.id) {
      console.error('User must be authenticated to update budgets');
      return;
    }

    const { error } = await supabase
      .from('budgets')
      .update({
        category_id: updatedBudget.categoryId,
        amount: updatedBudget.amount,
        period: updatedBudget.period,
        start_date: updatedBudget.startDate.toISOString().split('T')[0],
        end_date: updatedBudget.endDate?.toISOString().split('T')[0]
      })
      .eq('id', updatedBudget.id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating budget:', error);
      return;
    }

    setBudgets(prev => 
      prev.map(b => b.id === updatedBudget.id ? updatedBudget : b)
    );
  };
  
  const deleteBudget = async (id: string) => {
    if (!session?.user?.id) {
      console.error('User must be authenticated to delete budgets');
      return;
    }

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error deleting budget:', error);
      return;
    }
    
    setBudgets(prev => prev.filter(b => b.id !== id));
  };
  
  const addAccount = (accountData: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString(),
    };
    setAccounts(prev => [...prev, newAccount]);
  };
  
  const updateAccount = (updatedAccount: Account) => {
    setAccounts(prev => 
      prev.map(a => a.id === updatedAccount.id ? updatedAccount : a)
    );
  };
  
  const deleteAccount = (id: string) => {
    // Don't delete the last account
    if (accounts.length <= 1) {
      console.error("Cannot delete the only account");
      return;
    }
    
    setAccounts(prev => prev.filter(a => a.id !== id));
    
    // If the deleted account was the current one, select the first available account
    if (currentAccount && currentAccount.id === id) {
      const remainingAccounts = accounts.filter(a => a.id !== id);
      setCurrentAccount(remainingAccounts[0]);
    }
  };
  
  const updateTransactionFilters = (filters: Partial<FinanceContextType['transactionFilters']>) => {
    setTransactionFilters(prev => ({ ...prev, ...filters }));
  };
  
  return (
    <FinanceContext.Provider
      value={{
        // Data
        accounts,
        transactions,
        categories,
        budgets,
        summary,
        isLoadingCategories,
        isLoadingBudgets,
        
        // Active states
        currentAccount,
        dateRange,
        
        // Filters
        transactionFilters,
        
        // Actions
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        addBudget,
        updateBudget,
        deleteBudget,
        addAccount,
        updateAccount,
        deleteAccount,
        setCurrentAccount,
        setDateRange,
        setTransactionFilters: updateTransactionFilters,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
