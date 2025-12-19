"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:8002/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        router.push('/');
      } else {
        setError(data.detail || 'LOGIN FAILED');
      }
    } catch (err) {
      setError('AUTH SERVICE OFFLINE');
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 items-center justify-center font-sans text-white">
      <div className="w-full max-w-md bg-slate-900 p-12 rounded-[3rem] border border-slate-800 shadow-2xl">
        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center font-black text-2xl">L</div>
          <h2 className="text-3xl font-black tracking-tight uppercase">SCM Portal</h2>
          <p className="text-slate-500 text-xs mt-2 font-bold tracking-widest uppercase">Operator Access Only</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[10px] font-black mb-8 text-center uppercase tracking-widest">{error}</div>}
        <form onSubmit={handleLogin} className="space-y-6">
          <input type="text" className="w-full px-6 py-4 bg-slate-800 rounded-2xl text-sm font-bold border border-slate-700 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="USER ID" onChange={(e) => setUsername(e.target.value)} required />
          <input type="password" className="w-full px-6 py-4 bg-slate-800 rounded-2xl text-sm font-bold border border-slate-700 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600" placeholder="ACCESS KEY" onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="w-full bg-blue-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-all active:scale-95 shadow-xl shadow-blue-600/10">Authenticate</button>
        </form>
        <p className="text-center mt-10 text-slate-600 text-[10px] font-black tracking-widest cursor-pointer hover:text-white" onClick={() => router.push('/register')}>REGISTER NEW OPERATOR</p>
      </div>
    </div>
  );
}