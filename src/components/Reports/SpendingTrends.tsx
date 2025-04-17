
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types';
import { 
  format, 
  eachDayOfInterval, 
  eachWeekOfInterval, 
  eachMonthOfInterval,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isSameWeek,
  isSameMonth
} from 'date-fns';

interface SpendingTrendsProps {
  dateRange: { startDate: Date; endDate: Date };
}

const SpendingTrends: React.FC<SpendingTrendsProps> = ({ dateRange }) => {
  const { transactions } = useFinance();
  
  // Filter transactions by date range
  const filteredTransactions = transactions.filter(t => 
    t.date >= dateRange.startDate && 
    t.date <= dateRange.endDate
  );
  
  // Prepare data for different time intervals
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate
    });
    
    return days.map(day => {
      const dayTransactions = filteredTransactions.filter(t => 
        isSameDay(t.date, day)
      );
      
      const income = dayTransactions
        .filter(t => t.category.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = dayTransactions
        .filter(t => t.category.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(day, 'MMM dd'),
        income,
        expense,
        net: income - expense
      };
    });
  }, [filteredTransactions, dateRange]);
  
  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate
    }, { weekStartsOn: 1 });
    
    return weeks.map(week => {
      const weekStart = startOfWeek(week, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
      
      const weekTransactions = filteredTransactions.filter(t => 
        t.date >= weekStart && t.date <= weekEnd
      );
      
      const income = weekTransactions
        .filter(t => t.category.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = weekTransactions
        .filter(t => t.category.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`,
        income,
        expense,
        net: income - expense
      };
    });
  }, [filteredTransactions, dateRange]);
  
  const monthlyData = useMemo(() => {
    const months = eachMonthOfInterval({
      start: dateRange.startDate,
      end: dateRange.endDate
    });
    
    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = filteredTransactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      
      const income = monthTransactions
        .filter(t => t.category.type === TransactionType.INCOME)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expense = monthTransactions
        .filter(t => t.category.type === TransactionType.EXPENSE)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        date: format(month, 'MMM yyyy'),
        income,
        expense,
        net: income - expense
      };
    });
  }, [filteredTransactions, dateRange]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="line">Line Chart</TabsTrigger>
              <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            </TabsList>
            
            <Tabs defaultValue="daily" className="w-auto">
              <TabsList>
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
              
              <TabsContent value="daily">
                <ChartRenderer chartType="line" data={dailyData} />
                <ChartRenderer chartType="bar" data={dailyData} />
              </TabsContent>
              
              <TabsContent value="weekly">
                <ChartRenderer chartType="line" data={weeklyData} />
                <ChartRenderer chartType="bar" data={weeklyData} />
              </TabsContent>
              
              <TabsContent value="monthly">
                <ChartRenderer chartType="line" data={monthlyData} />
                <ChartRenderer chartType="bar" data={monthlyData} />
              </TabsContent>
            </Tabs>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface ChartRendererProps {
  chartType: 'line' | 'bar';
  data: any[];
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ chartType, data }) => {
  return (
    <TabsContent value={chartType} className="mt-0">
      <div className="h-[400px] mt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Income" 
                stroke="#8BC34A" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Expense" 
                stroke="#FF5252" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
              <Line 
                type="monotone" 
                dataKey="net" 
                name="Net" 
                stroke="#03A9F4" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="income" name="Income" fill="#8BC34A" />
              <Bar dataKey="expense" name="Expense" fill="#FF5252" />
              <Bar dataKey="net" name="Net" fill="#03A9F4" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </TabsContent>
  );
};

export default SpendingTrends;
