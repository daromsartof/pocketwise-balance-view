
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { Bot, Send, Sparkles, AlertCircle, Download, MessageSquare, TrendingUp, ArrowUpDown, DollarSign } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { TransactionType } from '../../types';

interface AIInsightsProps {
  dateRange: { startDate: Date; endDate: Date };
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface Insight {
  id: string;
  title: string;
  content: string;
  type: 'tip' | 'alert' | 'trend';
  icon: React.ReactNode;
}

const AIInsights: React.FC<AIInsightsProps> = ({ dateRange }) => {
  const { transactions, categories } = useFinance();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      content: 'Hello! I\'m your finance assistant. I can answer questions about your spending patterns and offer suggestions to optimize your finances. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Generate insights based on the current data
  const insights = React.useMemo(() => {
    // Filter transactions by date range
    const filteredTransactions = transactions.filter(t => 
      t.date >= dateRange.startDate && t.date <= dateRange.endDate
    );
    
    const expenseTransactions = filteredTransactions.filter(
      t => t.category.type === TransactionType.EXPENSE
    );
    
    const insights: Insight[] = [];
    
    // Find most expensive category
    if (expenseTransactions.length > 0) {
      const categoryExpenses = new Map<string, number>();
      
      expenseTransactions.forEach(t => {
        const currentAmount = categoryExpenses.get(t.category.id) || 0;
        categoryExpenses.set(t.category.id, currentAmount + t.amount);
      });
      
      let highestCategoryId = '';
      let highestAmount = 0;
      
      categoryExpenses.forEach((amount, categoryId) => {
        if (amount > highestAmount) {
          highestAmount = amount;
          highestCategoryId = categoryId;
        }
      });
      
      const highestCategory = categories.find(c => c.id === highestCategoryId);
      
      if (highestCategory) {
        insights.push({
          id: '1',
          title: 'Highest Spending Category',
          content: `Your highest expense category for this period is ${highestCategory.name} at $${highestAmount.toFixed(2)}.`,
          type: 'trend',
          icon: <TrendingUp className="h-5 w-5 text-blue-500" />
        });
      }
    }
    
    // Check for recurring expenses
    const recurringExpenses = expenseTransactions.filter(t => t.recurring);
    const recurringTotal = recurringExpenses.reduce((sum, t) => sum + t.amount, 0);
    
    if (recurringExpenses.length > 0) {
      insights.push({
        id: '2',
        title: 'Recurring Expenses',
        content: `You have ${recurringExpenses.length} recurring expenses totaling $${recurringTotal.toFixed(2)} in this period.`,
        type: 'alert',
        icon: <ArrowUpDown className="h-5 w-5 text-orange-500" />
      });
    }
    
    // Potential savings tip
    if (expenseTransactions.length > 5) {
      insights.push({
        id: '3',
        title: 'Saving Opportunity',
        content: 'Consider reviewing your subscriptions and recurring payments to identify potential savings.',
        type: 'tip',
        icon: <Sparkles className="h-5 w-5 text-green-500" />
      });
    }
    
    return insights;
  }, [transactions, categories, dateRange]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    
    // Simulate API call with timeout
    // In a real implementation, this would call an OpenAI API endpoint
    setTimeout(() => {
      let responseText = '';
      
      // Mock responses based on keywords in the user's message
      const lowerCaseInput = input.toLowerCase();
      
      if (lowerCaseInput.includes('spend') && lowerCaseInput.includes('most')) {
        // Find the highest expense category
        const expenseTransactions = transactions.filter(
          t => t.category.type === TransactionType.EXPENSE &&
          t.date >= dateRange.startDate && t.date <= dateRange.endDate
        );
        
        const categoryExpenses = new Map<string, number>();
        
        expenseTransactions.forEach(t => {
          const currentAmount = categoryExpenses.get(t.category.id) || 0;
          categoryExpenses.set(t.category.id, currentAmount + t.amount);
        });
        
        let highestCategoryId = '';
        let highestAmount = 0;
        
        categoryExpenses.forEach((amount, categoryId) => {
          if (amount > highestAmount) {
            highestAmount = amount;
            highestCategoryId = categoryId;
          }
        });
        
        const highestCategory = categories.find(c => c.id === highestCategoryId);
        
        if (highestCategory) {
          responseText = `Based on your transactions from ${format(dateRange.startDate, 'MMM d, yyyy')} to ${format(dateRange.endDate, 'MMM d, yyyy')}, you spent the most on ${highestCategory.name} ($${highestAmount.toFixed(2)}). This represents approximately ${((highestAmount / expenseTransactions.reduce((sum, t) => sum + t.amount, 0)) * 100).toFixed(1)}% of your total expenses during this period.`;
        } else {
          responseText = 'I couldn\'t find any expense data for the selected period.';
        }
      } else if (lowerCaseInput.includes('reduce') || lowerCaseInput.includes('save')) {
        responseText = 'Based on your spending patterns, here are some suggestions to reduce expenses:\n\n1. Consider reviewing your subscriptions and recurring payments. You might be paying for services you rarely use.\n\n2. Look for opportunities to consolidate or refinance debt to reduce interest payments.\n\n3. Plan your grocery shopping with a list to avoid impulse purchases.\n\n4. Set specific savings goals to stay motivated and track your progress regularly.';
      } else if (lowerCaseInput.includes('compare')) {
        responseText = 'To provide a detailed comparison, I would need more historical data. However, based on the trends I can see, your spending patterns are relatively consistent with some potential opportunities for optimization in discretionary categories.';
      } else {
        responseText = 'I\'m still learning how to analyze your specific financial situation. For now, I can tell you that reviewing your transaction history regularly and setting concrete budget goals can help improve your financial health. Is there a specific aspect of your finances you\'d like insights about?';
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: responseText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setLoading(false);
    }, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const exportPdf = () => {
    toast({
      title: "Export Started",
      description: "Your financial report is being prepared for download.",
    });
    
    // In a real implementation, this would generate and download a PDF
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your financial report has been downloaded.",
      });
    }, 2000);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              AI Finance Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about your finances and get personalized insights
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px] px-4">
              <div className="space-y-4 pt-4 pb-6">
                {messages.map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}
                    >
                      {message.sender === 'ai' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-4 w-4" />
                          <span className="text-xs font-medium">Finance Assistant</span>
                        </div>
                      )}
                      <div className="whitespace-pre-line">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1 text-right">
                        {format(message.timestamp, 'h:mm a')}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t p-4">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Ask a question about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 min-h-10 resize-none"
              />
              <Button disabled={loading} onClick={handleSendMessage}>
                {loading ? 'Thinking...' : <Send className="h-4 w-4" />}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Smart Insights
            </CardTitle>
            <CardDescription>
              AI-generated insights based on your financial data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px]">
              <div className="space-y-4">
                {insights.length > 0 ? (
                  insights.map(insight => (
                    <Card key={insight.id} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {insight.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{insight.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{insight.content}</p>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p>Not enough data for the selected period to generate insights.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={exportPdf}>
              <Download className="h-4 w-4 mr-2" />
              Export Insights
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default AIInsights;
