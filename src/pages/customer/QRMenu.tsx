import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useOrders } from '../../hooks/useOrders';
import { useCart } from '../../context/CartContext';
import { usePromoCodes } from '../../hooks/usePromoCodes';
import { MenuGrid } from '../../components/menu/MenuGrid';
import { Minus, Plus, Trash2, ShoppingBag, X, CheckCircle, ChefHat, Clock } from 'lucide-react';
import { playNotificationSound } from '../../lib/sound';
import toast from 'react-hot-toast';

export const QRMenu = () => {
  const { menuItems, loading } = useMenuItems();
  const { placeOrder, orders } = useOrders();
  const { cart, removeFromCart, updateQuantity, clearCart, total } = useCart();
  const { promoCodes } = usePromoCodes();
  const [searchParams] = useSearchParams();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPlacing, setIsPlacing] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [activePromo, setActivePromo] = useState<any>(null);
  const [discountAmt, setDiscountAmt] = useState(0);
  const [tipPercent, setTipPercent] = useState(0);
  
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    if (activeOrderId) {
      const activeOrder = orders.find(o => o.id === activeOrderId);
      if (activeOrder?.status === 'completed' && !hasNotified) {
        setHasNotified(true);
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Order Ready!", {
            body: "Your food has been prepared completely and is ready for you!",
          });
        }
        playNotificationSound();
      }
    }
  }, [orders, activeOrderId, hasNotified]);

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

  const handlePromoCode = (code: string) => {
    setPromoCodeInput(code);
    const foundPromo = promoCodes.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);
    
    if (foundPromo) {
      setActivePromo(foundPromo);
      let calculatedDiscount = 0;
      if (foundPromo.type === 'percentage') {
        calculatedDiscount = total * (foundPromo.value / 100);
      } else {
        calculatedDiscount = foundPromo.value;
      }
      setDiscountAmt(calculatedDiscount);
      toast.success(`'${foundPromo.code}' Applied!`);
    } else {
      setActivePromo(null);
      setDiscountAmt(0);
      if (code) toast.error('Invalid or inactive promo code');
    }
  };

  const calculatedTip = total * (tipPercent / 100);
  const finalTotal = (total - discountAmt) + calculatedTip;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!tableNumber) {
      toast.error('Please enter a table number');
      return;
    }
    
    setIsPlacing(true);
    try {
      const newOrderId = await placeOrder({
        items: cart,
        total: finalTotal,
        status: 'pending',
        createdAt: Date.now(),
        customerName: customerName || 'Guest',
        tableNumber,
        phoneNumber: phoneNumber || undefined,
        discountAmount: discountAmt,
        promoCode: activePromo?.code,
        tipAmount: calculatedTip
      });
      
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission();
      }

      clearCart();
      setIsCartOpen(false);
      
      if (!searchParams.get('table')) {
        setTableNumber('');
      }
      setCustomerName('');
      setPhoneNumber('');
      
      setActiveOrderId(newOrderId);
      toast.success('Your order has been sent to the kitchen!');
    } finally {
      setIsPlacing(false);
    }
  };

  if (activeOrderId) {
    const activeOrder = orders.find(o => o.id === activeOrderId);
    
    if (!activeOrder) {
      return (
        <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      );
    }

    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl w-full max-w-md p-8 text-center border border-gray-100 dark:border-gray-800">
          <div className={`w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center border-4 shadow-inner ${
            activeOrder.status === 'completed' ? 'bg-green-50 border-green-200 text-green-500 dark:bg-green-900/20 dark:border-green-800' : 
            activeOrder.status === 'preparing' ? 'bg-blue-50 border-blue-200 text-blue-500 dark:bg-blue-900/20 dark:border-blue-800' : 
            'bg-yellow-50 border-yellow-200 text-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-800'
          }`}>
            {activeOrder.status === 'completed' ? (
                <CheckCircle className="h-14 w-14 animate-bounce" />
            ) : activeOrder.status === 'preparing' ? (
                <ChefHat className="h-14 w-14 animate-pulse" />
            ) : (
                <Clock className="h-14 w-14 animate-pulse" />
            )}
          </div>
          
          <h2 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white">
            {activeOrder.status === 'completed' ? 'Order Ready!' : 
             activeOrder.status === 'preparing' ? 'Cooking...' : 'Order Received'}
          </h2>
          
          <p className="text-lg font-medium text-gray-500 mb-8">
            {activeOrder.status === 'completed' ? 'Your food has been prepared!' : 
             activeOrder.status === 'preparing' ? 'The chef is making your food' : 'Waiting for kitchen to accept'}
          </p>
          
          <div className="text-left bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-3 flex justify-between">
              <span>Your Items</span>
              <span>#{activeOrderId.slice(0, 5).toUpperCase()}</span>
            </h3>
            <div className="space-y-3">
              {activeOrder.items.map(item => (
                <div key={item.cartItemId} className="flex justify-between items-center text-sm font-medium">
                  <div className="flex gap-3">
                     <span className="text-gray-500">{item.quantity}x</span>
                     <span className="text-gray-900 dark:text-gray-300">{item.name}</span>
                  </div>
                  <span className="text-gray-900 dark:text-white">${((item.price + (item.selectedAddons?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {activeOrder.status === 'completed' && (
             <button 
               onClick={() => { setActiveOrderId(null); setHasNotified(false); }} 
               className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-colors shadow-lg"
             >
               Start A New Order
             </button>
          )}
        </div>
      </div>
    );
  }

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
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-500 hover:bg-200 dark:hover:bg-gray-800 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map(item => (
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
                
                <div className="space-y-3 mb-4 text-sm font-medium">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Promo Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={promoCodeInput}
                        onChange={e => setPromoCodeInput(e.target.value)}
                        placeholder="Got a code?" 
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      />
                      <button type="button" onClick={() => handlePromoCode(promoCodeInput)} className="px-4 bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-bold">Apply</button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Add a Tip</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 10, 15, 20].map(tip => (
                        <button
                          key={tip}
                          type="button"
                          onClick={() => setTipPercent(tip)}
                          className={`py-2 rounded-lg border-2 transition-colors ${tipPercent === tip ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                          {tip}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-1 text-gray-500 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    {discountAmt > 0 && (
                      <div className="flex justify-between text-green-600 font-bold">
                        <span>Discount ({activePromo?.code})</span>
                        <span>-${discountAmt.toFixed(2)}</span>
                      </div>
                    )}
                    {calculatedTip > 0 && (
                      <div className="flex justify-between">
                        <span>Tip</span>
                        <span>${calculatedTip.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2">
                      <span>Total</span>
                      <span>${finalTotal.toFixed(2)}</span>
                    </div>
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
