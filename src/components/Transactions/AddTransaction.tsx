
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Image, 
  Mic,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { PaymentMethod, TransactionType } from '../../types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AddTransactionProps {
  type: TransactionType;
  onClose: () => void;
}

const AddTransaction: React.FC<AddTransactionProps> = ({ type, onClose }) => {
  const { categories, addTransaction } = useFinance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimePopoverOpen, setIsTimePopoverOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>(
    format(new Date(), 'HH:mm')
  );
    
  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === type);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }
    
    const selectedCategory = categories.find(c => c.id === categoryId);
    if (!selectedCategory) {
      alert('Catégorie non trouvée');
      return;
    }
    
    try {
      // Combine date and time
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const transactionDate = new Date(selectedDate);
      transactionDate.setHours(hours, minutes, 0, 0);
      
      await addTransaction({
        amount: parseFloat(amount),
        description,
        category: selectedCategory,
        date: transactionDate.toISOString(),
        paymentMethod,
        recurring,
        recurringInterval: recurring ? recurringInterval : undefined,
        notes: notes || undefined,
        receiptImage: undefined
      });
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la transaction:', error);
      alert('Une erreur est survenue lors de l\'ajout de la transaction');
    }
  };
  
  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
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
          Ajouter {type === TransactionType.INCOME ? 'un revenu' : 'une dépense'}
        </h1>
      </header>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* Amount Input */}
          <div className="mb-6">
            <label className={`block mb-2 text-sm font-medium ${
              type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
            }`}>
              {type === TransactionType.INCOME ? 'Revenu' : 'Dépense'}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">€</span>
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
                  EUR
                </span>
              </button>
            </div>
          </div>
          
          {/* Category Selection */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Catégorie
            </label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              {filteredCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Payment Method */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Mode de paiement
            </label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              required
            >
              {Object.values(PaymentMethod).map(method => (
                <option key={method} value={method}>
                  {method === PaymentMethod.CASH ? 'Espèces' : 
                   method === PaymentMethod.CREDIT_CARD ? 'Carte de crédit' :
                   method === PaymentMethod.DEBIT_CARD ? 'Carte de débit' :
                   method === PaymentMethod.BANK_TRANSFER ? 'Virement bancaire' :
                   method === PaymentMethod.MOBILE_PAYMENT ? 'Paiement mobile' : 'Autre'}
                </option>
              ))}
            </select>
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
                placeholder="Entrer une description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
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
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <CalendarIcon size={18} className="text-gray-500 mr-2" />
                      <span>{formatDateDisplay(selectedDate)}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setIsCalendarOpen(false);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex-1">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Heure
              </label>
              <Popover open={isTimePopoverOpen} onOpenChange={setIsTimePopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center">
                      <Clock size={18} className="text-gray-500 mr-2" />
                      <span>{selectedTime}</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-400" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Sélectionner l'heure</label>
                    <input
                      type="time"
                      className="p-2 border rounded-lg"
                      value={selectedTime}
                      onChange={handleTimeChange}
                    />
                    <Button 
                      type="button"
                      className="mt-2"
                      variant="default"
                      onClick={() => setIsTimePopoverOpen(false)}
                    >
                      Confirmer
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Recurring Transaction */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Transaction récurrente
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
                  <span className="text-sm font-medium">Intervalle de répétition</span>
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
                      {interval === 'daily' ? 'Quotidien' :
                       interval === 'weekly' ? 'Hebdomadaire' :
                       interval === 'monthly' ? 'Mensuel' : 'Annuel'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Notes */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Notes (Optionnel)
            </label>
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ajouter des notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
          
          {/* Receipt Image Upload */}
          <div className="mb-8">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Joindre un reçu (Optionnel)
            </label>
            <button
              type="button"
              className="w-full flex items-center justify-center p-4 border border-dashed rounded-lg text-gray-500"
            >
              <Image size={20} className="mr-2" />
              <span>Ajouter une image de reçu</span>
            </button>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="sticky bottom-0 p-4 bg-white border-t">
          <Button
            type="submit"
            variant="default"
            className={`w-full ${
              type === TransactionType.INCOME ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            Enregistrer {type === TransactionType.INCOME ? 'le revenu' : 'la dépense'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTransaction;
