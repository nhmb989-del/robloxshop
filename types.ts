
export interface User {
  id: string;
  username: string;
  password?: string;
  wallet: number;
  isAdmin: boolean;
}

export interface Product {
  id: string;
  productId: string; // Unique Item ID
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
  secretCode: string; // Hidden until purchased
}

export interface Order {
  id: string;
  userId: string;
  username: string;
  productId: string;
  productName: string;
  price: number;
  date: string;
  secretCode: string;
  status: 'SUCCESS';
}

export interface WalletHistory {
  id: string;
  userId: string;
  type: 'IN' | 'OUT';
  amount: number;
  reason: string;
  date: string;
  adminName?: string;
}

export interface StoreSettings {
  logoUrl: string;
  bannerUrl: string;
}
