
import { User, Product, Order, WalletHistory, StoreSettings } from '../types';

const KEYS = {
  USERS: 'roblox_users',
  PRODUCTS: 'roblox_products',
  ORDERS: 'roblox_orders',
  WALLET_HISTORY: 'roblox_wallet_history',
  SETTINGS: 'roblox_settings',
  CURRENT_USER: 'roblox_current_user'
};

export const StorageService = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  setUsers: (users: User[]) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
  
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  setProducts: (products: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products)),
  
  getOrders: (): Order[] => JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]'),
  setOrders: (orders: Order[]) => localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders)),
  
  getWalletHistory: (): WalletHistory[] => JSON.parse(localStorage.getItem(KEYS.WALLET_HISTORY) || '[]'),
  setWalletHistory: (history: WalletHistory[]) => localStorage.setItem(KEYS.WALLET_HISTORY, JSON.stringify(history)),

  getSettings: (): StoreSettings => JSON.parse(localStorage.getItem(KEYS.SETTINGS) || JSON.stringify({
    logoUrl: 'https://picsum.photos/200/200',
    bannerUrl: 'https://picsum.photos/1200/400'
  })),
  setSettings: (settings: StoreSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),

  getCurrentUser: (): User | null => JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null'),
  setCurrentUser: (user: User | null) => localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user)),

  // Seed default admin
  init: () => {
    const users = StorageService.getUsers();
    if (!users.find(u => u.username === 'ตะวัน')) {
      users.push({
        id: 'admin-001',
        username: 'ตะวัน',
        password: '240420',
        wallet: 999999999,
        isAdmin: true
      });
      StorageService.setUsers(users);
    }
  }
};
