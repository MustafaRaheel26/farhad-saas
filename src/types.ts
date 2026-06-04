export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  description: string;
  coverImage: string;
  logo: string;
  phone: string;
  address: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  pickupTimeOption: 'ASAP' | 'scheduled';
  scheduledTime?: string;
  paymentMethod: 'online' | 'pickup';
  status: 'NEW' | 'PREPARING' | 'READY' | 'COMPLETED';
  timestamp: string;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
