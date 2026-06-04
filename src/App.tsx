import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Building2, Store, ShoppingBag, Landmark, ArrowRight, ShieldCheck, 
  Sparkles, CheckCircle, Smartphone, Flame, Pizza, Heart
} from 'lucide-react';
import SandboxHeader from './components/SandboxHeader';
import AdminDashboard from './pages/AdminDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import CustomerOrdering from './pages/CustomerOrdering';
import { initializeStore, getRestaurants } from './store';

// Modern Premium Landing Homepage for SaaS overview
function LandingPortal() {
  const restaurants = getRestaurants().filter(r => r.isActive);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-slate-900 text-white font-sans flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Hero Visual Block */}
      <div className="max-w-5xl mx-auto px-6 py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1 bg-indigo-505/10 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Restaurant SaaS Online Ordering</span>
          </span>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-3xl mx-auto leading-none">
            Streamlined Ordering for Local Kitchens, Built to Scale
          </h1>
          
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Provision digital storefronts for restaurants in seconds. Customers placement tickets route instantly to kitchen dashboards.
          </p>
        </div>

        {/* Primary Interactive Portals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto pt-6 text-left">
          
          {/* Card 1: Customer flow */}
          <div className="bg-slate-850/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl space-y-4 transition-all">
            <div className="bg-teal-500/10 text-teal-400 w-10 h-10 rounded-xl flex items-center justify-center border border-teal-500/20">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">1. Places Orders</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">Explore demo restaurant menus, customize carts, and complete mock checkout with ASAP scheduling.</p>
            </div>
            <div className="pt-2">
              <span className="text-xs font-bold text-teal-400 block mb-2">Try Active Stores:</span>
              <div className="flex flex-col gap-1.5">
                <Link 
                  to="/restaurant/burger-house"
                  className="inline-flex items-center gap-1.5 text-xs text-white hover:text-teal-300 font-semibold"
                >
                  <span>🍔 Burger House (Default)</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
                <Link 
                  to="/restaurant/pizza-artisan"
                  className="inline-flex items-center gap-1.5 text-xs text-white hover:text-teal-300 font-semibold"
                >
                  <span>🍕 Pizza Artisan</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Kitchen Operator */}
          <div className="bg-slate-850/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl space-y-4 transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="bg-amber-500/10 text-amber-400 w-10 h-10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">2. Process Kitchen Orders</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">High-contrast kitchen dashboard optimized for long-distance readability. Simulate incoming, acoustic ringers, and updates.</p>
              </div>
            </div>
            <Link 
              to="/restaurant-dashboard"
              className="inline-flex items-center justify-between bg-amber-500 hover:bg-amber-600 font-extrabold text-[11px] uppercase text-slate-950 py-2.5 px-4 rounded-xl transition-all"
            >
              <span>Launch Kitchen Portal</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>

          {/* Card 3: Platform Owner */}
          <div className="bg-slate-850/40 hover:bg-slate-800/40 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl space-y-4 transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div className="space-y-4">
              <div className="bg-indigo-500/10 text-indigo-400 w-10 h-10 rounded-xl flex items-center justify-center border border-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">3. platform Owner hub</h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Manage restaurant listings, active status locks, check performance cards, and simulate subdomains.</p>
              </div>
            </div>
            <Link 
              to="/admin"
              className="inline-flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 font-extrabold text-[11px] uppercase text-white py-2.5 px-4 rounded-xl transition-all"
            >
              <span>Open Admin Panel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

      {/* Humble footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-gray-500">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>SaaS Restaurant Ordering Portal © 2026. Designed for offline-first demonstration.</p>
          <div className="flex gap-2">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider">Frontend Prototype</span>
            <span className="bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider">React Router Dom</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  useEffect(() => {
    // Initialize Local Storage stores with sample restaurants/menus
    initializeStore();
  }, []);

  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 antialiased selection:bg-gray-900 selection:text-white">
        
        {/* Unified Sandbox controls Header */}
        <SandboxHeader />

        {/* Content routing views */}
        <Routes>
          <Route path="/" element={<LandingPortal />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/restaurant/:slug" element={<CustomerOrdering />} />
          
          {/* Fail-safe absolute fallback redirects to SaaS Portal */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </div>
    </HashRouter>
  );
}
