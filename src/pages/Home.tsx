import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, QrCode, ShoppingCart, ChefHat, LayoutDashboard, Bike, Map, Car, SwatchBook as Waves } from 'lucide-react';

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
      color: 'bg-indigo-500',
    },
    {
      title: 'Bike Rentals',
      description: 'Manage or book bicycle rentals by hour or day.',
      icon: Bike,
      to: '/menu?category=Bikes',
      color: 'bg-emerald-500',
    },
    {
      title: 'Tour Bookings',
      description: 'Explore and book local guided tours and excursions.',
      icon: Map,
      to: '/menu?category=Tours',
      color: 'bg-amber-500',
    },
    {
      title: 'Vehicle Hiring',
      description: 'Rent scooters and cars for local exploration.',
      icon: Car,
      to: '/menu?category=Vehicles',
      color: 'bg-rose-500',
    },
    {
      title: 'Surf Lessons',
      description: 'Book professional surf lessons and equipment.',
      icon: Waves,
      to: '/menu?category=Surf',
      color: 'bg-cyan-500',
    },
  ];

  const restaurantOptions = options.slice(0, 4);
  const serviceOptions = options.slice(4);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-16 py-12">
      <div className="space-y-4 max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl">
          Savor <span className="text-primary-600">&</span> Soar
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400">
          The all-in-one management suite for hospitality, rentals, and local experiences.
        </p>
      </div>

      <div className="w-full max-w-6xl space-y-12">
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <h2 className="text-2xl font-black text-gray-400 uppercase tracking-[0.2em]">Restaurant Suite</h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurantOptions.map((opt) => (
              <Link
                key={opt.title}
                to={opt.to}
                className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:border-primary-500 transition-all duration-500 overflow-hidden"
              >
                <div className={`p-4 rounded-2xl text-white mb-6 ${opt.color} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <opt.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{opt.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{opt.description}</p>
                <div className="mt-6 flex items-center text-primary-600 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Manage <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
            <h2 className="text-2xl font-black text-gray-400 uppercase tracking-[0.2em]">Rentals & Experiences</h2>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {serviceOptions.map((opt) => (
              <Link
                key={opt.title}
                to={opt.to}
                className="group relative flex flex-col items-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-2xl hover:border-primary-500 transition-all duration-500 overflow-hidden"
              >
                <div className={`p-4 rounded-2xl text-white mb-6 ${opt.color} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                  <opt.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{opt.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{opt.description}</p>
                <div className="mt-6 flex items-center text-primary-600 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  Bookings <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
