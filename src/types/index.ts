
export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense"
}

export enum PaymentMethod {
  CASH = "cash",
  CREDIT_CARD = "creditCard",
  DEBIT_CARD = "debitCard",
  BANK_TRANSFER = "bankTransfer",
  MOBILE_PAYMENT = "mobilePayment",
  OTHER = "other"
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: Category;
  date: Date;
  paymentMethod: PaymentMethod;
  recurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  receiptImage?: string;
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  color: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  previousBalance: number;
  budgets: {
    categoryId: string;
    allocated: number;
    spent: number;
    remaining: number;
  }[];
  categoryBreakdown: {
    categoryId: string;
    amount: number;
    percentage: number;
  }[];
}
