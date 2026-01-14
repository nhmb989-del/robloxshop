
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { User, Product, Order, WalletHistory, StoreSettings } from './types';
import { StorageService } from './services/storage';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  products: Product[];
  setProducts: (p: Product[]) => void;
  orders: Order[];
  setOrders: (o: Order[]) => void;
  walletHistory: WalletHistory[];
  setWalletHistory: (h: WalletHistory[]) => void;
  settings: StoreSettings;
  setSettings: (s: StoreSettings) => void;
  refreshData: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(StorageService.getCurrentUser());
  const [products, setProducts] = useState<Product[]>(StorageService.getProducts());
  const [orders, setOrders] = useState<Order[]>(StorageService.getOrders());
  const [walletHistory, setWalletHistory] = useState<WalletHistory[]>(StorageService.getWalletHistory());
  const [settings, setSettings] = useState<StoreSettings>(StorageService.getSettings());

  const refreshData = () => {
    setProducts(StorageService.getProducts());
    setOrders(StorageService.getOrders());
    setWalletHistory(StorageService.getWalletHistory());
    setSettings(StorageService.getSettings());
    
    const currentUser = StorageService.getCurrentUser();
    if (currentUser) {
      const allUsers = StorageService.getUsers();
      const updatedUser = allUsers.find(u => u.id === currentUser.id);
      if (updatedUser) {
        setUser(updatedUser);
        StorageService.setCurrentUser(updatedUser);
      }
    }
  };

  useEffect(() => {
    StorageService.setCurrentUser(user);
  }, [user]);

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      products, setProducts, 
      orders, setOrders, 
      walletHistory, setWalletHistory, 
      settings, setSettings,
      refreshData
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-slate-50">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/admin/*" element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/" />} />
            </Routes>
          </main>
          <footer className="bg-slate-900 text-white py-8 text-center">
            <p className="text-sm opacity-60">&copy; 2024 Roblox Shop System. All rights reserved.</p>
          </footer>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
