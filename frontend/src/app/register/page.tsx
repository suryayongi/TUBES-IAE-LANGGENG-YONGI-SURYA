"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('worker');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8002/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, role }),
    });
    if (res.ok) {
      alert('Registration Successful');
      router.push('/login');
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 items-center justify-center font-sans text-slate-900">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">New Personnel</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 italic">Official registration portal</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Username Identification</label>
            <input 
              type="text" 
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Security Password</label>
            <input 
              type="password" 
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Assigned Role</label>
            <select 
              className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold border border-slate-100 focus:outline-none"
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="worker">STAFF GUDANG</option>
              <option value="admin">ADMINISTRATOR</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl shadow-blue-500/20 active:scale-95">Register Officer</button>
        </form>
        
        <p onClick={() => router.push('/login')} className="text-center mt-8 text-slate-400 text-[10px] font-black cursor-pointer hover:text-slate-900">BACK TO AUTHENTICATION</p>
      </div>
    </div>
  );
}