import React from 'react';
import { MenuItem } from '../../types';
import { useCart } from '../../context/CartContext';
import { Plus } from 'lucide-react';
import { ItemCustomizationModal } from './ItemCustomizationModal';

interface MenuGridProps {
  items: MenuItem[];
  loading: boolean;
}

export const MenuGrid: React.FC<MenuGridProps> = ({ items, loading }) => {
  const { addToCart } = useCart();
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-gray-200 dark:bg-gray-800 h-64 rounded-2xl"></div>
      ))}
    </div>;
  }

  const availableItems = items.filter(i => i.isAvailable);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {availableItems.map((item) => (
        <div key={item.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
          <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
            )}
            <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-2 py-1 rounded-lg text-sm font-bold text-gray-900 dark:text-white">
              ${item.price.toFixed(2)}
            </div>
          </div>
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 flex-1">{item.description}</p>
            <button
              onClick={() => setSelectedItem(item)}
              className="w-full flex items-center justify-center gap-2 bg-primary-50 hover:bg-primary-100 text-primary-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-primary-400 font-medium py-2 rounded-xl transition-colors"
            >
              <Plus className="h-4 w-4" /> Add to Order
            </button>
          </div>
        </div>
      ))}
      
      <ItemCustomizationModal
        isOpen={!!selectedItem}
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onAddToCart={addToCart}
      />
    </div>
  );
};
