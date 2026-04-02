import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useOrders } from '../../hooks/useOrders';
import { useCart } from '../../context/CartContext';
import { MenuGrid } from '../../components/menu/MenuGrid';
import { Minus, Plus, Trash2, ShoppingBag, X } from 'lucide-react';
import toast from 'react-hot-toast';

export const QRMenu = () => {
  const { menuItems, loading } = useMenuItems();
  const { placeOrder } = useOrders();
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const [searchParams] = useSearchParams();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const tableFromUrl = searchParams.get('table');
    if (tableFromUrl) {
      setTableNumber(tableFromUrl);
    }
  }, [searchParams]);

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!tableNumber) {
      toast.error('Please enter a table number');
      return;
    }
    
    setIsPlacing(true);
    try {
      await placeOrder({
        items: cart,
        total,
        status: 'pending',
        createdAt: Date.now(),
        customerName: customerName || 'Guest',
        tableNumber,
        phoneNumber: phoneNumber || undefined
      });
      clearCart();
      setIsCartOpen(false);
      if (!searchParams.get('table')) {
        setTableNumber('');
      }
      setCustomerName('');
      setPhoneNumber('');
      toast.success('Your order has been sent to the kitchen!');
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-6rem)] pb-24">
      {/* Header Info */}
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Our Menu</h1>
        <p className="text-gray-500">
          {tableNumber ? `Ordering for Table ${tableNumber}` : 'Order directly from your table'}
        </p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        <button
          onClick={() => setActiveCategory('All')}
          className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'All' 
              ? 'bg-primary-600 text-white shadow-md' 
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-800'
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
                ? 'bg-primary-600 text-white shadow-md' 
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-800'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <MenuGrid items={filteredItems} loading={loading} />

      {/* Floating Cart Button */}
      {cart.length > 0 && !isCartOpen && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-primary-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 hover:bg-primary-700 hover:scale-105 transition-all z-40 animate-bounce"
        >
          <div className="relative">
            <ShoppingBag className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          <span className="font-bold">${total.toFixed(2)}</span>
        </button>
      )}

      {/* Cart Sidebar Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="w-full md:w-96 bg-white dark:bg-gray-900 h-full relative flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary-500" /> Your Order
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-xl shadow-sm">
                  {item.image ? (
                     <img src={item.image} alt={item.name} className="h-16 w-16 object-cover rounded-lg" />
                  ) : (
                     <div className="h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500">Img</div>
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-sm line-clamp-1">{item.name}</h4>
                      <span className="font-bold text-sm ml-2">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 p-2">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Table No. *</label>
                    <input 
                      required
                      type="text" 
                      value={tableNumber}
                      onChange={e => setTableNumber(e.target.value)}
                      placeholder="e.g. 12" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Name (Optional)</label>
                    <input 
                      type="text" 
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="e.g. John" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Phone (Optional)</label>
                    <input 
                      type="tel" 
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      placeholder="e.g. 555-1234" 
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800" 
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span>Total</span>
                    <span>${(total * 1.08).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isPlacing}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg disabled:opacity-50"
                >
                  {isPlacing ? 'Sending to Kitchen...' : 'Place Order'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
