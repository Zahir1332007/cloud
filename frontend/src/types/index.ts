export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  category_id: number;
  is_active: boolean;
  rating: number;
  category?: Category;
  created_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'customer';
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'customer';
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  phone?: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'credit_card' | 'paypal' | 'cash_on_delivery' | 'crypto' | 'yape_plin';
  created_at: string;
  items: OrderItem[];
}

export interface DashboardStats {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  low_stock_products: number;
  recent_orders: Order[];
}

export interface HealthStatus {
  status: string;
  database: string;
  timestamp: string;
  service: string;
  version: string;
  environment: string;
}

