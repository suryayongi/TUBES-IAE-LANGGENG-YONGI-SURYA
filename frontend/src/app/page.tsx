"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StockItem { item_id: string; quantity: number; }
interface HistoryItem { type: string; item: string; qty: number; time: string; }

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [inputs, setInputs] = useState<{[key: string]: string}>({});
  const [role, setRole] = useState("");
  const [debugMsg, setDebugMsg] = useState("");
  const router = useRouter();

  const fetchData = async () => {
    try {
      const resStock = await fetch('/api/inventory/stocks');
      if (!resStock.ok) throw new Error(`Stok Error: ${resStock.status}`);
      const s = await resStock.json();

      const resHist = await fetch('/api/inventory/history');
      if (!resHist.ok) throw new Error(`History Error: ${resHist.status}`);
      const h = await resHist.json();

      if (Array.isArray(s)) setStocks(s);
      if (Array.isArray(h)) setHistory(h);
      setDebugMsg(""); 
    } catch (e: any) {
      console.error(e);
      setDebugMsg(`GAGAL KONEK: ${e.message}`);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    if (!token) {
      router.push('/login');
    } else {
      setRole(userRole || "worker");
      fetchData();
      const interval = setInterval(fetchData, 2000);
      return () => clearInterval(interval);
    }
  }, [router]);

  const handleInputChange = (id: string, value: string) => {
    setInputs(prev => ({ ...prev, [id]: value }));
  };

  const handleAction = async (type: string, id: string) => {
    const qtyInput = parseInt(inputs[id] || '1');
    const quantity = qtyInput > 0 ? qtyInput : 1;

    if (type === 'order') {
      const currentItem = stocks.find(s => s.item_id === id);
      
      if (currentItem) {
        // Cek 1: Apakah stok sudah habis total?
        if (currentItem.quantity <= 0) {
          alert("Maaf stock habis");
          return; r
        }
        
        // Cek 2: Apakah jumlah order melebihi sisa stok?
        if (quantity > currentItem.quantity) {
          alert(`Maaf, Pesanan melebihi stock tersedia (Sisa: ${currentItem.quantity})`);
          return; 
        }
      }
    }

    try {
      const url = type === 'order' ? '/api/order/orders' : '/api/inventory/restock';
      const res = await fetch(url, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ item_id: id, quantity: quantity }) 
      });
      
      if (!res.ok) throw new Error("Gagal kirim data");
      
      setInputs(prev => ({ ...prev, [id]: '' }));
      fetchData(); // Refresh data instan
    } catch (e: any) {
      alert(`Gagal Action: ${e.message}`);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950 text-white font-sans overflow-hidden">
      <aside className="w-72 bg-slate-950 p-8 flex flex-col border-r border-slate-900 shadow-2xl">
        <div className="flex items-center gap-4 mb-14 text-white">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-blue-600/30">L</div>
          <h1 className="text-2xl font-black tracking-tighter">LANG SCM</h1>
        </div>
        <nav className="flex-1 space-y-4 font-black text-xs tracking-widest text-slate-500 uppercase">
          <div className="p-4 bg-blue-600 rounded-2xl text-white cursor-pointer">Dashboard</div>
          <div className="p-4 cursor-pointer hover:text-slate-300">Inventory List</div>
        </nav>
        <div className="p-6 bg-slate-900 rounded-[2.5rem] border border-slate-800">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">{role} System</p>
          <p className="text-sm font-bold text-blue-400 mb-6 capitalize">{role}</p>
          <button onClick={handleLogout} className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-black text-[10px] uppercase hover:bg-red-500 hover:text-white transition-all">Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12 bg-slate-950">
        <header className="mb-14 flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight uppercase tracking-tighter">Operational Hub</h2>
            <p className="text-slate-500 font-bold mt-2 uppercase text-[10px] tracking-[0.3em]">Live Data Integration Stream</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl text-[10px] font-black text-emerald-500 animate-pulse tracking-widest uppercase">Node Secure</div>
        </header>

        {debugMsg && (
          <div className="bg-red-500/20 border border-red-500 p-4 rounded-2xl mb-8 text-red-400 font-bold text-center">
            ⚠️ {debugMsg}
          </div>
        )}

        <div className="grid grid-cols-3 gap-8 mb-14 text-center">
          <div className="bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-800 hover:border-blue-500 transition-all">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2">Total Assets</p>
            <p className="text-6xl font-black">{stocks.length}</p>
          </div>
          <div className="bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-800">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2">Critical Level</p>
            <p className="text-6xl font-black text-red-600">{stocks.filter(s => s.quantity < 10).length}</p>
          </div>
          <div className="bg-slate-900/50 p-10 rounded-[3.5rem] border border-slate-800">
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-widest mb-2">Total Events</p>
            <p className="text-6xl font-black text-blue-400">{history.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-12 text-white">
          <div className="col-span-2 bg-slate-900/30 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead className="bg-slate-950/50">
                <tr>
                  <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest tracking-tighter">Asset Name</th>
                  <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stock Level</th>
                  <th className="px-12 py-8 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900 text-white font-sans">
                {stocks.map((s) => (
                  <tr key={s.item_id} className="hover:bg-white/5 transition-all">
                    <td className="px-12 py-9 font-black text-xl tracking-tighter">{s.item_id}</td>
                    <td className="px-12 py-9 text-center">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black border ${s.quantity < 10 ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'}`}>{s.quantity} UNITS</span>
                    </td>
                    <td className="px-12 py-9 text-right">
                      <div className="flex justify-end items-center gap-3">
                        <input 
                          type="number" 
                          placeholder="Qty" 
                          className="w-16 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-center text-xs font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-700"
                          value={inputs[s.item_id] || ''}
                          onChange={(e) => handleInputChange(s.item_id, e.target.value)}
                        />
                        {role === 'admin' ? (
                          <button onClick={() => handleAction('order', s.item_id)} className="bg-white text-slate-950 px-6 py-2 rounded-xl text-[10px] font-black hover:bg-blue-500 hover:text-white transition-all shadow-xl shadow-white/5 uppercase active:scale-95">ORDER</button>
                        ) : (
                          <button onClick={() => handleAction('restock', s.item_id)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black hover:bg-white hover:text-slate-950 transition-all shadow-xl shadow-blue-600/10 uppercase active:scale-95">RESTOCK</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-950 p-10 rounded-[3.5rem] border border-slate-900 shadow-2xl">
            <h3 className="text-xl font-black mb-10 tracking-tighter uppercase text-slate-400 tracking-widest text-center">Audit Trail</h3>
            <div className="space-y-10">
              {history.map((h, i) => (
                <div key={i} className="flex gap-5 relative">
                  {i !== history.length - 1 && <div className="absolute left-[13px] top-8 bottom-[-45px] w-[2px] bg-slate-900"></div>}
                  <div className={`w-7 h-7 rounded-full flex-shrink-0 z-10 border-4 border-slate-950 shadow-lg ${h.type === 'ORDER' ? 'bg-orange-500' : 'bg-blue-600'}`}></div>
                  <div className="flex-1 -mt-1 text-white">
                    <div className="flex justify-between font-black text-[9px] tracking-widest uppercase">
                      <span className={h.type === 'ORDER' ? 'text-orange-500' : 'text-blue-500'}>{h.type}</span>
                      <span className="text-slate-700">{h.time}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-400 mt-2">{h.item} <span className="text-slate-200">{h.type === 'ORDER' ? 'ordered' : 'restocked'}</span>: {h.qty} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}