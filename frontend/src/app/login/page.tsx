'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8002/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', username);
        alert('Login Berhasil!');
        router.push('/'); // Pindah ke Dashboard
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Login Gagal!' }));
        alert(`Login Gagal! ${errorData.detail || 'Cek username/password.'}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Error koneksi ke server. Pastikan auth-service berjalan di port 8002.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Login SCM</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            className="w-full border p-2 rounded text-black" 
            placeholder="Username" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input 
            className="w-full border p-2 rounded text-black" 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Masuk
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun? <a href="/register" className="text-blue-500 hover:underline">Daftar</a>
        </p>
      </div>
    </div>
  );
}

