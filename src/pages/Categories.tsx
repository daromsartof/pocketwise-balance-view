
import React, { useState } from 'react';
import { useFinance, FinanceProvider } from '../context/FinanceContext';
import MainLayout from '../components/MainLayout';
import { Button } from '@/components/ui/button';
import { Category, TransactionType } from '../types';
import { Plus } from 'lucide-react';
import CategoryList from '../components/Categories/CategoryList';
import CategoryForm from '../components/Categories/CategoryForm';

// This component needs to be inside the FinanceProvider
const CategoriesContent: React.FC = () => {
  const { categories } = useFinance();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [activeType, setActiveType] = useState<TransactionType>(TransactionType.EXPENSE);

  // Filtrer les catégories par type
  const filteredCategories = categories.filter(c => c.type === activeType);

  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Gérer les catégories</h1>
          <Button 
            onClick={() => setIsAddingCategory(true)} 
            className="flex items-center"
          >
            <Plus size={18} className="mr-1" /> Ajouter une catégorie
          </Button>
        </div>

        {/* Sélecteur de type */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            className={`px-4 py-2 rounded-md ${activeType === TransactionType.EXPENSE ? 'bg-white text-finance-red shadow-sm' : 'text-gray-600'}`}
            onClick={() => setActiveType(TransactionType.EXPENSE)}
          >
            Dépenses
          </button>
          <button
            className={`px-4 py-2 rounded-md ${activeType === TransactionType.INCOME ? 'bg-white text-finance-green shadow-sm' : 'text-gray-600'}`}
            onClick={() => setActiveType(TransactionType.INCOME)}
          >
            Revenus
          </button>
        </div>
        
        <CategoryList 
          categories={filteredCategories} 
          onEdit={setEditingCategory} 
        />
      </div>

      {/* Formulaire d'ajout/modification */}
      {(isAddingCategory || editingCategory) && (
        <CategoryForm 
          category={editingCategory}
          type={activeType}
          onClose={() => {
            setIsAddingCategory(false);
            setEditingCategory(null);
          }}
        />
      )}
    </MainLayout>
  );
};

// Wrapper component that provides the FinanceContext
const Categories: React.FC = () => {
  return (
    <FinanceProvider>
      <CategoriesContent />
    </FinanceProvider>
  );
};

export default Categories;
