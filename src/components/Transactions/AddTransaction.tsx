
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Image, 
  Mic,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { PaymentMethod, TransactionType } from '../../types';

interface AddTransactionProps {
  type: TransactionType;
  onClose: () => void;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ type, onClose }) => {
  const { categories, accounts, addTransaction } = useFinance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.CASH);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  
  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === type);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = categories.find(c => c.id === category);
    if (!selectedCategory) return;
    
    const newTransaction = {
      amount: parseFloat(amount),
      description,
      category: selectedCategory,
      date,
      paymentMethod,
      recurring,
      recurringInterval: recurring ? recurringInterval : undefined,
      notes: notes || undefined,
      receiptImage: undefined, // For a real app, this would be handled by an image upload
    };
    
    addTransaction(newTransaction);
    onClose();
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
  
  const handleDateSelect = () => {
    // In a real app, this would open a date picker
    // For now, we'll just set it to today
    setDate(new Date());
  };
  
  const handleTimeSelect = () => {
    // In a real app, this would open a time picker
    // For now, we'll just set it to now
    setDate(new Date());
  };
  
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <header className={`py-4 px-5 text-white flex items-center ${
        type === TransactionType.INCOME ? 'bg-green-500' : 'bg-red-500'
      }`}>
        <button onClick={onClose} className="mr-3">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-semibold text-lg">
          Add {type === TransactionType.INCOME ? 'Income' : 'Expense'}
        </h1>
      </header>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Amount Input */}
          <div className="mb-6">
            <label className={`block mb-2 text-sm font-medium ${
              type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
            }`}>
              {type === TransactionType.INCOME ? 'Income' : 'Expense'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                className="w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                step="0.01"
                min="0.01"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
              >
                <span className="text-xs py-1 px-2 bg-gray-100 rounded">
                  USD
                </span>
              </button>
            </div>
          </div>
          
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Category
            </label>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 border rounded-lg"
              onClick={() => {
                // In a real app, this would open a category selector
                if (filteredCategories.length > 0) {
                  setCategory(filteredCategories[0].id);
                }
              }}
            >
              <div className="flex items-center">
                {category ? (
                  <>
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ 
                        backgroundColor: filteredCategories.find(c => c.id === category)?.color || '#999' 
                      }}
                    >
                      <span className="text-white text-xs">
                        {filteredCategories.find(c => c.id === category)?.name.charAt(0) || '?'}
                      </span>
                    </div>
                    <span>{filteredCategories.find(c => c.id === category)?.name || 'Select Category'}</span>
                  </>
                ) : (
                  <span className="text-gray-500">Select Category</span>
                )}
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
          
          {/* Payment Method */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Payment Method
            </label>
            <button
              type="button"
              className="w-full flex items-center justify-between p-3 border rounded-lg"
              onClick={() => {
                // In a real app, this would open a payment method selector
                // Cycle through payment methods for demonstration
                const methods = Object.values(PaymentMethod);
                const currentIndex = methods.indexOf(paymentMethod);
                const nextIndex = (currentIndex + 1) % methods.length;
                setPaymentMethod(methods[nextIndex]);
              }}
            >
              <span>{paymentMethod}</span>
              <ChevronRight size={18} className="text-gray-400" />
            </button>
          </div>
          
          {/* Description */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Description
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
              >
                <Mic size={18} />
              </button>
            </div>
          </div>
          
          {/* Date and Time */}
          <div className="mb-6 flex space-x-4">
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Date
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between p-3 border rounded-lg"
                onClick={handleDateSelect}
              >
                <div className="flex items-center">
                  <Calendar size={18} className="text-gray-500 mr-2" />
                  <span>{formatDate(date)}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Time
              </label>
              <button
                type="button"
                className="w-full flex items-center justify-between p-3 border rounded-lg"
                onClick={handleTimeSelect}
              >
                <div className="flex items-center">
                  <Clock size={18} className="text-gray-500 mr-2" />
                  <span>{formatTime(date)}</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Recurring Transaction */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Recurring Transaction
              </label>
              <div className="relative inline-block w-10 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={recurring}
                  onChange={() => setRecurring(!recurring)}
                  className="sr-only"
                />
                <label
                  htmlFor="recurring"
                  className={`block h-6 rounded-full w-10 cursor-pointer transition-colors duration-200 ease-in ${
                    recurring ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`block h-6 w-6 rounded-full bg-white shadow transform transition-transform duration-200 ease-in ${
                      recurring ? 'translate-x-4' : ''
                    }`}
                  ></span>
                </label>
              </div>
            </div>
            
            {recurring && (
              <div className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center mb-2">
                  <RefreshCw size={16} className="text-blue-500 mr-2" />
                  <span className="text-sm font-medium">Repeat Interval</span>
                </div>
                <div className="flex space-x-2">
                  {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((interval) => (
                    <button
                      key={interval}
                      type="button"
                      className={`py-1 px-3 text-sm rounded-full ${
                        recurringInterval === interval 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setRecurringInterval(interval)}
                    >
                      {interval.charAt(0).toUpperCase() + interval.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Notes (Optional)
            </label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          
          {/* Receipt Image Upload */}
          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Attach Receipt (Optional)
            </label>
            <button
              type="button"
              className="w-full flex items-center justify-center p-4 border border-dashed rounded-lg text-gray-500"
            >
              <Image size={20} className="mr-2" />
              <span>Add receipt image</span>
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="sticky bottom-0 p-4 bg-white border-t">
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              type === TransactionType.INCOME ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            Save {type === TransactionType.INCOME ? 'Income' : 'Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransaction;
