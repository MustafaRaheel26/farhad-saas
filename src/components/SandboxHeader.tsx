import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Store, User, Layers, RefreshCw, Volume2 } from 'lucide-react';
import { getOrders, getRestaurants, subscribeToStore, getCurrentRestaurantId, setCurrentRestaurantId } from '../store';

export default function SandboxHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [restaurants, setRestaurants] = useState(getRestaurants());
  const [activeRestaurantId, setActiveRestaurantId] = useState(getCurrentRestaurantId());

  useEffect(() => {
    const updateStats = () => {
      const allOrders = getOrders();
      const activeRes = getCurrentRestaurantId();
      setRestaurants(getRestaurants());
      setActiveRestaurantId(activeRes);
      
      // Count new orders for the active restaurant
      const count = allOrders.filter(
        o => o.restaurantId === activeRes && o.status === 'NEW'
      ).length;
      setNewOrdersCount(count);
    };

    updateStats();
    return subscribeToStore(updateStats);
  }, []);

  const handleRestaurantSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setCurrentRestaurantId(val);
    
    // If we're looking at a customer restaurant page, redirect to the new one
    if (location.pathname.startsWith('/restaurant/')) {
      const selectedRes = restaurants.find(r => r.id === val);
      if (selectedRes) {
        navigate(`/restaurant/${selectedRes.slug}`);
      }
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to restore the sandbox to original demo data? This resets all customized menus and placements.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const currentRole = () => {
    if (location.pathname === '/admin') return 'admin';
    if (location.pathname === '/restaurant-dashboard') return 'restaurant';
    if (location.pathname.startsWith('/restaurant/')) return 'customer';
    return 'none';
  };

  const activeResName = restaurants.find(r => r.id === activeRestaurantId)?.name || 'Burger House';

  return (
    <div className="bg-gray-900 border-b border-gray-800 text-white select-none relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Sandbox Indicator */}
        <div className="flex items-center gap-2 font-mono text-gray-300">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-emerald-400 uppercase tracking-widest text-[10px]">SaaS Sandbox</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-400">Interactive Prototype</span>
        </div>

        {/* Real-time switcher bar */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          
          {/* Admin Role button */}
          <Link
            to="/admin"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
              currentRole() === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Admin</span>
          </Link>

          {/* Restaurant Role button */}
          <Link
            to="/restaurant-dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all relative ${
              currentRole() === 'restaurant'
                ? 'bg-amber-500 text-gray-950 shadow-sm'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Kitchen Dashboard</span>
            {newOrdersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-sans text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold animate-pulse border border-gray-900">
                {newOrdersCount}
              </span>
            )}
          </Link>

          {/* Customer Menu view */}
          <div className="flex items-center rounded-md bg-gray-800 text-gray-300 border border-gray-700">
            <Link
              to={`/restaurant/${restaurants.find(r => r.id === activeRestaurantId)?.slug || 'burger-house'}`}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-l-md font-medium transition-all ${
                currentRole() === 'customer'
                  ? 'bg-teal-600 text-white'
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </Link>

            {/* Dropdown to switch active restaurant context */}
            <div className="border-l border-gray-700 px-1 py-0.5 bg-gray-800 rounded-r-md">
              <select
                value={activeRestaurantId}
                onChange={handleRestaurantSwitch}
                className="bg-transparent text-gray-300 text-[11px] font-sans pr-1 focus:outline-none cursor-pointer py-0.5 font-medium"
                title="Choose which restaurant you are viewing, ordering from, or managing in the dashboard."
              >
                {restaurants.map((res) => (
                  <option key={res.id} value={res.id} className="bg-gray-900 text-white">
                    {res.name} {res.isActive ? '' : '(Inactive)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Right Help actions */}
        <div className="flex items-center gap-3">
          <span className="text-gray-500 hidden md:inline">
            Active Store Context: <strong className="text-gray-200">{activeResName}</strong>
          </span>
          <button
            onClick={handleResetData}
            title="Restore original database state"
            className="flex items-center gap-1.5 text-gray-400 hover:text-red-400 transition-colors font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Sandbox</span>
          </button>
        </div>

      </div>
    </div>
  );
}
