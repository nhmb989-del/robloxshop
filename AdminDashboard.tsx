
import React, { useState } from 'react';
import { useApp } from '../App';
import { StorageService } from '../services/storage';
import { Product, User, Order, WalletHistory, StoreSettings } from '../types';

const AdminDashboard: React.FC = () => {
  const { products, orders, walletHistory, refreshData, settings } = useApp();
  const [tab, setTab] = useState<'products' | 'users' | 'orders' | 'settings'>('products');
  
  // States for Modals
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [walletTarget, setWalletTarget] = useState<{ userId: string, username: string } | null>(null);
  const [walletAmount, setWalletAmount] = useState<number>(0);
  
  const allUsers = StorageService.getUsers();

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const currentProducts = StorageService.getProducts();
    if (editingProduct.id) {
      // Update
      const index = currentProducts.findIndex(p => p.id === editingProduct.id);
      currentProducts[index] = editingProduct as Product;
    } else {
      // Create
      if (currentProducts.some(p => p.productId === editingProduct.productId)) {
        alert('รหัสสินค้านี้ซ้ำ กรุณาเปลี่ยนใหม่');
        return;
      }
      currentProducts.push({
        ...editingProduct,
        id: `PRD-${Date.now()}`,
        isAvailable: true
      } as Product);
    }

    StorageService.setProducts(currentProducts);
    setEditingProduct(null);
    refreshData();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWalletAdjust = (type: 'IN' | 'OUT') => {
    if (!walletTarget || walletAmount <= 0) return;

    const users = StorageService.getUsers();
    const index = users.findIndex(u => u.id === walletTarget.userId);
    if (index === -1) return;

    if (type === 'OUT' && users[index].wallet < walletAmount) {
      alert('ยอดเงินคงเหลือไม่เพียงพอสำหรับการตัดเงิน');
      return;
    }

    users[index].wallet = type === 'IN' ? users[index].wallet + walletAmount : users[index].wallet - walletAmount;
    
    const history = StorageService.getWalletHistory();
    history.push({
      id: `WH-${Date.now()}`,
      userId: walletTarget.userId,
      type,
      amount: walletAmount,
      reason: type === 'IN' ? 'เติมเงินโดยแอดมิน' : 'หักเงินโดยแอดมิน',
      date: new Date().toLocaleString('th-TH'),
      adminName: 'ตะวัน'
    });

    StorageService.setUsers(users);
    StorageService.setWalletHistory(history);
    setWalletTarget(null);
    setWalletAmount(0);
    refreshData();
  };

  const deleteProduct = (id: string) => {
    if (window.confirm('ยืนยันการลบสินค้า?')) {
      const filtered = StorageService.getProducts().filter(p => p.id !== id);
      StorageService.setProducts(filtered);
      refreshData();
    }
  };

  const totalSales = orders.reduce((sum, o) => sum + o.price, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <div className="lg:w-64 space-y-2">
        <button onClick={() => setTab('products')} className={`w-full text-left px-6 py-3 rounded-xl font-bold ${tab === 'products' ? 'bg-yellow-400 text-yellow-900 shadow-md' : 'hover:bg-slate-200'}`}>จัดการสินค้า</button>
        <button onClick={() => setTab('users')} className={`w-full text-left px-6 py-3 rounded-xl font-bold ${tab === 'users' ? 'bg-yellow-400 text-yellow-900 shadow-md' : 'hover:bg-slate-200'}`}>สมาชิก & Wallet</button>
        <button onClick={() => setTab('orders')} className={`w-full text-left px-6 py-3 rounded-xl font-bold ${tab === 'orders' ? 'bg-yellow-400 text-yellow-900 shadow-md' : 'hover:bg-slate-200'}`}>ออเดอร์ทั้งหมด</button>
        <button onClick={() => setTab('settings')} className={`w-full text-left px-6 py-3 rounded-xl font-bold ${tab === 'settings' ? 'bg-yellow-400 text-yellow-900 shadow-md' : 'hover:bg-slate-200'}`}>ตั้งค่าร้านค้า</button>
        
        <div className="mt-8 p-4 bg-slate-900 rounded-2xl text-white roblox-shadow">
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">ยอดขายรวม</p>
          <p className="text-2xl font-black">฿ {totalSales.toLocaleString()}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-white p-6 rounded-2xl border-2 border-slate-200 roblox-shadow">
        
        {tab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">จัดการสินค้า</h3>
              <button 
                onClick={() => setEditingProduct({ name: '', productId: '', price: 0, description: '', imageUrl: '', secretCode: '', isAvailable: true })}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-sm roblox-button shadow-md"
              >
                + เพิ่มสินค้าใหม่
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">สินค้า</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">รหัสอ้างอิง</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">ราคา</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">สถานะ</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-md object-cover border border-slate-200" />
                          <span className="font-bold text-slate-700">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-mono text-sm text-slate-500">{p.productId}</td>
                      <td className="py-3 px-2 font-black text-slate-800">฿{p.price.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${p.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {p.isAvailable ? 'เปิดขาย' : 'ปิดการขาย'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <button onClick={() => setEditingProduct(p)} className="text-blue-500 hover:underline text-sm font-bold">แก้ไข</button>
                          <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:underline text-sm font-bold">ลบ</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="space-y-6">
             <h3 className="text-xl font-black italic uppercase tracking-tighter">สมาชิกทั้งหมด</h3>
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">ชื่อผู้ใช้</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">Wallet</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">สิทธิ์</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">ดำเนินการ</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-2 font-bold text-slate-700">{u.username}</td>
                      <td className="py-3 px-2 font-black text-yellow-600">฿{u.wallet.toLocaleString()}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${u.isAdmin ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                          {u.isAdmin ? 'แอดมิน' : 'สมาชิก'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button onClick={() => setWalletTarget({ userId: u.id, username: u.username })} className="bg-orange-100 text-orange-600 px-3 py-1 rounded-md text-xs font-black hover:bg-orange-200">
                          จัดการเงิน
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
             </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">ประวัติการสั่งซื้อ (Order History)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">OrderID</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">ผู้ซื้อ</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">สินค้า</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">ราคา</th>
                    <th className="py-3 px-2 text-xs font-black uppercase text-slate-400">วันที่</th>
                  </tr>
                </thead>
                <tbody>
                  {[...orders].reverse().map(o => (
                    <tr key={o.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-3 px-2 text-[10px] font-mono text-slate-400">{o.id}</td>
                      <td className="py-3 px-2 font-bold text-slate-700">{o.username}</td>
                      <td className="py-3 px-2 text-sm">{o.productName}</td>
                      <td className="py-3 px-2 font-black">฿{o.price.toLocaleString()}</td>
                      <td className="py-3 px-2 text-xs text-slate-500">{o.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">ตั้งค่าร้านค้า</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="block text-sm font-black uppercase text-slate-600">โลโก้ร้าน (สี่เหลี่ยมจตุรัส)</label>
                <div className="flex items-center gap-4">
                  <img src={settings.logoUrl} className="w-20 h-20 rounded-xl object-cover border-2 border-slate-200" alt="logo preview" />
                  <input type="file" onChange={(e) => handleImageUpload(e, (url) => {
                    const newSettings = { ...settings, logoUrl: url };
                    StorageService.setSettings(newSettings);
                    refreshData();
                  })} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 cursor-pointer" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-black uppercase text-slate-600">แบนเนอร์ร้าน (แนวนอน)</label>
                <div className="space-y-2">
                  <img src={settings.bannerUrl} className="w-full h-24 rounded-xl object-cover border-2 border-slate-200" alt="banner preview" />
                  <input type="file" onChange={(e) => handleImageUpload(e, (url) => {
                    const newSettings = { ...settings, bannerUrl: url };
                    StorageService.setSettings(newSettings);
                    refreshData();
                  })} className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-yellow-400 animate-in fade-in zoom-in duration-200">
            <div className="bg-yellow-400 p-4 flex justify-between items-center">
              <h4 className="font-black italic uppercase text-yellow-900">{editingProduct.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h4>
              <button onClick={() => setEditingProduct(null)} className="text-yellow-900 font-bold">ปิด</button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ชื่อสินค้า</label>
                  <input required value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">รหัสอ้างอิงไอเทม (SKU)</label>
                  <input required value={editingProduct.productId} onChange={e => setEditingProduct({...editingProduct, productId: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">ราคา (฿)</label>
                  <input type="number" required value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full border-2 border-slate-100 rounded-xl px-4 py-2" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">รหัสสินค้า / โค้ด (จะแสดงเมื่อซื้อแล้ว)</label>
                  <input required value={editingProduct.secretCode} onChange={e => setEditingProduct({...editingProduct, secretCode: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl px-4 py-2" />
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">รูปสินค้า</label>
                  <input type="file" onChange={(e) => handleImageUpload(e, (url) => setEditingProduct({...editingProduct, imageUrl: url}))} className="w-full text-xs" />
                  {editingProduct.imageUrl && <img src={editingProduct.imageUrl} className="mt-2 w-full h-32 object-cover rounded-lg border border-slate-200" alt="" />}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">คำอธิบาย</label>
                  <textarea rows={3} value={editingProduct.description} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border-2 border-slate-100 rounded-xl px-4 py-2" />
                </div>
                <div className="flex items-center gap-2">
                   <input type="checkbox" checked={editingProduct.isAvailable} onChange={e => setEditingProduct({...editingProduct, isAvailable: e.target.checked})} id="isAvailable" />
                   <label htmlFor="isAvailable" className="text-sm font-bold text-slate-700">เปิดให้ซื้อได้ (Available)</label>
                </div>
              </div>
              <div className="md:col-span-2 pt-4">
                <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest roblox-button">บันทึกข้อมูล</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Wallet Management Modal */}
      {walletTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border-4 border-orange-500 animate-in fade-in slide-in-from-bottom-4 duration-200">
             <div className="bg-orange-500 p-4 flex justify-between items-center text-white">
                <h4 className="font-black">จัดการ Wallet: {walletTarget.username}</h4>
                <button onClick={() => setWalletTarget(null)} className="font-bold">ปิด</button>
             </div>
             <div className="p-8 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 text-center">จำนวนเงิน (฿)</label>
                  <input 
                    type="number" 
                    value={walletAmount} 
                    onChange={e => setWalletAmount(Number(e.target.value))} 
                    className="w-full text-center text-4xl font-black py-4 border-b-4 border-slate-100 focus:border-orange-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div className="flex gap-4">
                   <button onClick={() => handleWalletAdjust('IN')} className="flex-1 bg-green-500 text-white py-4 rounded-2xl font-black roblox-button shadow-lg">+ เติมเงิน</button>
                   <button onClick={() => handleWalletAdjust('OUT')} className="flex-1 bg-red-500 text-white py-4 rounded-2xl font-black roblox-button shadow-lg">- หักเงิน</button>
                </div>
                <p className="text-[10px] text-slate-400 text-center uppercase font-bold tracking-widest">การทำรายการจะถูกบันทึกในประวัติทันที</p>
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
