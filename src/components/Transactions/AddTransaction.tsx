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
  const { categories, addTransaction } = useFinance();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
    console.log("type ", type)
    
  // Filter categories by type
  const filteredCategories = categories.filter(c => c.type === type);
  console.log("filteredCategories ", filteredCategories)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) {
      alert('Veuillez sélectionner une catégorie');
      return;
    }
    
    const selectedCategory = categories.find(c => c.id === categoryId);
    console.log("selectedCategory ", selectedCategory)
    if (!selectedCategory) {
      alert('Catégorie non trouvée');
      return;
    }
    
    try {
    console.log({
    amount: parseFloat(amount),
        description,
        category_id: categoryId,
        date,
        paymentMethod,
        recurring,
        recurringInterval: recurring ? recurringInterval : undefined,
        notes: notes || undefined,
        receiptImage: undefined})
    
      await addTransaction({
        amount: parseFloat(amount),
        description,
        category: selectedCategory,
        date: new Date(date).toISOString(),
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
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };
  
  const handleDateSelect = () => {
    const input = document.createElement('input');
    input.type = 'date';
    input.value = date;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      setDate(target.value);
    };
    input.click();
  };
  
  const handleTimeSelect = () => {
    const input = document.createElement('input');
    input.type = 'time';
    input.value = new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      const [hours, minutes] = target.value.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      setDate(newDate.toISOString().split('T')[0]);
    };
    input.click();
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
                Heure
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
          <button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
              type === TransactionType.INCOME ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            Enregistrer {type === TransactionType.INCOME ? 'le revenu' : 'la dépense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransaction;
