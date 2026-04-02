export type Role = 'admin' | 'cashier' | 'kitchen';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  description?: string;
}

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface CartItem extends MenuItem {
  cartItemId: string; // Unique ID for cart instance
  quantity: number;
  specialInstructions?: string;
  spiceLevel?: string;
  selectedAddons?: { name: string; price: number }[];
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: number;
  customerName?: string;
  tableNumber?: string;
  phoneNumber?: string;
  paymentStatus?: 'pending' | 'paid';
  paymentMethod?: 'cash' | 'card';
  tipAmount?: number;
  discountAmount?: number;
  promoCode?: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  expiryDate?: number;
}
