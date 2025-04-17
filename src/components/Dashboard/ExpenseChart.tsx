
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TransactionType } from '../../types';

const COLORS = [
  '#FF5252', '#FF9800', '#9C27B0', '#03A9F4', 
  '#E91E63', '#00BCD4', '#8BC34A', '#3F51B5', 
  '#795548', '#607D8B'
];

const ExpenseChart: React.FC = () => {
  const { transactions, categories } = useFinance();
  
  // Filter expense transactions
  const expenseTransactions = transactions.filter(
    t => t.category.type === TransactionType.EXPENSE
  );
  
  // Group expenses by category
  const categoryMap = new Map();
  expenseTransactions.forEach(transaction => {
    const { category, amount } = transaction;
    const current = categoryMap.get(category.id) || 0;
    categoryMap.set(category.id, current + amount);
  });
  
  // Convert to array and format for chart
  const chartData = Array.from(categoryMap.entries())
    .map(([categoryId, amount]) => {
      const category = categories.find(c => c.id === categoryId);
      return {
        name: category ? category.name : 'Unknown',
        value: amount,
        color: category ? category.color : '#999'
      };
    })
    .sort((a, b) => b.value - a.value);
  
  const totalExpense = chartData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-sm text-gray-500 mb-4">Expense Breakdown</h2>
      
      <div className="h-64">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                paddingAngle={1}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                labelFormatter={(name) => `Category: ${name}`}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            No expense data to display
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <div className="mb-2 text-sm font-medium">Top Expenses</div>
        <div className="space-y-2">
          {chartData.slice(0, 3).map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm">{item.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">${item.value.toFixed(2)}</span>
                <span className="text-xs text-gray-500">
                  {((item.value / totalExpense) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseChart;
