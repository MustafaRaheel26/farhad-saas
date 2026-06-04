import React, { useState, useEffect } from 'react';
import { 
  getRestaurants, getCategories, getMenuItems, getOrders, 
  addOrder, updateOrderStatus, addCategory, updateCategory, 
  deleteCategory, addMenuItem, updateMenuItem, deleteMenuItem, 
  updateRestaurant, subscribeToStore, getCurrentRestaurantId, 
  setCurrentRestaurantId 
} from '../store';
import { Restaurant, Category, MenuItem, Order, OrderItem } from '../types';
import { 
  BellRing, Play, Plus, Trash2, Edit, Check, Eye, X, 
  Volume2, FastForward, Sliders, Layers, Coffee, 
  Phone, MapPin, Camera, Save, Info, AlertTriangle, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'categories' | 'profile'>('orders');
  
  // Database bindings
  const [restaurants, setRestaurants] = useState<Restaurant[]>(getRestaurants());
  const [categories, setCategories] = useState<Category[]>(getCategories());
  const [menuItems, setMenuItems] = useState<MenuItem[]>(getMenuItems());
  const [orders, setOrders] = useState<Order[]>(getOrders());
  const [activeRestaurantId, setActiveRestaurantId] = useState(getCurrentRestaurantId());

  // Listen for local storage updates from customer placements
  useEffect(() => {
    const handleSync = () => {
      setRestaurants(getRestaurants());
      setCategories(getCategories());
      setMenuItems(getMenuItems());
      setOrders(getOrders());
      setActiveRestaurantId(getCurrentRestaurantId());
    };
    return subscribeToStore(handleSync);
  }, []);

  const currentRestaurant = restaurants.find(r => r.id === activeRestaurantId) || restaurants[0];

  useEffect(() => {
    if (currentRestaurant && activeRestaurantId !== currentRestaurant.id) {
      setActiveRestaurantId(currentRestaurant.id);
    }
  }, [currentRestaurant?.id, activeRestaurantId]);

  // Audio synthethizer double beep
  const playWebBeep = () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const beep = (freq: number, duration: number, onset: number) => {
        const osc = context.createOscillator();
        const gain = context.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, context.currentTime + onset);
        osc.connect(gain);
        gain.connect(context.destination);
        gain.gain.setValueAtTime(0.12, context.currentTime + onset);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + onset + duration);
        osc.start(context.currentTime + onset);
        osc.stop(context.currentTime + onset + duration);
      };

      // Play double chime
      beep(880, 0.15, 0);
      beep(1046, 0.20, 0.18);
    } catch (e) {
      console.log('Web Audio context blocked or unsupported', e);
    }
  };

  // Sound play simulation & ripple feedback
  const [ringRipple, setRingRipple] = useState(false);
  const handleTriggerBeep = () => {
    setRingRipple(true);
    playWebBeep();
    setTimeout(() => setRingRipple(false), 900);
  };

  // SIMULATOR: Generate simulated incoming customer order
  const handleSimulateOrder = () => {
    const names = ['Michael Vance', 'Elena Rostova', 'John Sterling', 'Chloe Bennet', 'Arthur Shelby', 'Li Wei'];
    const phones = ['+1 (555) 234-8890', '+1 (555) 707-1234', '+1 (555) 901-0909', '+1 (555) 345-5678', '+1 (555) 888-2910'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomPhone = phones[Math.floor(Math.random() * phones.length)];
    const storeItems = menuItems.filter(i => i.restaurantId === currentRestaurant.id && i.isAvailable);

    if (storeItems.length === 0) {
      alert('Please add some dishes to your restaurant menu first before simulating incoming orders!');
      return;
    }

    // Pick 1-2 random items
    const itemCount = Math.floor(Math.random() * 2) + 1;
    const orderItems: OrderItem[] = [];
    let totalPrice = 0;

    for (let k = 0; k < itemCount; k++) {
      const item = storeItems[Math.floor(Math.random() * storeItems.length)];
      // Prevent duplicates
      if (!orderItems.find(x => x.menuItemId === item.id)) {
        const qty = Math.floor(Math.random() * 2) + 1;
        orderItems.push({
          id: `sim-oi-${Date.now()}-${k}`,
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: qty
        });
        totalPrice += item.price * qty;
      }
    }

    const isAsap = Math.random() > 0.3;
    const mockOrder: Order = {
      id: `SIM-${Math.floor(1000 + Math.random() * 9000)}`,
      restaurantId: currentRestaurant.id,
      restaurantName: currentRestaurant.name,
      customerName: randomName,
      customerPhone: randomPhone,
      items: orderItems,
      totalPrice: totalPrice,
      pickupTimeOption: isAsap ? 'ASAP' : 'scheduled',
      scheduledTime: isAsap ? 'ASAP (15-20 mins)' : '06:30 PM',
      paymentMethod: Math.random() > 0.5 ? 'online' : 'pickup',
      status: 'NEW',
      timestamp: new Date().toISOString()
    };

    addOrder(mockOrder);
    playWebBeep();
  };

  // Active restaurant orders
  const activeRestaurantOrders = orders.filter(o => o.restaurantId === currentRestaurant?.id);

  // Stats calculation
  const newOrders = activeRestaurantOrders.filter(o => o.status === 'NEW');
  const preparingOrders = activeRestaurantOrders.filter(o => o.status === 'PREPARING');
  const readyOrders = activeRestaurantOrders.filter(o => o.status === 'READY');

  // Trigger sound alert on mount of any brand new order
  useEffect(() => {
    if (newOrders.length > 0) {
      // Auto beep briefly for any unread/new orders detected
      playWebBeep();
    }
  }, [newOrders.length]);

  // Categories & Menu Items administration forms
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catNameInput, setCatNameInput] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    price: '',
    image: '',
    isAvailable: true
  });

  // Profile forms
  const [profileForm, setProfileForm] = useState({
    description: '',
    phone: '',
    address: '',
    logo: '',
    coverImage: ''
  });

  useEffect(() => {
    if (currentRestaurant) {
      setProfileForm({
        description: currentRestaurant.description,
        phone: currentRestaurant.phone,
        address: currentRestaurant.address,
        logo: currentRestaurant.logo,
        coverImage: currentRestaurant.coverImage
      });
    }
  }, [currentRestaurant]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRestaurant) return;
    
    updateRestaurant({
      ...currentRestaurant,
      description: profileForm.description,
      phone: profileForm.phone,
      address: profileForm.address,
      logo: profileForm.logo,
      coverImage: profileForm.coverImage
    });
    alert('Restaurant branding profile updated successfully!');
  };

  // CATEGORY HANDLING
  const handleOpenAddCat = () => {
    setEditingCatId(null);
    setCatNameInput('');
    setShowCatModal(true);
  };

  const handleOpenEditCat = (cat: Category) => {
    setEditingCatId(cat.id);
    setCatNameInput(cat.name);
    setShowCatModal(true);
  };

  const handleSaveCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameInput.trim() || !currentRestaurant) return;

    if (editingCatId) {
      updateCategory({ id: editingCatId, restaurantId: currentRestaurant.id, name: catNameInput.trim() });
    } else {
      addCategory({ id: `cat-${Date.now()}`, restaurantId: currentRestaurant.id, name: catNameInput.trim() });
    }
    setShowCatModal(false);
  };

  const handleDeleteCat = (id: string) => {
    if (window.confirm('Delete this category? ALL associated menu items inside this category will also be deleted.')) {
      deleteCategory(id);
    }
  };

  // MENU ITEMS HANDLING
  const handleOpenAddItem = () => {
    setEditingItemId(null);
    const storeCats = categories.filter(c => c.restaurantId === currentRestaurant?.id);
    setItemForm({
      name: '',
      categoryId: storeCats[0]?.id || '',
      description: '',
      price: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isAvailable: true
    });
    setShowItemModal(true);
  };

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name,
      categoryId: item.categoryId,
      description: item.description,
      price: item.price.toString(),
      image: item.image,
      isAvailable: item.isAvailable
    });
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemForm.name.trim() || !itemForm.price || !currentRestaurant) return;

    const priceNum = parseFloat(itemForm.price);
    if (isNaN(priceNum)) return;

    const dataPayload = {
      restaurantId: currentRestaurant.id,
      categoryId: itemForm.categoryId,
      name: itemForm.name.trim(),
      description: itemForm.description.trim(),
      price: priceNum,
      image: itemForm.image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      isAvailable: itemForm.isAvailable
    };

    if (editingItemId) {
      updateMenuItem({ id: editingItemId, ...dataPayload });
    } else {
      addMenuItem({ id: `item-${Date.now()}`, ...dataPayload });
    }
    setShowItemModal(false);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Delete this dish item?')) {
      deleteMenuItem(id);
    }
  };

  if (!currentRestaurant) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6 text-center">
        <div>
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold">No Active Store Context</h2>
          <p className="text-gray-400 text-xs mt-1 max-w-sm">
            Please allocate or activate a restaurant inside the Platform Admin panel.
          </p>
        </div>
      </div>
    );
  }

  // Grouped active items inside active categories helper
  const storeCategories = categories.filter(c => c.restaurantId === currentRestaurant?.id);
  const storeItems = menuItems.filter(i => i.restaurantId === currentRestaurant?.id);

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-sans pb-16">
      
      {/* Dynamic Sub-header Context Banner */}
      <div className="bg-neutral-900 border-b border-neutral-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 overflow-hidden flex-shrink-0">
            <img 
              referrerPolicy="no-referrer"
              src={currentRestaurant.logo} 
              alt="Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-tight">{currentRestaurant.name} Dashboard</h2>
              <span className={`h-2.5 w-2.5 rounded-full ${currentRestaurant.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} title={currentRestaurant.isActive ? 'Active Store' : 'Inactive Store'}></span>
            </div>
            <p className="text-xs text-neutral-400">Manage order feeds, categories, menu pricing, and graphics layout.</p>
          </div>
        </div>

        {/* Simulator controls directly aligned */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sound play button */}
          <button
            onClick={handleTriggerBeep}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-semibold cursor-pointer relative ${ringRipple ? 'ring-2 ring-amber-400 text-amber-400' : ''}`}
            title="Simulate incoming volume audio reminder"
          >
            <Volume2 className="w-4 h-4" />
            <span>Test Sound Sirens</span>
          </button>

          {/* New Order Injector */}
          <button
            id="simulate-order-btn"
            onClick={handleSimulateOrder}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-950 text-xs font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <BellRing className="w-4 h-4" />
            <span>Simulate Incoming Order</span>
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex border-b border-neutral-800">
          {[
            { id: 'orders', label: 'Order Pipeline', badge: activeRestaurantOrders.filter(o => o.status !== 'COMPLETED').length },
            { id: 'menu', label: 'Menu List' },
            { id: 'categories', label: 'Categories' },
            { id: 'profile', label: 'Store Profile' }
          ].map(tab => (
            <button
              id={`tab-${tab.id}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="bg-neutral-800 text-amber-400 text-[10px] py-0.5 px-2 rounded-full border border-neutral-700">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-6">
        <AnimatePresence mode="wait">
          
          {/* SECTION A: ORDERS PIPELINE SECTION */}
          {activeTab === 'orders' && (
            <motion.div 
              key="orders-pipeline"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Quick statistics widgets strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Unread / New', count: newOrders.length, color: 'border-l-4 border-rose-500 bg-rose-950/25 text-rose-400' },
                  { label: 'Cooking', count: preparingOrders.length, color: 'border-l-4 border-amber-500 bg-amber-950/25 text-amber-400' },
                  { label: 'Awaiting Pickup', count: readyOrders.length, color: 'border-l-4 border-emerald-500 bg-emerald-950/25 text-emerald-400' },
                  { label: 'Total Historical Orders', count: activeRestaurantOrders.length, color: 'border-l-4 border-neutral-700 bg-neutral-900/40 text-neutral-400' }
                ].map((stat, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border border-neutral-800/80 ${stat.color}`}>
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">{stat.label}</div>
                    <div className="text-2xl font-extrabold mt-1">{stat.count}</div>
                  </div>
                ))}
              </div>

              {/* Kitchen Pipeline Board */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUMN 1: NEW INCOMING ORDERS */}
                <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-4 min-h-[500px]">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                      <h3 className="font-bold text-white text-sm">NEW INCOMING FEED</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-rose-950 text-rose-400 px-2 py-0.5 rounded-md border border-rose-800">
                      {newOrders.length} ticket{newOrders.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {newOrders.length === 0 ? (
                      <div className="text-center py-16 text-neutral-500">
                        <CheckSquare className="w-8 h-8 mx-auto stroke-1 opacity-45 mb-2" />
                        <p className="text-xs">No pending unread orders.</p>
                      </div>
                    ) : (
                      newOrders.map(order => (
                        <div 
                          id={`order-card-${order.id}`}
                          key={order.id} 
                          className="bg-neutral-900 border-2 border-rose-500 rounded-xl p-4 space-y-4 shadow-lg"
                        >
                          {/* Header of ticket */}
                          <div className="flex justify-between items-start border-b border-neutral-800 pb-2">
                            <div>
                              <span className="font-mono text-xs font-semibold text-rose-400">{order.id}</span>
                              <h4 className="font-sans text-xs text-neutral-400 font-bold mt-0.5">{order.customerName}</h4>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Order items details */}
                          <div className="space-y-2 text-xs">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-neutral-200">
                                <span className="font-bold text-neutral-100">{item.quantity}x <span className="font-normal text-neutral-300">{item.name}</span></span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-neutral-800 pt-2 flex justify-between font-extrabold text-white">
                              <span>Total Net:</span>
                              <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Delivery schedules info */}
                          <div className="grid grid-cols-2 gap-2 text-[10px] p-2 bg-neutral-950 rounded-lg text-neutral-400 border border-neutral-800">
                            <div>
                              <span className="block font-semibold">Timing Type:</span>
                              <span className="text-rose-400 font-bold">{order.pickupTimeOption === 'ASAP' ? 'ASAP' : order.scheduledTime}</span>
                            </div>
                            <div>
                              <span className="block font-semibold">Payment:</span>
                              <span className="capitalize">{order.paymentMethod === 'online' ? 'Credit Paid' : 'Cash at Desk'}</span>
                            </div>
                          </div>

                          {/* Quick action buttons */}
                          <div className="flex gap-2">
                            <button
                              id={`accept-order-btn-${order.id}`}
                              onClick={() => {
                                updateOrderStatus(order.id, 'PREPARING');
                                playWebBeep();
                              }}
                              className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-xs font-extrabold py-2 rounded-lg transition-colors cursor-pointer"
                            >
                              Accept & Prepare
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 2: ACTIVE PREPARING ORDERS */}
                <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-4 min-h-[500px]">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <h3 className="font-bold text-white text-sm">PREPARING IN KITCHEN</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-950 text-amber-400 px-2 py-0.5 rounded-md border border-amber-800">
                      {preparingOrders.length} ticket{preparingOrders.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {preparingOrders.length === 0 ? (
                      <div className="text-center py-16 text-neutral-500">
                        <CheckSquare className="w-8 h-8 mx-auto stroke-1 opacity-45 mb-2" />
                        <p className="text-xs">No orders cooking presently.</p>
                      </div>
                    ) : (
                      preparingOrders.map(order => (
                        <div 
                          key={order.id} 
                          className="bg-neutral-900 border-2 border-amber-500 rounded-xl p-4 space-y-4 shadow-lg"
                        >
                          {/* Header of ticket */}
                          <div className="flex justify-between items-start border-b border-neutral-800 pb-2">
                            <div>
                              <span className="font-mono text-xs font-semibold text-amber-400">{order.id}</span>
                              <h4 className="font-sans text-xs text-neutral-400 font-bold mt-0.5">{order.customerName}</h4>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Order items list */}
                          <div className="space-y-2 text-xs">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-neutral-200">
                                <span className="font-bold text-neutral-100">{item.quantity}x <span className="text-neutral-300 font-normal">{item.name}</span></span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-neutral-800 pt-2 flex justify-between font-extrabold text-white">
                              <span>Total Net:</span>
                              <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] p-2 bg-neutral-950 rounded-lg text-neutral-400 border border-neutral-800">
                            <div>
                              <span className="block font-semibold">Timing Type:</span>
                              <span className="text-amber-400 font-bold">{order.pickupTimeOption === 'ASAP' ? 'ASAP' : order.scheduledTime}</span>
                            </div>
                            <div>
                              <span className="block font-semibold">Phone:</span>
                              <span className="font-mono">{order.customerPhone}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              id={`mark-ready-btn-${order.id}`}
                              onClick={() => {
                                updateOrderStatus(order.id, 'READY');
                                playWebBeep();
                              }}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 text-xs font-extrabold py-2 rounded-lg transition-colors cursor-pointer"
                            >
                              Ready for Pickup
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* COLUMN 3: READY ORDERS */}
                <div className="bg-neutral-900/50 rounded-2xl border border-neutral-800 p-4 min-h-[500px]">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h3 className="font-bold text-white text-sm">AWAITING CORNER PICKUP</h3>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-800">
                      {readyOrders.length} ticket{readyOrders.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {readyOrders.length === 0 ? (
                      <div className="text-center py-16 text-neutral-500">
                        <CheckSquare className="w-8 h-8 mx-auto stroke-1 opacity-45 mb-2" />
                        <p className="text-xs">No orders pending pick-up.</p>
                      </div>
                    ) : (
                      readyOrders.map(order => (
                        <div 
                          key={order.id} 
                          className="bg-neutral-900 border-2 border-emerald-500 rounded-xl p-4 space-y-4 shadow-lg animate-pulse"
                        >
                          {/* Header of ticket */}
                          <div className="flex justify-between items-start border-b border-neutral-800 pb-2">
                            <div>
                              <span className="font-mono text-xs font-semibold text-emerald-400">{order.id}</span>
                              <h4 className="font-sans text-xs text-neutral-400 font-bold mt-0.5">{order.customerName}</h4>
                            </div>
                            <span className="text-[10px] font-mono text-neutral-400">
                              {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Order details */}
                          <div className="space-y-2 text-xs">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between text-neutral-200">
                                <span className="font-bold text-neutral-100">{item.quantity}x <span className="font-normal text-neutral-300">{item.name}</span></span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-neutral-800 pt-2 flex justify-between font-extrabold text-white">
                              <span>Total Net:</span>
                              <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] p-2 bg-neutral-950 rounded-lg text-neutral-200 border border-neutral-800">
                            <div>
                              <span className="block font-semibold">Ready Status:</span>
                              <span className="text-emerald-400 font-bold">READY TO HANDOFF</span>
                            </div>
                            <div>
                              <span className="block font-semibold">Phone:</span>
                              <span className="font-mono">{order.customerPhone}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              id={`complete-order-btn-${order.id}`}
                              onClick={() => {
                                updateOrderStatus(order.id, 'COMPLETED');
                                playWebBeep();
                              }}
                              className="flex-1 bg-neutral-850 border border-neutral-700 hover:bg-neutral-800 text-white text-xs font-semibold py-2 rounded-lg transition-all cursor-pointer"
                            >
                              Arrived & Completed
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* SECTION B: MENU LIST MANAGEMENT */}
          {activeTab === 'menu' && (
            <motion.div 
              key="menu-management"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <div>
                  <h3 className="font-bold text-white text-sm">Dishes and Menu Items</h3>
                  <p className="text-xs text-neutral-400">Total catalog dishes configured: {storeItems.length} items</p>
                </div>
                <button
                  id="add-dish-btn"
                  onClick={handleOpenAddItem}
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-1050 px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Dish</span>
                </button>
              </div>

              {/* Items grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeItems.map(item => {
                  const catName = storeCategories.find(c => c.id === item.categoryId)?.name || 'Unassigned';
                  return (
                    <div 
                      key={item.id} 
                      className="bg-neutral-900 border border-neutral-850 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between"
                    >
                      <div>
                        {/* Custom cover visual image */}
                        <div className="h-40 bg-neutral-800 relative">
                          <img 
                            referrerPolicy="no-referrer"
                            src={item.image} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <span className="bg-neutral-950/80 backdrop-blur-md text-[10px] font-bold text-amber-400 px-2 py-0.5 rounded-full border border-neutral-800">
                              {catName}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.isAvailable ? 'bg-emerald-950/80 text-emerald-405 border-emerald-800' : 'bg-red-950/80 text-red-405 border-red-800'}`}>
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>

                        {/* Content details description */}
                        <div className="p-4 space-y-2">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-bold text-white text-sm leading-tight">{item.name}</h4>
                            <span className="text-amber-400 font-extrabold font-mono text-sm">${item.price.toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                      </div>

                      {/* Controls toolbar block */}
                      <div className="border-t border-neutral-850 p-3 bg-neutral-900/40 flex justify-between gap-2">
                        <button
                          onClick={() => {
                            const updated = { ...item, isAvailable: !item.isAvailable };
                            updateMenuItem(updated);
                          }}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all tracking-wide cursor-pointer ${
                            item.isAvailable 
                              ? 'bg-neutral-850 hover:bg-rose-950/40 text-neutral-300 hover:text-rose-400 border border-neutral-700 hover:border-rose-900' 
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-900 hover:bg-emerald-900'
                          }`}
                        >
                          {item.isAvailable ? 'Deactivate' : 'Activate'}
                        </button>

                        <div className="flex gap-1.5">
                          <button
                            id={`edit-item-${item.id}`}
                            onClick={() => handleOpenEditItem(item)}
                            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 p-2 rounded-lg border border-neutral-700 cursor-pointer"
                            title="Edit specifications"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            id={`delete-item-${item.id}`}
                            onClick={() => handleDeleteItem(item.id)}
                            className="bg-neutral-850 hover:bg-red-950 hover:text-red-400 hover:border-red-900 text-neutral-400 p-2 rounded-lg border border-neutral-700 cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {storeItems.length === 0 && (
                  <div className="col-span-full text-center py-16 bg-neutral-900 rounded-2xl border border-dashed border-neutral-800">
                    <Coffee className="w-12 h-12 text-neutral-600 mx-auto mb-3 stroke-1" />
                    <p className="text-neutral-400 text-xs">No food items added to the catalog feed.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* SECTION C: CATEGORY LIST MANAGEMENT */}
          {activeTab === 'categories' && (
            <motion.div 
              key="categories-management"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                <div>
                  <h3 className="font-bold text-white text-sm">Menu Food Categories</h3>
                  <p className="text-xs text-neutral-400">Setup specific groupings (e.g. "Wood-Fired Pizza", "Soft Beverages").</p>
                </div>
                <button
                  id="add-category-btn"
                  onClick={handleOpenAddCat}
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-1050 px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Category</span>
                </button>
              </div>

              {/* Categories list table */}
              <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
                <table className="w-full text-left text-xs text-neutral-300">
                  <thead className="bg-neutral-850 text-[10px] font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-800">
                    <tr>
                      <th className="px-6 py-4">Category Handle ID</th>
                      <th className="px-6 py-4">Title Heading Name</th>
                      <th className="px-6 py-4">Dishes Nested</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {storeCategories.map(cat => {
                      const dishesCount = storeItems.filter(i => i.categoryId === cat.id).length;
                      return (
                        <tr key={cat.id} className="hover:bg-neutral-850/40">
                          <td className="px-6 py-4 font-mono text-neutral-500">{cat.id}</td>
                          <td className="px-6 py-4 font-semibold text-white">{cat.name}</td>
                          <td className="px-6 py-4">
                            <span className="bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-750 text-[10px] font-bold">
                              {dishesCount} nested recipes
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2.5">
                            <button
                              id={`edit-cat-${cat.id}`}
                              onClick={() => handleOpenEditCat(cat)}
                              className="text-amber-400 hover:text-amber-500 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <span className="text-neutral-700">|</span>
                            <button
                              id={`delete-cat-${cat.id}`}
                              onClick={() => handleDeleteCat(cat.id)}
                              className="text-neutral-500 hover:text-rose-400 font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {storeCategories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-neutral-500 italic">No categories structured. Create one to begin layout.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* SECTION D: BRAND PROFILE MANAGEMENTS */}
          {activeTab === 'profile' && (
            <motion.div 
              key="profile-branding"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto"
            >
              <form onSubmit={handleSaveProfile} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Store Profile & Digital Identity</h3>
                  <p className="text-xs text-neutral-405 mt-1">Configure layout, cover banners, and contact coordinates for the customer storefront.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Store Name Placeholder (Slug)</label>
                    <input 
                      type="text" 
                      disabled 
                      value={currentRestaurant.name}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-500 cursor-not-allowed focus:outline-none"
                    />
                    <p className="text-[10px] text-neutral-500 mt-1">Name can only be configured by Platform Owner admins.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Generated Static Domain link</label>
                    <input 
                      type="text" 
                      disabled 
                      value={currentRestaurant.subdomain}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Store Catchy Description</label>
                    <textarea
                      id="profile-desc-textarea"
                      value={profileForm.description}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-200 focus:outline-none"
                      placeholder="Chef-crafted specialty foods..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Store Phone Number</label>
                      <input 
                        id="profile-phone-input"
                        type="text" 
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Store Physical Location</label>
                      <input 
                        id="profile-address-input"
                        type="text" 
                        value={profileForm.address}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Logo URL Resource Link</label>
                      <input 
                        id="profile-logo-input"
                        type="text" 
                        value={profileForm.logo}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, logo: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Cover Image URL Resource Link</label>
                      <input 
                        id="profile-cover-input"
                        type="text" 
                        value={profileForm.coverImage}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, coverImage: e.target.value }))}
                        className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-neutral-800">
                  <button
                    id="save-profile-btn"
                    type="submit"
                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-neutral-1050 px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Branding Profile</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* CATEGORY DIALOG MODAL LAYOUT */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-neutral-850 p-4 border-b border-neutral-800 flex justify-between items-center text-sm font-bold text-white">
              <span>{editingCatId ? 'Edit Food Category' : 'Create Food Category'}</span>
              <button onClick={() => setShowCatModal(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveCat} className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Category Title Heading Name</label>
                <input
                  id="cat-name-modal-input"
                  type="text"
                  required
                  value={catNameInput}
                  onChange={(e) => setCatNameInput(e.target.value)}
                  placeholder="e.g. Handmade Tacos"
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl text-xs text-neutral-250 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs px-4 py-2 rounded-lg cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  id="save-cat-modal-btn"
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-1050 text-xs px-4 py-2 rounded-lg cursor-pointer font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MENU ITEM DIALOG MODAL LAYOUT */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-neutral-850 p-4 border-b border-neutral-800 flex justify-between items-center text-sm font-bold text-white">
              <span>{editingItemId ? 'Edit Catalog Dish' : 'Add Catalog Dish'}</span>
              <button onClick={() => setShowItemModal(false)} className="text-neutral-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveItem} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Dish Name Prefix</label>
                  <input
                    id="item-name-modal-input"
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Classic cheeseburger"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Set Pricing Unit ($)</label>
                  <input
                    id="item-price-modal-input"
                    type="number"
                    step="0.01"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="e.g. 14.50"
                    className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Assign Category</label>
                  <select
                    id="item-cat-modal-select"
                    value={itemForm.categoryId}
                    onChange={(e) => setItemForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl focus:outline-none text-neutral-300"
                  >
                    {storeCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                    {storeCategories.length === 0 && (
                      <option value="">No categories constructed</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Ingredient Details Decription</label>
                <textarea
                  id="item-desc-modal-textarea"
                  value={itemForm.description}
                  onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Double beef patty cheddar pickles signature sauce..."
                  rows={2}
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">Dish Image URL Link</label>
                <input
                  id="item-image-modal-input"
                  type="text"
                  value={itemForm.image}
                  onChange={(e) => setItemForm(prev => ({ ...prev, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 focus:border-amber-500 rounded-xl focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="item-available-modal-checkbox"
                  type="checkbox"
                  checked={itemForm.isAvailable}
                  onChange={(e) => setItemForm(prev => ({ ...prev, isAvailable: e.target.checked }))}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500"
                />
                <label className="text-neutral-400 text-[10px] font-bold uppercase tracking-widest leading-none">Immediately Available on Customer storefront</label>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs px-4 py-2 rounded-lg cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  id="save-item-modal-btn"
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-neutral-1050 text-xs px-4 py-2 rounded-lg cursor-pointer font-bold"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
