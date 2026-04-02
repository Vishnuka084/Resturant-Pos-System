import React from 'react';
import { useOrders } from '../../hooks/useOrders';
import { Clock, CheckCircle, ChefHat } from 'lucide-react';
import { OrderStatus } from '../../types';

export const KitchenDisplay = () => {
  const { orders, loading, updateOrderStatus } = useOrders();

  const activeOrders = orders.filter(
    order => order.status === 'pending' || order.status === 'preparing'
  );

  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  const preparingCount = activeOrders.filter(o => o.status === 'preparing').length;

  const handleStatusChange = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatus = currentStatus === 'pending' ? 'preparing' : 'completed';
    updateOrderStatus(orderId, nextStatus);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>)}
    </div>;
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-red-100 text-red-600 rounded-xl">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <ChefHat className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Preparing</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{preparingCount}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full items-start w-max">
          {activeOrders.map(order => (
            <div key={order.id} className={`w-80 flex-shrink-0 bg-white dark:bg-gray-900 border rounded-2xl shadow-sm overflow-hidden flex flex-col h-full max-h-[80vh] ${
              order.status === 'pending' 
                ? 'border-red-200 dark:border-red-900/50' 
                : 'border-blue-200 dark:border-blue-900/50'
            }`}>
              <div className={`p-4 border-b ${
                order.status === 'pending' 
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
                  : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
              }`}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono font-bold text-lg">#{order.id.slice(-5).toUpperCase()}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-medium block">{order.customerName || 'Walk-in'}</span>
                    {order.phoneNumber && (
                      <span className="text-xs text-gray-500 block">{order.phoneNumber}</span>
                    )}
                  </div>
                  {order.tableNumber && (
                    <span className="px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded-md">Table {order.tableNumber}</span>
                  )}
                </div>
              </div>

              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <div className="font-bold text-lg w-6 shrink-0">{item.quantity}x</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => handleStatusChange(order.id, order.status)}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                    order.status === 'pending'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                >
                  {order.status === 'pending' ? (
                    <><ChefHat className="h-5 w-5" /> Start Preparing</>
                  ) : (
                    <><CheckCircle className="h-5 w-5" /> Mark Completed</>
                  )}
                </button>
              </div>
            </div>
          ))}

          {activeOrders.length === 0 && (
            <div className="w-full flex items-center justify-center text-gray-400 mt-20 h-64 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl mx-auto">
              <div className="text-center">
                <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-xl font-medium">All caught up!</p>
                <p className="text-sm">No pending orders in the kitchen.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
