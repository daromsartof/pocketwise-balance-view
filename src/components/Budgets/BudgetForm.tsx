import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useFinance } from '../../context/FinanceContext';
import { Budget, TransactionType } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

interface BudgetFormProps {
  existingBudget: Budget | null;
  onCancel: () => void;
  onSuccess: () => void;
}

// Define validation schema
const budgetFormSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  period: z.enum(["daily", "weekly", "monthly", "yearly"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export const BudgetForm: React.FC<BudgetFormProps> = ({ 
  existingBudget, 
  onCancel,
  onSuccess
}) => {
  const { categories, addBudget, updateBudget } = useFinance();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter for expense categories only
  const expenseCategories = categories.filter(
    cat => cat.type === TransactionType.EXPENSE
  );

  // Setup form with default values
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: existingBudget ? {
      categoryId: existingBudget.categoryId,
      amount: existingBudget.amount,
      period: existingBudget.period,
      startDate: formatDateForInput(existingBudget.startDate),
      endDate: existingBudget.endDate ? formatDateForInput(existingBudget.endDate) : undefined,
    } : {
      categoryId: expenseCategories.length > 0 ? expenseCategories[0].id : '',
      amount: 0,
      period: 'monthly',
      startDate: formatDateForInput(new Date()),
      endDate: '',
    }
  });

  // Format date for input field (YYYY-MM-DD)
  function formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  }

  const onSubmit = async (data: BudgetFormValues) => {
    try {
      setIsSubmitting(true);
      const budgetData = {
        categoryId: data.categoryId,
        amount: data.amount,
        period: data.period as 'daily' | 'weekly' | 'monthly' | 'yearly',
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      };

      if (existingBudget) {
        await updateBudget({ ...budgetData, id: existingBudget.id });
        toast({
          title: "Budget updated",
          description: "Budget has been successfully updated",
        });
      } else {
        await addBudget(budgetData);
        toast({
          title: "Budget created",
          description: "New budget has been created successfully",
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error("Error saving budget:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the budget",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          {existingBudget ? 'Edit Budget' : 'Create New Budget'}
        </h2>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border rounded bg-background"
                    >
                      {expenseCategories.length > 0 ? (
                        expenseCategories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="">No expense categories available</option>
                      )}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                      <Input {...field} type="number" step="0.01" min="0" className="pl-7" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget Period</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full p-2 border rounded bg-background"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {existingBudget ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  existingBudget ? 'Update Budget' : 'Create Budget'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
