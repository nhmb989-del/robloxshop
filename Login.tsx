
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../App';
import { StorageService } from '../services/storage';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const users = StorageService.getUsers();
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
      setUser(user);
      StorageService.setCurrentUser(user);
      navigate('/');
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white p-8 rounded-2xl border-2 border-yellow-400 roblox-shadow">
        <h2 className="text-3xl font-black text-center text-slate-800 mb-8 italic uppercase tracking-tighter">เข้าสู่ระบบ</h2>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-600 p-3 rounded-lg text-sm mb-6 font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">ชื่อผู้ใช้</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-yellow-400 focus:outline-none transition-all"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">รหัสผ่าน</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-yellow-400 focus:outline-none transition-all"
              placeholder="Password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-400 text-yellow-900 py-4 rounded-xl font-black text-lg roblox-button shadow-lg uppercase tracking-wider mt-4"
          >
            เข้าสู่ระบบ
          </button>
        </form>

        <p className="mt-8 text-center text-slate-500 text-sm font-medium">
          ยังไม่มีบัญชี? <Link to="/signup" className="text-orange-500 font-bold hover:underline">สมัครสมาชิกที่นี่</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
