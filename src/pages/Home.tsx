import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, QrCode, ShoppingCart, ChefHat, LayoutDashboard } from 'lucide-react';

export const Home = () => {
  const options = [
    {
      title: 'Customer Menu',
      description: 'View our menu and place orders from your table.',
      icon: QrCode,
      to: '/menu',
      color: 'bg-blue-500',
    },
    {
      title: 'POS System',
      description: 'Cashier interface for walk-in orders.',
      icon: ShoppingCart,
      to: '/pos',
      color: 'bg-green-500',
    },
    {
      title: 'Kitchen Display',
      description: 'Real-time order management for the kitchen staff.',
      icon: ChefHat,
      to: '/kitchen',
      color: 'bg-orange-500',
    },
    {
      title: 'Admin Dashboard',
      description: 'Manage menu items, users, and view analytics.',
      icon: LayoutDashboard,
      to: '/admin',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Complete <span className="text-primary-600">Restaurant</span> Management
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          A seamless, real-time POS system connecting your customers, cashiers, kitchen, and management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {options.map((opt) => (
          <Link
            key={opt.title}
            to={opt.to}
            className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:border-primary-500 transition-all duration-300 overflow-hidden"
          >
            <div className={`p-4 rounded-full text-white mb-6 ${opt.color} group-hover:scale-110 transition-transform duration-300`}>
              <opt.icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{opt.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{opt.description}</p>
            <div className="mt-6 flex items-center text-primary-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
              Access now <ArrowRight className="ml-2 h-4 w-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
