import React, { useState, useEffect } from 'react';
import { useFinance, FinanceProvider } from '../context/FinanceContext';
import { useLocation } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  PaymentMethod, 
  TransactionType,
  Transaction as TransactionInterface 
} from '../types';
import { 
  Search, 
  Filter, 
  ArrowDown, 
  ArrowUp, 
  Calendar,
  Banknote, 
  CreditCard, 
  Landmark, 
  Smartphone
} from 'lucide-react';
import AddTransaction from '../components/Transactions/AddTransaction';
import { formatDate } from '../utils/dateUtils';

// Component that uses the FinanceContext, wrapped in the provider
const TransactionsContent: React.FC = () => {
  const { transactions } = useFinance();
  const [searchText, setSearchText] = useState('');
  const [addingTransaction, setAddingTransaction] = useState<TransactionType | null>(null);
  const location = useLocation();
  
  // Check if we navigated here with the intent to add a transaction
  useEffect(() => {
    if (location.state && location.state.addingTransaction) {
      setAddingTransaction(location.state.addingTransaction);
      // Clear the state to prevent reopening on route changes
      history.replaceState({}, document.title);
    }
  }, [location]);
  
  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Filter transactions by search text
  const filteredTransactions = sortedTransactions.filter(transaction => 
    transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
    transaction.category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (transaction.notes && transaction.notes.toLowerCase().includes(searchText.toLowerCase()))
  );
  
  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH:
        return <Banknote size={16} className="text-green-500" />;
      case PaymentMethod.CREDIT_CARD:
      case PaymentMethod.DEBIT_CARD:
        return <CreditCard size={16} className="text-blue-500" />;
      case PaymentMethod.BANK_TRANSFER:
        return <Landmark size={16} className="text-purple-500" />;
      case PaymentMethod.MOBILE_PAYMENT:
        return <Smartphone size={16} className="text-orange-500" />;
      default:
        return <Banknote size={16} className="text-gray-500" />;
    }
  };
  
  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setAddingTransaction(TransactionType.INCOME)}
              className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Ajouter un revenu
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setAddingTransaction(TransactionType.EXPENSE)}
              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Ajouter une dépense
            </Button>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher des transactions..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
              <Button variant="outline" className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Période
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Transactions Table */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-lg">Liste des transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: transaction.category.color }}
                          >
                            <span className="text-white text-xs">
                              {transaction.category.name.charAt(0)}
                            </span>
                          </div>
                          {transaction.category.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="capitalize text-sm">
                            {transaction.paymentMethod}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        transaction.category.type === TransactionType.INCOME
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.category.type === TransactionType.INCOME ? '+' : '-'}
                        {transaction.amount.toFixed(2)} €
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Aucune transaction trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction Form Modal */}
      {addingTransaction !== null && (
        <AddTransaction 
          type={addingTransaction} 
          onClose={() => setAddingTransaction(null)} 
        />
      )}
    </MainLayout>
  );
};

// Wrapper component that provides the FinanceContext
const Transactions: React.FC = () => {
  return (
    <FinanceProvider>
      <TransactionsContent />
    </FinanceProvider>
  );
};

export default Transactions;
