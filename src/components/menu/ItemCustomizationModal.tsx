import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MenuItem, CartItem } from '../../types';

interface ItemCustomizationModalProps {
  isOpen: boolean;
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

const COMMON_ADDONS = [
  { name: 'Extra Cheese', price: 1.50 },
  { name: 'Extra Sauce', price: 0.50 },
  { name: 'Gluten-Free Bun', price: 2.00 },
  { name: 'Bacon', price: 2.50 },
];

const SPICE_LEVELS = ['None', 'Mild', 'Medium', 'Spicy', 'Extra Spicy'];

export const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({ isOpen, item, onClose, onAddToCart }) => {
  const [instructions, setInstructions] = useState('');
  const [spiceLevel, setSpiceLevel] = useState('None');
  const [selectedAddons, setSelectedAddons] = useState<{name: string, price: number}[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen && item) {
      setInstructions('');
      setSpiceLevel('None');
      setSelectedAddons([]);
      setQuantity(1);
      setSelectedSlot(null);
      setSelectedDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const toggleAddon = (addon: {name: string, price: number}) => {
    if (selectedAddons.find(a => a.name === addon.name)) {
      setSelectedAddons(selectedAddons.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const currentTotal = (item.price + selectedAddons.reduce((sum, a) => sum + a.price, 0)) * quantity;

  const handleConfirm = () => {
    onAddToCart({
      ...item,
      cartItemId: Math.random().toString(36).substring(7),
      quantity,
      specialInstructions: instructions || undefined,
      spiceLevel: spiceLevel !== 'None' ? spiceLevel : undefined,
      selectedAddons: selectedAddons.length > 0 ? selectedAddons : undefined,
      selectedSlot: selectedSlot || undefined,
      selectedDate: selectedDate || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="h-48 relative bg-gray-100 dark:bg-gray-800 shrink-0">
          {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-black/50 backdrop-blur hover:bg-white rounded-full text-gray-900 dark:text-white transition-colors shadow">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex justify-between">
              {item.name}
              <span>${item.price.toFixed(2)}</span>
            </h2>
            <div className="flex gap-2 mt-2">
              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold rounded-lg uppercase tracking-wider">
                {item.type || 'food'}
              </span>
              {item.duration && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-lg">
                  {item.duration}
                </span>
              )}
            </div>
            <p className="text-gray-500 mt-3">{item.description}</p>
          </div>

          {/* Spice Level (Food only) */}
          {(!item.type || item.type === 'food') && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Spice Level</h3>
              <div className="flex flex-wrap gap-2">
                {SPICE_LEVELS.map(level => (
                  <button
                    key={level}
                    onClick={() => setSpiceLevel(level)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                      spiceLevel === level 
                      ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                      : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons (Food only) */}
          {(!item.type || item.type === 'food') && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Add-ons</h3>
              <div className="space-y-2">
                {COMMON_ADDONS.map(addon => {
                  const isSelected = !!selectedAddons.find(a => a.name === addon.name);
                  return (
                    <label key={addon.name} className={`flex justify-between items-center p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      isSelected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-100 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50'
                    }`}>
                      <div className="flex items-center gap-3">
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleAddon(addon)}
                          className="h-5 w-5 rounded text-primary-600 focus:ring-primary-500 border-gray-300 pointer-events-none"
                        />
                        <span className="font-medium">{addon.name}</span>
                      </div>
                      <span className="font-bold text-gray-500">+${addon.price.toFixed(2)}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Slot Selection (Tours & Services) */}
          {(item.type === 'tour' || item.type === 'service') && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Select Date & Time</h3>
              <div className="space-y-4">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-3 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-xl font-medium"
                />
                
                <div className="grid grid-cols-3 gap-2">
                  {['08:00 AM', '10:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'].map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border-2 transition-colors ${
                        selectedSlot === slot 
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' 
                        : 'border-transparent bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">
              {item.type === 'food' ? 'Special Instructions' : 'Booking Notes'}
            </h3>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder={item.type === 'food' ? "e.g. No onions, sauce on the side..." : "e.g. Height for bike, pickup location, etc."}
              className="w-full p-4 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-xl resize-none h-24 focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Quantity */}
          <div>
            <h3 className="font-bold text-lg mb-3">Quantity</h3>
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 w-fit p-2 rounded-2xl border border-gray-100 dark:border-gray-700">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex text-xl items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl">-</button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex text-xl items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl">+</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
          <button
            onClick={handleConfirm}
            className="w-full flex items-center justify-between px-6 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg"
          >
            <span>Add to Order</span>
            <span>${currentTotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
