
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, Filter, X, DollarSign, CreditCard, Banknote } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType, PaymentMethod } from '../../types';
import { format } from 'date-fns';

interface ExpensesSummaryProps {
  dateRange: { startDate: Date; endDate: Date };
  filters: {
    categories: string[];
    paymentMethods: string[];
    minAmount: number;
    maxAmount?: number;
  };
  onFilterChange: (filters: any) => void;
}

const ExpensesSummary: React.FC<ExpensesSummaryProps> = ({ 
  dateRange, 
  filters, 
  onFilterChange 
}) => {
  const { transactions, categories, summary } = useFinance();
  
  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => 
    t.date >= dateRange.startDate && 
    t.date <= dateRange.endDate
  );
  
  // Calculate totals
  const totalExpenses = filteredTransactions
    .filter(t => t.category.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = filteredTransactions
    .filter(t => t.category.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netAmount = totalIncome - totalExpenses;
  
  // Count transactions by payment method
  const paymentMethodCounts = filteredTransactions.reduce((counts: Record<string, number>, t) => {
    counts[t.paymentMethod] = (counts[t.paymentMethod] || 0) + 1;
    return counts;
  }, {});
  
  // Handle filter changes
  const handleCategoryFilterChange = (categoryId: string) => {
    const updatedCategories = filters.categories.includes(categoryId)
      ? filters.categories.filter(id => id !== categoryId)
      : [...filters.categories, categoryId];
    
    onFilterChange({
      ...filters,
      categories: updatedCategories
    });
  };
  
  const handlePaymentMethodFilterChange = (method: string) => {
    const updatedMethods = filters.paymentMethods.includes(method)
      ? filters.paymentMethods.filter(m => m !== method)
      : [...filters.paymentMethods, method];
    
    onFilterChange({
      ...filters,
      paymentMethods: updatedMethods
    });
  };
  
  const handleMinAmountChange = (value: string) => {
    onFilterChange({
      ...filters,
      minAmount: value ? parseFloat(value) : 0
    });
  };
  
  const handleMaxAmountChange = (value: string) => {
    onFilterChange({
      ...filters,
      maxAmount: value ? parseFloat(value) : undefined
    });
  };
  
  const clearFilters = () => {
    onFilterChange({
      categories: [],
      paymentMethods: [],
      minAmount: 0,
      maxAmount: undefined
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500 flex items-center">
                <DollarSign className="mr-1 h-5 w-5" />
                {totalIncome.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                For period {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500 flex items-center">
                <DollarSign className="mr-1 h-5 w-5" />
                {totalExpenses.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                For period {format(dateRange.startDate, 'MMM d, yyyy')} - {format(dateRange.endDate, 'MMM d, yyyy')}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center ${netAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                <DollarSign className="mr-1 h-5 w-5" />
                {Math.abs(netAmount).toFixed(2)}
                {netAmount >= 0 ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {netAmount >= 0 ? 'Surplus' : 'Deficit'} for this period
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Methods Usage</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            {Object.entries(PaymentMethod).map(([key, value]) => {
              const count = paymentMethodCounts[value] || 0;
              const total = filteredTransactions
                .filter(t => t.paymentMethod === value)
                .reduce((sum, t) => sum + t.amount, 0);
              
              let icon;
              switch (value) {
                case PaymentMethod.CREDIT_CARD:
                case PaymentMethod.DEBIT_CARD:
                  icon = <CreditCard className="h-4 w-4" />;
                  break;
                case PaymentMethod.CASH:
                  icon = <Banknote className="h-4 w-4" />;
                  break;
                default:
                  icon = <DollarSign className="h-4 w-4" />;
              }
              
              return (
                <div key={key} className="flex flex-col items-center justify-center bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <span className="font-medium">{key}</span>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">${total.toFixed(2)}</div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Filters</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="h-8 px-2 text-muted-foreground"
              >
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Amount Range</h3>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    className="pl-7"
                    value={filters.minAmount || ''}
                    onChange={(e) => handleMinAmountChange(e.target.value)}
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <div className="relative flex-1">
                  <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    className="pl-7"
                    value={filters.maxAmount || ''}
                    onChange={(e) => handleMaxAmountChange(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <Badge 
                    key={category.id}
                    variant={filters.categories.includes(category.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCategoryFilterChange(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div>
              <h3 className="text-sm font-medium mb-2">Payment Methods</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PaymentMethod).map(([key, value]) => (
                  <Badge 
                    key={key}
                    variant={filters.paymentMethods.includes(value) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handlePaymentMethodFilterChange(value)}
                  >
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExpensesSummary;
