import React, { useState } from 'react';
import { useOrders } from '../../hooks/useOrders';
import { Calendar as CalendarIcon, Clock, User, Phone, MapPin, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

export const BookingsCalendar = () => {
  const { orders, updateOrderStatus } = useOrders();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Aggregate all service items from orders that have a selectedDate
  const allBookings = orders.flatMap(order => 
    order.items
      .filter(item => item.type !== 'food' && item.selectedDate)
      .map(item => ({
        ...item,
        orderId: order.id,
        customerName: order.customerName,
        phoneNumber: order.phoneNumber,
        status: order.status,
        orderCreatedAt: order.createdAt
      }))
  ).sort((a, b) => (a.selectedSlot || '').localeCompare(b.selectedSlot || ''));

  const filteredBookings = allBookings.filter(b => b.selectedDate === selectedDate);

  const handleDateChange = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Service Bookings</h1>
          <p className="text-gray-500">Manage rentals, tours, and lessons schedule</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
          <button 
            onClick={() => handleDateChange(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2 px-4 font-bold text-lg">
            <CalendarIcon className="h-5 w-5 text-primary-500" />
            {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <button 
            onClick={() => handleDateChange(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Statistics or Key Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-6 rounded-3xl text-white shadow-lg">
            <h3 className="text-lg font-medium opacity-80 mb-1">Total Bookings Today</h3>
            <p className="text-4xl font-black">{filteredBookings.length}</p>
            <div className="mt-4 flex gap-2">
               <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold">
                 {filteredBookings.filter(b => b.type === 'rental').length} Rentals
               </span>
               <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold">
                 {filteredBookings.filter(b => b.type === 'tour').length} Tours
               </span>
               <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold">
                 {filteredBookings.filter(b => b.type === 'service').length} Lessons
               </span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Quick Calendar</h3>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-bold focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 p-12 text-center">
              <CalendarIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-xl font-bold text-gray-400">No bookings for this date</p>
              <p className="text-gray-500 mt-1">Select another date or check your orders history</p>
            </div>
          ) : (
            filteredBookings.map((booking, idx) => (
              <div key={`${booking.orderId}-${idx}`} className="group bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col md:flex-row">
                <div className={`w-2 md:w-3 bg-primary-500 ${booking.type === 'rental' ? 'bg-emerald-500' : booking.type === 'tour' ? 'bg-amber-500' : 'bg-cyan-500'}`} />
                <div className="flex-1 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-4 items-start">
                    <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                      <Clock className={`h-7 w-7 ${booking.type === 'rental' ? 'text-emerald-500' : booking.type === 'tour' ? 'text-amber-500' : 'text-cyan-500'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-black text-gray-900 dark:text-white">{booking.selectedSlot || 'Full Day'}</span>
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-[10px] font-bold rounded uppercase tracking-wider text-gray-400">
                          {booking.type}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-gray-700 dark:text-gray-200">{booking.name}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500">
                         <span className="flex items-center gap-1"><User className="h-4 w-4" /> {booking.customerName}</span>
                         {booking.phoneNumber && <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {booking.phoneNumber}</span>}
                         {booking.quantity > 1 && <span className="font-bold text-primary-600">x{booking.quantity} People/Units</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                    <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                      booking.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      booking.status === 'pending' ? 'bg-red-100 text-red-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.status}
                    </div>
                    {booking.status !== 'completed' && (
                      <button 
                        onClick={() => updateOrderStatus(booking.orderId, 'completed')}
                        className="p-3 bg-gray-50 hover:bg-green-500 hover:text-white dark:bg-gray-800 dark:hover:bg-green-600 rounded-2xl transition-all shadow-sm group-hover:scale-105"
                        title="Mark as Completed"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
