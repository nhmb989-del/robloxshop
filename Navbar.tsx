
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';

const Navbar: React.FC = () => {
  const { user, setUser, settings } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white border-b-4 border-yellow-400 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 rounded-lg object-cover border-2 border-yellow-500" />
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">ROBLOX STORE</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border border-yellow-400">
                   <span className="text-yellow-700 font-bold">฿ {user.wallet.toLocaleString()}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">ยินดีต้อนรับ, {user.username}</span>
              </div>
              
              <div className="flex gap-2">
                {user.isAdmin && (
                  <Link to="/admin" className="px-4 py-2 bg-orange-500 text-white rounded-md text-sm font-bold roblox-button shadow-md">
                    แอดมิน
                  </Link>
                )}
                <Link to="/profile" className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-md text-sm font-bold roblox-button shadow-md">
                  ประวัติ
                </Link>
                <button onClick={handleLogout} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md text-sm font-bold roblox-button">
                  ออก
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="px-4 py-2 text-slate-700 font-bold text-sm">เข้าสู่ระบบ</Link>
              <Link to="/signup" className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-md font-bold text-sm roblox-button shadow-md">
                สมัครสมาชิก
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
