import React, { useState, useEffect } from 'react';
import { X, Printer, CreditCard, Banknote as Cash } from 'lucide-react';
import { CartItem } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (paymentMethod: 'cash' | 'card') => void;
  total: number;
  items: CartItem[];
  orderId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, onClose, onComplete, total, items, orderId 
}) => {
  const [method, setMethod] = useState<'cash' | 'card'>('cash');
  const [amountGiven, setAmountGiven] = useState('');
  
  const totalWithTax = total * 1.08;
  const change = method === 'cash' && amountGiven ? parseFloat(amountGiven) - totalWithTax : 0;

  useEffect(() => {
    if (isOpen) {
      setMethod('cash');
      setAmountGiven('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm no-print" onClick={onClose}></div>
      
      {/* On-Screen Modal content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden no-print animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold">Process Payment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-500 mb-1">Total Amount Due</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">${totalWithTax.toFixed(2)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setMethod('cash')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-colors ${
                method === 'cash' 
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 text-primary-600' 
                : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <div className="h-8 w-8 mb-2 flex items-center justify-center">$</div>
              <span className="font-medium">Cash</span>
            </button>
            <button
              onClick={() => setMethod('card')}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-colors ${
                method === 'card' 
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20 text-primary-600' 
                : 'border-gray-200 dark:border-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <CreditCard className="h-8 w-8 mb-2" />
              <span className="font-medium">Card</span>
            </button>
          </div>

          {method === 'cash' && (
            <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Given</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input 
                    type="number"
                    step="0.01"
                    value={amountGiven}
                    onChange={(e) => setAmountGiven(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg text-lg font-medium focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-gray-500">Change:</span>
                <span className={`font-bold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  ${change >= 0 ? change.toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-3 flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={() => onComplete(method)}
              disabled={method === 'cash' && (!amountGiven || parseFloat(amountGiven) < totalWithTax)}
              className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors shadow-sm"
            >
              Process & Complete
            </button>
          </div>
        </div>
      </div>

      {/* Printable Receipt (Hidden on screen, visible on print) */}
      <div className="hidden print-only fixed inset-0 bg-white text-black p-8 font-mono text-sm leading-relaxed">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Savor POS</h1>
          <p>123 Restaurant Street</p>
          <p>Tel: (555) 123-4567</p>
        </div>
        
        <div className="border-b border-dashed border-black pb-4 mb-4">
          <p>Order ID: {orderId || 'PENDING'}</p>
          <p>Date: {new Date().toLocaleString()}</p>
        </div>

        <table className="w-full mb-4">
          <thead>
            <tr className="border-b border-dashed border-black">
              <th className="text-left py-2 w-12">Qty</th>
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td className="py-1">{item.quantity}</td>
                <td className="py-1">{item.name}</td>
                <td className="py-1 text-right">${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-dashed border-black pt-4 mb-6 space-y-1 text-right">
          <p>Subtotal: ${total.toFixed(2)}</p>
          <p>Tax (8%): ${(total * 0.08).toFixed(2)}</p>
          <p className="font-bold text-lg mt-2">Total: ${totalWithTax.toFixed(2)}</p>
        </div>
        
        <div className="text-center border-t border-dashed border-black pt-6">
          <p>Thank you for dining with us!</p>
          <p>Please come again.</p>
        </div>
      </div>
    </div>
  );
};
