
import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Category, TransactionType } from '../../types';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface CategoryFormProps {
  category: Category | null;
  type: TransactionType;
  onClose: () => void;
}

// Liste de couleurs prédéfinies
const COLOR_OPTIONS = [
  "#4CAF50", "#F44336", "#2196F3", "#FF9800", "#9C27B0", 
  "#00BCD4", "#FFEB3B", "#795548", "#607D8B", "#E91E63"
];

// Liste d'icônes (pour simplifier, nous utilisons des caractères)
const ICON_OPTIONS = ["💰", "🍔", "🏠", "🚗", "🎮", "💊", "🛍️", "📚", "💼", "📱", "✈️", "🎵"];

const CategoryForm: React.FC<CategoryFormProps> = ({ category, type, onClose }) => {
  const { addCategory, updateCategory } = useFinance();
  const isEditing = !!category;

  const [formData, setFormData] = useState<{
    name: string;
    icon: string;
    color: string;
  }>({
    name: category?.name || '',
    icon: category?.icon || ICON_OPTIONS[0],
    color: category?.color || COLOR_OPTIONS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la catégorie est requis.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isEditing && category) {
        updateCategory({
          ...category,
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
        });
        toast({
          title: "Catégorie mise à jour",
          description: `La catégorie "${formData.name}" a été mise à jour avec succès.`
        });
      } else {
        addCategory({
          name: formData.name,
          icon: formData.icon,
          color: formData.color,
          type: type,
        });
        toast({
          title: "Catégorie ajoutée",
          description: `La catégorie "${formData.name}" a été ajoutée avec succès.`
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Modifier la catégorie ${category?.name}` : 'Ajouter une nouvelle catégorie'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom de la catégorie</Label>
            <Input 
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Ex: Courses, Restaurant, etc."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label>Couleur</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({...formData, color})}
                />
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Icône</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  className={`w-8 h-8 flex items-center justify-center rounded ${
                    formData.icon === icon 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setFormData({...formData, icon})}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit">
              {isEditing ? 'Mettre à jour' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryForm;
