import React from 'react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useOrders } from '../../hooks/useOrders';
import { useCart } from '../../context/CartContext';
import { MenuGrid } from '../../components/menu/MenuGrid';
import { Minus, Plus, Trash2, ShoppingBag, Utensils, Bike } from 'lucide-react';
import { PaymentModal } from '../../components/pos/PaymentModal';

export const POSPage = () => {
  const { menuItems, loading } = useMenuItems();
  const { placeOrder } = useOrders();
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [isPlacing, setIsPlacing] = React.useState(false);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState<'food' | 'services'>('food');

  const filteredItemsBySection = menuItems.filter(item => 
    activeSection === 'food' ? (item.type === 'food' || !item.type) : (item.type !== 'food')
  );

  const categories = Array.from(new Set(filteredItemsBySection.map(item => item.category)));
  const [activeCategory, setActiveCategory] = React.useState<string>('All');

  const filteredItems = activeCategory === 'All' 
    ? filteredItemsBySection 
    : filteredItemsBySection.filter(item => item.category === activeCategory);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const processOrder = async (details: { method: 'cash' | 'card', discountAmount: number, tipAmount: number, promoCode?: string }) => {
    setIsPlacing(true);
    try {
      await placeOrder({
        items: cart,
        total: total - details.discountAmount + ((total - details.discountAmount) * 0.08) + details.tipAmount,
        status: 'completed',
        createdAt: Date.now(),
        paymentStatus: 'paid',
        paymentMethod: details.method,
        discountAmount: details.discountAmount,
        tipAmount: details.tipAmount,
        promoCode: details.promoCode
      });
      clearCart();
      setIsPaymentModalOpen(false);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      {/* Menu Section */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Section Switcher */}
        <div className="flex p-1 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-4 w-fit">
          <button
            onClick={() => { setActiveSection('food'); setActiveCategory('All'); }}
            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeSection === 'food' 
                ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Utensils className="h-5 w-5" /> Restaurant
          </button>
          <button
            onClick={() => { setActiveSection('services'); setActiveCategory('All'); }}
            className={`px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all ${
              activeSection === 'services' 
                ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Bike className="h-5 w-5" /> Services/Rentals
          </button>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
              activeCategory === 'All' 
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeCategory === category 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Grid */}
        <div className="flex-1 overflow-y-auto pr-2 pb-24">
          <MenuGrid items={filteredItems} loading={loading} />
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary-500" /> Current Order
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-4">
              <ShoppingBag className="h-12 w-12 opacity-20" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.cartItemId} className="flex gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl shadow-sm">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="h-16 w-16 object-cover rounded-lg shrink-0" />
                ) : (
                  <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500 shrink-0">Img</div>
                )}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between">
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{item.name}</h4>
                    <span className="font-bold text-sm ml-2">${((item.price + (item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-1 flex-wrap my-0.5">
                    {item.type && item.type !== 'food' && (
                      <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-tighter">
                        {item.type}
                      </span>
                    )}
                    {item.duration && (
                      <span className="text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">
                        {item.duration}
                      </span>
                    )}
                  </div>
                  {(item.selectedDate || item.selectedSlot) && (
                    <div className="flex gap-2 items-center text-[10px] text-primary-600 dark:text-primary-400 font-bold mb-1">
                      {item.selectedDate && <span className="flex items-center gap-1">📅 {item.selectedDate}</span>}
                      {item.selectedSlot && <span className="flex items-center gap-1">🕒 {item.selectedSlot}</span>}
                    </div>
                  )}
                  {item.spiceLevel && <p className="text-xs text-red-500 font-medium my-0.5">Spice: {item.spiceLevel}</p>}
                  {item.selectedAddons && item.selectedAddons.length > 0 && (
                    <p className="text-xs text-gray-500 my-0.5">{item.selectedAddons.map(a => a.name).join(', ')}</p>
                  )}
                  {item.specialInstructions && (
                    <p className="text-xs text-gray-500 italic my-0.5 whitespace-pre-wrap">"{item.specialInstructions}"</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} className="p-1">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} className="p-1">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.cartItemId)} className="text-red-500 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/80">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500 dark:text-gray-400">
              <span>Tax (8%)</span>
              <span>${(total * 0.08).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-200 dark:border-gray-700">
              <span>Total</span>
              <span>${(total * 1.08).toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={handleCheckoutClick}
            disabled={cart.length === 0 || isPlacing}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-bold py-4 rounded-xl transition-colors shadow-sm"
          >
            {isPlacing ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        onComplete={processOrder}
        total={total}
        items={cart}
      />
    </div>
  );
};
