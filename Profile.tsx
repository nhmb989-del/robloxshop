
import React, { useState } from 'react';
import { useApp } from '../App';

const Profile: React.FC = () => {
  const { user, orders, walletHistory } = useApp();
  const [activeTab, setActiveTab] = useState<'orders' | 'wallet'>('orders');

  const userOrders = orders.filter(o => o.userId === user?.id).sort((a,b) => b.date.localeCompare(a.date));
  const userWalletHistory = walletHistory.filter(h => h.userId === user?.id).sort((a,b) => b.date.localeCompare(a.date));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 roblox-shadow flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center text-4xl font-black text-yellow-900 border-4 border-white shadow-md">
          {user?.username.charAt(0).toUpperCase()}
        </div>
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-black text-slate-800">{user?.username}</h2>
          <p className="text-slate-500 font-medium italic">สมาชิกทั่วไป</p>
        </div>
        <div className="md:ml-auto bg-slate-900 text-white px-8 py-4 rounded-xl text-center">
          <p className="text-xs font-bold text-yellow-400 uppercase tracking-widest mb-1">ยอดเงินคงเหลือ</p>
          <p className="text-3xl font-black">฿ {user?.wallet.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden roblox-shadow">
        <div className="flex border-b-2 border-slate-100">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-4 font-black uppercase tracking-tighter text-lg ${activeTab === 'orders' ? 'bg-yellow-400 text-yellow-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ประวัติการสั่งซื้อ ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('wallet')}
            className={`flex-1 py-4 font-black uppercase tracking-tighter text-lg ${activeTab === 'wallet' ? 'bg-yellow-400 text-yellow-900' : 'text-slate-400 hover:text-slate-600'}`}
          >
            ประวัติ Wallet ({userWalletHistory.length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'orders' ? (
            <div className="space-y-4">
              {userOrders.length === 0 ? (
                <p className="text-center py-12 text-slate-400 font-medium italic">ไม่พบประวัติการสั่งซื้อ</p>
              ) : (
                userOrders.map(order => (
                  <div key={order.id} className="border-2 border-slate-100 p-4 rounded-xl hover:border-yellow-400 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-400 uppercase">{order.id}</span>
                        <h3 className="font-bold text-slate-800 text-lg">{order.productName}</h3>
                      </div>
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">สำเร็จ</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4">
                      <div className="bg-slate-50 p-3 rounded-lg flex-grow border border-slate-200">
                        <span className="text-xs font-bold text-slate-400 block mb-1">รหัสสินค้า / ไอดี</span>
                        <span className="font-mono text-orange-600 font-bold select-all">{order.secretCode}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-bold">{order.date}</p>
                        <p className="text-xl font-black text-slate-800">฿ {order.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-slate-100">
                    <th className="py-4 px-2 text-xs font-black text-slate-400 uppercase">วันที่</th>
                    <th className="py-4 px-2 text-xs font-black text-slate-400 uppercase">ประเภท</th>
                    <th className="py-4 px-2 text-xs font-black text-slate-400 uppercase">จำนวน</th>
                    <th className="py-4 px-2 text-xs font-black text-slate-400 uppercase">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  {userWalletHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-slate-400 font-medium italic">ไม่พบประวัติการเงิน</td>
                    </tr>
                  ) : (
                    userWalletHistory.map(history => (
                      <tr key={history.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-2 text-sm text-slate-500">{history.date}</td>
                        <td className="py-4 px-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${history.type === 'IN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            {history.type === 'IN' ? 'เงินเข้า' : 'เงินออก'}
                          </span>
                        </td>
                        <td className={`py-4 px-2 font-black ${history.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                          {history.type === 'IN' ? '+' : '-'} {history.amount.toLocaleString()}
                        </td>
                        <td className="py-4 px-2 text-sm font-medium text-slate-700">
                          {history.reason}
                          {history.adminName && <span className="block text-[10px] text-slate-400">โดย: {history.adminName}</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
