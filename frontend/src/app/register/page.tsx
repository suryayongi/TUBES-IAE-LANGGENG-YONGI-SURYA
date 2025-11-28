'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8002/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        alert('Registrasi Sukses! Silakan Login.');
        router.push('/login');
      } else {
        const errorData = await res.json().catch(() => ({ detail: 'Gagal registrasi!' }));
        alert(`Gagal! ${errorData.detail || 'Username mungkin sudah ada.'}`);
      }
    } catch (err) {
      console.error('Register error:', err);
      alert('Error koneksi ke server. Pastikan auth-service berjalan di port 8002.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-green-600">Register SCM</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <input 
            className="w-full border p-2 rounded text-black" 
            placeholder="Username Baru" 
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input 
            className="w-full border p-2 rounded text-black" 
            type="password" 
            placeholder="Password Baru" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 transition"
          >
            Daftar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Sudah punya akun? <a href="/login" className="text-blue-500 hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
}

