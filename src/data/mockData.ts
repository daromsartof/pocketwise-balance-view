
import { Account, Budget, Category, PaymentMethod, Transaction, TransactionType } from "../types";

const today = new Date();
const currentMonth = today.getMonth();
const currentYear = today.getFullYear();

// Create a date with specific day in current month
const dateInCurrentMonth = (day: number) => {
  return new Date(currentYear, currentMonth, day);
};

// Expense Categories
export const expenseCategories: Category[] = [
  { id: "1", name: "Food & Drinks", icon: "utensils", color: "#FF5252", type: TransactionType.EXPENSE },
  { id: "2", name: "Shopping", icon: "shopping-cart", color: "#FF9800", type: TransactionType.EXPENSE },
  { id: "3", name: "Housing", icon: "home", color: "#9C27B0", type: TransactionType.EXPENSE },
  { id: "4", name: "Transportation", icon: "car", color: "#03A9F4", type: TransactionType.EXPENSE },
  { id: "5", name: "Entertainment", icon: "film", color: "#E91E63", type: TransactionType.EXPENSE },
  { id: "6", name: "Health", icon: "medical-services", color: "#00BCD4", type: TransactionType.EXPENSE },
  { id: "7", name: "Personal Care", icon: "self-care", color: "#8BC34A", type: TransactionType.EXPENSE },
  { id: "8", name: "Education", icon: "school", color: "#3F51B5", type: TransactionType.EXPENSE },
  { id: "9", name: "Pets", icon: "pets", color: "#795548", type: TransactionType.EXPENSE },
  { id: "10", name: "Insurance", icon: "shield", color: "#607D8B", type: TransactionType.EXPENSE },
];

// Income Categories
export const incomeCategories: Category[] = [
  { id: "11", name: "Salary", icon: "wallet", color: "#4CAF50", type: TransactionType.INCOME },
  { id: "12", name: "Freelance", icon: "briefcase", color: "#8BC34A", type: TransactionType.INCOME },
  { id: "13", name: "Investments", icon: "trending-up", color: "#009688", type: TransactionType.INCOME },
  { id: "14", name: "Gifts", icon: "gift", color: "#FFC107", type: TransactionType.INCOME },
];

export const categories = [...expenseCategories, ...incomeCategories];

// Accounts
export const accounts: Account[] = [
  { id: "1", name: "Cash", balance: 2500, currency: "USD", color: "#4CAF50" },
  { id: "2", name: "Bank Account", balance: 7800, currency: "USD", color: "#2196F3" },
  { id: "3", name: "Credit Card", balance: -350, currency: "USD", color: "#F44336" },
];

// Transactions
export const transactions: Transaction[] = [
  {
    id: "1",
    amount: 2000,
    description: "Monthly Salary",
    category: incomeCategories[0],
    date: dateInCurrentMonth(1),
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    recurring: true,
    recurringInterval: "monthly",
  },
  {
    id: "2",
    amount: 900,
    description: "Rent",
    category: expenseCategories[2],
    date: dateInCurrentMonth(1),
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    recurring: true,
    recurringInterval: "monthly",
  },
  {
    id: "3",
    amount: 100,
    description: "Car Insurance",
    category: expenseCategories[9],
    date: dateInCurrentMonth(3),
    paymentMethod: PaymentMethod.CREDIT_CARD,
    recurring: true,
    recurringInterval: "monthly",
  },
  {
    id: "4",
    amount: 700,
    description: "Health Insurance",
    category: expenseCategories[9],
    date: dateInCurrentMonth(5),
    paymentMethod: PaymentMethod.CASH,
    recurring: false,
  },
  {
    id: "5",
    amount: 85,
    description: "Groceries",
    category: expenseCategories[0],
    date: dateInCurrentMonth(6),
    paymentMethod: PaymentMethod.CREDIT_CARD,
    recurring: false,
    notes: "Weekly shopping"
  },
  {
    id: "6",
    amount: 45,
    description: "Gas",
    category: expenseCategories[3],
    date: dateInCurrentMonth(8),
    paymentMethod: PaymentMethod.DEBIT_CARD,
    recurring: false,
  },
  {
    id: "7",
    amount: 35,
    description: "Movie tickets",
    category: expenseCategories[4],
    date: dateInCurrentMonth(10),
    paymentMethod: PaymentMethod.CASH,
    recurring: false,
  },
  {
    id: "8",
    amount: 200,
    description: "Freelance work",
    category: incomeCategories[1],
    date: dateInCurrentMonth(12),
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    recurring: false,
  },
  {
    id: "9",
    amount: 62,
    description: "Pharmacy",
    category: expenseCategories[5],
    date: dateInCurrentMonth(15),
    paymentMethod: PaymentMethod.DEBIT_CARD,
    recurring: false,
  },
  {
    id: "10",
    amount: 120,
    description: "Pet food and toys",
    category: expenseCategories[8],
    date: dateInCurrentMonth(18),
    paymentMethod: PaymentMethod.CREDIT_CARD,
    recurring: false,
  },
  {
    id: "11",
    amount: 500,
    description: "Investment dividend",
    category: incomeCategories[2],
    date: dateInCurrentMonth(20),
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    recurring: false,
  },
  {
    id: "12",
    amount: 75,
    description: "Dinner with friends",
    category: expenseCategories[0],
    date: dateInCurrentMonth(22),
    paymentMethod: PaymentMethod.CREDIT_CARD,
    recurring: false,
  },
  {
    id: "13",
    amount: 150,
    description: "New clothes",
    category: expenseCategories[1],
    date: dateInCurrentMonth(25),
    paymentMethod: PaymentMethod.CREDIT_CARD,
    recurring: false,
  },
  {
    id: "14",
    amount: 300,
    description: "Gift from parents",
    category: incomeCategories[3],
    date: dateInCurrentMonth(27),
    paymentMethod: PaymentMethod.CASH,
    recurring: false,
  },
];

// Budgets
export const budgets: Budget[] = [
  {
    id: "1",
    categoryId: "1", // Food & Drinks
    amount: 600,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1),
  },
  {
    id: "2",
    categoryId: "3", // Housing
    amount: 1000,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1),
  },
  {
    id: "3",
    categoryId: "4", // Transportation
    amount: 300,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1),
  },
  {
    id: "4",
    categoryId: "5", // Entertainment
    amount: 200,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1),
  },
  {
    id: "5",
    categoryId: "2", // Shopping
    amount: 400,
    period: "monthly",
    startDate: new Date(currentYear, currentMonth, 1),
  },
];

// Helper functions
export const calculateTotalIncome = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.category.type === TransactionType.INCOME)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

export const calculateTotalExpense = (transactions: Transaction[]): number => {
  return transactions
    .filter(t => t.category.type === TransactionType.EXPENSE)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

export const calculateBalance = (transactions: Transaction[]): number => {
  return calculateTotalIncome(transactions) - calculateTotalExpense(transactions);
};

export const getCategoryExpenses = (transactions: Transaction[], categoryId: string): number => {
  return transactions
    .filter(t => t.category.id === categoryId)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
};

export const getFilteredTransactions = (
  transactions: Transaction[],
  filters: {
    startDate?: Date;
    endDate?: Date;
    categoryIds?: string[];
    paymentMethods?: PaymentMethod[];
    type?: TransactionType;
    searchText?: string;
    minAmount?: number;
    maxAmount?: number;
  }
): Transaction[] => {
  return transactions.filter(transaction => {
    // Date filter
    if (filters.startDate && transaction.date < filters.startDate) return false;
    if (filters.endDate && transaction.date > filters.endDate) return false;
    
    // Category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      if (!filters.categoryIds.includes(transaction.category.id)) return false;
    }
    
    // Payment method filter
    if (filters.paymentMethods && filters.paymentMethods.length > 0) {
      if (!filters.paymentMethods.includes(transaction.paymentMethod)) return false;
    }
    
    // Transaction type filter
    if (filters.type && transaction.category.type !== filters.type) return false;
    
    // Search text filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const descriptionMatch = transaction.description.toLowerCase().includes(searchLower);
      const notesMatch = transaction.notes ? transaction.notes.toLowerCase().includes(searchLower) : false;
      if (!descriptionMatch && !notesMatch) return false;
    }
    
    // Amount range filter
    if (filters.minAmount !== undefined && transaction.amount < filters.minAmount) return false;
    if (filters.maxAmount !== undefined && transaction.amount > filters.maxAmount) return false;
    
    return true;
  });
};

export const getBudgetStatus = (budget: Budget, transactions: Transaction[]): { spent: number; remaining: number; percentage: number } => {
  const spent = transactions
    .filter(t => t.category.id === budget.categoryId &&
      t.date >= budget.startDate &&
      (budget.endDate ? t.date <= budget.endDate : true))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const remaining = budget.amount - spent;
  const percentage = (spent / budget.amount) * 100;
  
  return { spent, remaining, percentage };
};

export const getCategoryBreakdown = (transactions: Transaction[], type: TransactionType): { category: Category; amount: number; percentage: number }[] => {
  const filteredTransactions = transactions.filter(t => t.category.type === type);
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Group by category
  const categoryMap = new Map<string, { category: Category; amount: number }>();
  
  filteredTransactions.forEach(transaction => {
    const { category, amount } = transaction;
    
    if (categoryMap.has(category.id)) {
      const existing = categoryMap.get(category.id)!;
      existing.amount += amount;
      categoryMap.set(category.id, existing);
    } else {
      categoryMap.set(category.id, { category, amount });
    }
  });
  
  // Convert to array and calculate percentages
  return Array.from(categoryMap.values())
    .map(item => ({
      ...item,
      percentage: total > 0 ? (item.amount / total) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
};
