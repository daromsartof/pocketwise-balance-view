
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import DateRangeFilter from './DateRangeFilter';
import ExpensesSummary from './ExpensesSummary';
import SpendingTrends from './SpendingTrends';
import CategoryBreakdown from './CategoryBreakdown';
import AIInsights from './AIInsights';
import ReportExport from './ReportExport';
import { useFinance } from '../../context/FinanceContext';

const ReportsContent: React.FC = () => {
  const { dateRange, setDateRange } = useFinance();
  const [activeFilters, setActiveFilters] = useState({
    categories: [] as string[],
    paymentMethods: [] as string[],
    minAmount: 0,
    maxAmount: undefined as number | undefined,
  });

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Financial Reports</h1>
          <p className="text-muted-foreground">Analyze your spending patterns and get insights</p>
        </div>
        <DateRangeFilter currentRange={dateRange} onRangeChange={setDateRange} />
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary">
          <ExpensesSummary 
            dateRange={dateRange} 
            filters={activeFilters} 
            onFilterChange={setActiveFilters} 
          />
        </TabsContent>
        
        <TabsContent value="trends">
          <SpendingTrends dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="categories">
          <CategoryBreakdown dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="insights">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardContent className="pt-6">
                <AIInsights dateRange={dateRange} />
              </CardContent>
            </Card>
            <ReportExport />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsContent;
