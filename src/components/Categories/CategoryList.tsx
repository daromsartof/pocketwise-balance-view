
import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Category } from '../../types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
}

// Catégories prédéfinies (non supprimables)
const PREDEFINED_CATEGORY_IDS = ['cat_food', 'cat_transport', 'cat_housing', 'cat_utilities', 'cat_entertainment', 'cat_healthcare', 'cat_shopping', 'cat_education', 'cat_salary', 'cat_investment'];

const CategoryList: React.FC<CategoryListProps> = ({ categories, onEdit }) => {
  const { deleteCategory } = useFinance();

  const handleDelete = (category: Category) => {
    // Vérifier si c'est une catégorie prédéfinie
    if (PREDEFINED_CATEGORY_IDS.includes(category.id)) {
      toast({
        title: "Action non autorisée",
        description: "Les catégories prédéfinies ne peuvent pas être supprimées.",
        variant: "destructive"
      });
      return;
    }

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      deleteCategory(category.id);
      toast({
        title: "Catégorie supprimée",
        description: `La catégorie "${category.name}" a été supprimée avec succès.`
      });
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucune catégorie trouvée. Créez-en une nouvelle !
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {categories.map(category => {
        const isPredefined = PREDEFINED_CATEGORY_IDS.includes(category.id);
        
        return (
          <Card key={category.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center p-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3" 
                  style={{ backgroundColor: category.color }}
                >
                  <span className="text-white">{category.icon}</span>
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium">{category.name}</h3>
                  {isPredefined && (
                    <span className="text-xs text-gray-500">Catégorie prédéfinie</span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(category)}
                    disabled={isPredefined}
                    className={isPredefined ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CategoryList;
