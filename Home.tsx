
import React, { useState } from 'react';
import { useApp } from '../App';
import { StorageService } from '../services/storage';
import { Product, Order, WalletHistory, User } from '../types';

const Home: React.FC = () => {
  const { user, products, settings, refreshData } = useApp();
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const handlePurchase = async (product: Product) => {
    if (!user) {
      setMessage({ text: 'กรุณาเข้าสู่ระบบก่อนซื้อสินค้า', type: 'error' });
      return;
    }

    if (user.wallet < product.price) {
      setMessage({ text: 'เงินใน Wallet ไม่เพียงพอ!', type: 'error' });
      return;
    }

    setIsBuying(product.id);
    
    // TRANSACTIONAL LOGIC
    try {
      // Simulate small delay for UX
      await new Promise(r => setTimeout(r, 800));

      const users = StorageService.getUsers();
      const currentUserIndex = users.findIndex(u => u.id === user.id);
      
      if (currentUserIndex === -1) throw new Error("User not found");
      
      const dbUser = users[currentUserIndex];
      
      // Re-check balance from "DB"
      if (dbUser.wallet < product.price) throw new Error("Insufficient funds");

      // 1. Deduct Wallet
      dbUser.wallet -= product.price;
      users[currentUserIndex] = dbUser;
      
      // 2. Add Wallet History
      const walletHistory = StorageService.getWalletHistory();
      const newHistory: WalletHistory = {
        id: `WH-${Date.now()}`,
        userId: user.id,
        type: 'OUT',
        amount: product.price,
        reason: `ซื้อสินค้า: ${product.name}`,
        date: new Date().toLocaleString('th-TH'),
      };
      walletHistory.push(newHistory);

      // 3. Create Order
      const orders = StorageService.getOrders();
      const newOrder: Order = {
        id: `ORD-${Date.now()}`,
        userId: user.id,
        username: user.username,
        productId: product.productId,
        productName: product.name,
        price: product.price,
        date: new Date().toLocaleString('th-TH'),
        secretCode: product.secretCode,
        status: 'SUCCESS'
      };
      orders.push(newOrder);

      // Save all at once (Atomicity simulation)
      StorageService.setUsers(users);
      StorageService.setWalletHistory(walletHistory);
      StorageService.setOrders(orders);
      StorageService.setCurrentUser(dbUser);

      setMessage({ text: `ซื้อสำเร็จ! รหัสสินค้า: ${product.secretCode}`, type: 'success' });
      refreshData();
    } catch (err: any) {
      setMessage({ text: `เกิดข้อผิดพลาด: ${err.message}`, type: 'error' });
    } finally {
      setIsBuying(null);
    }
  };

  const availableProducts = products.filter(p => p.isAvailable);

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative rounded-2xl overflow-hidden h-48 md:h-80 shadow-lg border-4 border-yellow-400">
        <img src={settings.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center p-8">
          <div className="text-white space-y-2">
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">ROBLOX STORE</h1>
            <p className="text-yellow-400 font-bold text-lg">เติมเงิน สุ่มไอเทม รับพอยท์ ทันที!</p>
          </div>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg font-bold text-center roblox-shadow ${message.type === 'success' ? 'bg-green-100 text-green-700 border-2 border-green-500' : 'bg-red-100 text-red-700 border-2 border-red-500'}`}>
          {message.text}
        </div>
      )}

      {/* Product Grid */}
      <section>
        <h2 className="text-2xl font-black mb-6 flex items-center gap-2 text-slate-800">
          <span className="w-2 h-8 bg-yellow-400 inline-block"></span>
          สินค้าทั้งหมด ({availableProducts.length})
        </h2>

        {availableProducts.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl text-center border-2 border-dashed border-slate-300">
            <p className="text-slate-500 font-medium">ยังไม่มีสินค้าในขณะนี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden border-2 border-slate-200 roblox-shadow flex flex-col group transition-all hover:border-yellow-400">
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 font-black px-3 py-1 rounded-full text-sm">
                    ฿ {product.price.toLocaleString()}
                  </div>
                </div>
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{product.name}</h3>
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2">{product.description}</p>
                  
                  <button
                    onClick={() => handlePurchase(product)}
                    disabled={isBuying === product.id}
                    className={`mt-auto w-full py-3 rounded-lg font-black text-white roblox-button shadow-lg flex items-center justify-center gap-2 ${isBuying === product.id ? 'bg-slate-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
                  >
                    {isBuying === product.id ? (
                      <>กำลังดำเนินการ...</>
                    ) : (
                      <>ซื้อสินค้าตอนนี้</>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
