"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface StockItem {
  item_id: string;
  quantity: number;
}

interface HistoryItem {
  type: string;
  item: string;
  qty: number;
  time: string;
}

export default function Dashboard() {
  const [stocks, setStocks] = useState<StockItem[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const resStock = await fetch('http://localhost:8001/stocks');
      const dataStock = await resStock.json();
      if (Array.isArray(dataStock)) setStocks(dataStock);

      const resHist = await fetch('http://localhost:8001/history');
      const dataHist = await resHist.json();
      if (Array.isArray(dataHist)) setHistory(dataHist);
    } catch (e) { console.error(e); }
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

  const handleAction = async (type: 'order' | 'restock', item_id: string) => {
    setLoading(true);
    try {
      const url = type === 'order' ? 'http://localhost:8000/orders' : 'http://localhost:8001/restock';
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_id, quantity: 1 })
      });
      setTimeout(fetchData, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <aside className="w-64 bg-slate-900 text-white p-6 shadow-2xl flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 font-black text-xl">L</div>
          <h1 className="text-xl font-black tracking-tighter">LANG LOG</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="p-3 bg-blue-600 rounded-xl cursor-pointer font-bold flex items-center gap-3">
             <span className="opacity-70">⊞</span> Dashboard
          </div>
          <div className="p-3 hover:bg-slate-800 rounded-xl cursor-pointer text-slate-400 font-medium transition-all flex items-center gap-3">
             <span className="opacity-50">📦</span> Inventory
          </div>
          <div className="p-3 hover:bg-slate-800 rounded-xl cursor-pointer text-slate-400 font-medium transition-all flex items-center gap-3">
             <span className="opacity-50">📈</span> Reports
          </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
            <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Access Level</p>
            <p className="text-sm font-black capitalize text-blue-400 mb-4">{role}</p>
            <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="w-full py-2 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold">Sign Out</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Logistics Hub</h2>
              <p className="text-slate-500 font-medium mt-2">Real-time supply chain control center</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-200 text-sm font-black flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                <span className="text-slate-600">LIVE MONITORING</span>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:border-blue-500 transition-colors group">
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Total SKU</p>
              <p className="text-5xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{stocks.length}</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Critical Stock</p>
              <p className="text-5xl font-black text-red-500">{stocks.filter(s => s.quantity < 10).length}</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Activity Count</p>
              <p className="text-5xl font-black text-emerald-500">{history.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-12">
            <div className="col-span-2 bg-white rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
                <h3 className="font-black text-2xl text-slate-900">Inventory Assets</h3>
                {loading && <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div></div>}
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</th>
                    <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {stocks.map((s) => (
                    <tr key={s.item_id} className="hover:bg-blue-50/20 transition-all group">
                      <td className="px-10 py-7">
                        <p className="font-black text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{s.item_id}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">SKU-{s.item_id.substring(0,3)}-001</p>
                      </td>
                      <td className="px-10 py-7">
                        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black border-2 ${s.quantity < 10 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                          {s.quantity} UNITS
                        </div>
                      </td>
                      <td className="px-10 py-7 text-right">
                        {role === 'admin' ? (
                          <button onClick={() => handleAction('order', s.item_id)} className="bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black hover:bg-blue-600 hover:-translate-y-1 transition-all shadow-lg shadow-slate-900/10 active:scale-95">ORDER</button>
                        ) : (
                          <button onClick={() => handleAction('restock', s.item_id)} className="bg-blue-600 text-white px-8 py-3 rounded-2xl text-xs font-black hover:bg-slate-900 hover:-translate-y-1 transition-all shadow-lg shadow-blue-600/20 active:scale-95">RESTOCK</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-[3rem] shadow-sm border border-slate-200 p-10">
              <h3 className="font-black text-2xl text-slate-900 mb-10 flex items-center gap-3">
                <span className="text-2xl">⏳</span> History
              </h3>
              <div className="space-y-10">
                {history.length === 0 && <p className="text-xs text-slate-400 text-center italic py-20 font-bold uppercase tracking-widest">No Recent Logs</p>}
                {history.map((h, i) => (
                  <div key={i} className="flex gap-5 items-start relative group">
                    {i !== history.length - 1 && <div className="absolute left-[13px] top-8 bottom-[-45px] w-[2px] bg-slate-100 group-hover:bg-blue-100 transition-colors"></div>}
                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-black border-4 border-white shadow-md z-10 ${h.type === 'ORDER' ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>
                      {h.type === 'ORDER' ? '−' : '+'}
                    </div>
                    <div className="flex-1 -mt-1">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-black text-slate-800 tracking-tight uppercase">{h.type}</p>
                        <span className="text-[10px] font-black text-slate-400">{h.time}</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 inline-block">{h.item} ({h.qty})</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}