'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState('');
  
  // State untuk form order
  const [item, setItem] = useState('Laptop');
  const [qty, setQty] = useState(1);
  const [statusMsg, setStatusMsg] = useState('');

  // State untuk data stok
  const [stocks, setStocks] = useState<any>(null);

  // 1. Fungsi ambil data stok dari Inventory Service (Port 8001)
  const fetchStocks = async () => {
    try {
      const res = await fetch('http://localhost:8001/stocks');
      const data = await res.json();
      setStocks(data);
    } catch (err) {
      console.error("Gagal ambil stok:", err);
    }
  };

  // 2. Fungsi kirim order ke Order Service (Port 8000)
  const handleOrder = async (e: any) => {
    e.preventDefault();
    setStatusMsg('Mengirim...');

    try {
      const res = await fetch('http://localhost:8000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          item_id: item, 
          quantity: Number(qty) 
        }),
      });

      if (res.ok) {
        setStatusMsg('✅ Order Terkirim ke RabbitMQ!');
        // Refresh stok otomatis setelah 1 detik (beri waktu RabbitMQ memproses)
        setTimeout(fetchStocks, 1000);
      } else {
        setStatusMsg('❌ Gagal mengirim order.');
      }
    } catch (err) {
      setStatusMsg('❌ Error koneksi ke backend.');
    }
  };

  // Cek Login saat halaman dibuka
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('user');
    if (!token) {
      router.push('/login'); // Tendang ke login kalau gak ada token
    } else {
      setUser(username || 'Admin');
    }
    fetchStocks();
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 p-10 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-blue-700 mb-2">SCM Dashboard</h1>
            <p className="text-gray-600">Sistem Supply Chain Microservices (Python + Next.js)</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-bold">Hi, {user}</span>
            <button 
              onClick={() => {
                localStorage.clear();
                router.push('/login');
              }} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* KIRI: FORM ORDER */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-4 border-b pb-2">📦 Buat Pesanan</h2>
            <form onSubmit={handleOrder} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Pilih Barang</label>
                <select 
                  value={item} 
                  onChange={(e) => setItem(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Mouse">Mouse</option>
                  <option value="Keyboard">Keyboard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">Jumlah</label>
                <input 
                  type="number" 
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Kirim Order
              </button>
            </form>
            {statusMsg && (
              <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-center font-medium">
                {statusMsg}
              </div>
            )}
          </div>

          {/* KANAN: MONITOR STOK */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-2xl font-bold">🏭 Gudang (Realtime)</h2>
              <button onClick={fetchStocks} className="text-sm text-blue-500 hover:underline">
                Refresh Data
              </button>
            </div>

            {stocks ? (
              <ul className="space-y-3">
                {Object.entries(stocks).map(([namaBarang, jumlah]) => (
                  <li key={namaBarang} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-lg">{namaBarang}</span>
                    <span className={`px-3 py-1 rounded-full text-white font-bold text-sm ${
                      (jumlah as number) > 20 ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {jumlah as number} Unit
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-10">Sedang memuat data stok...</p>
            )}
            
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg text-xs text-yellow-800 border border-yellow-200">
              ℹ️ <strong>Konsep EAI:</strong> Saat tombol "Kirim Order" ditekan, Frontend memanggil 
              Order Service. Order Service mengirim pesan ke RabbitMQ. Inventory Service mengambil pesan 
              itu dan mengurangi stok secara otomatis di background.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
