import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, ShoppingCart, ChefHat, Utensils } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary-600 p-2 rounded-lg text-white">
                <Utensils className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                Savor POS
              </span>
            </Link>

            {user && (
              <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
                {(user.role === 'admin' || user.role === 'cashier') && (
                  <Link
                    to="/pos"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" /> POS
                  </Link>
                )}
                {(user.role === 'admin' || user.role === 'kitchen') && (
                  <Link
                    to="/kitchen"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                  >
                    <ChefHat className="h-4 w-4" /> Kitchen
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Admin
                  </Link>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              to="/menu" 
              className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-500"
            >
              Public Menu
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full font-medium">
                  {user.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
