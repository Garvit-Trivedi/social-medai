import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, API_URL } from '../lib/api';
import AppLayout from '../components/layout/AppLayout';

export default function SearchUsers() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!q.trim()) { setResults([]); return; }
      setLoading(true);
      try {
        const res = await apiRequest(`/api/users/search?u=${encodeURIComponent(q.trim())}`);
        setResults(res.users || []);
      } catch {}
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  async function doSearch(e) {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      if (q.trim()) {
        const res = await apiRequest(`/api/users/search?u=${encodeURIComponent(q.trim())}`);
        setResults(res.users || []);
      } else {
        const res = await apiRequest('/api/users/all');
        setResults(res.users || []);
      }
    } catch {}
    setLoading(false);
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Find Creators</h1>
          <p className="mt-2 text-gray-500 font-medium">Search for artists, makers, and dreamers on Pulse.</p>
        </div>

        <form onSubmit={doSearch} className="relative group">
          <input
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            placeholder="Search by username..."
            className="w-full rounded-2xl bg-[#0f161b] border border-white/5 px-6 py-4 text-sm outline-none focus:border-purple-500/50 transition-all shadow-xl"
          />
          <button type="submit" className="absolute right-3 top-2 bottom-2 px-6 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition-all">
            Search
          </button>
        </form>

        <div className="mt-8 space-y-4">
          {loading && (
            <div className="space-y-4">
               {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
            </div>
          )}
          
          {!loading && results.length === 0 && q.trim() && (
            <div className="text-center py-10 opacity-30">No creators found matching "{q}"</div>
          )}

          {!loading && results.map(u => (
            <Link 
              key={u._id} 
              to={`/u/${u.username}`} 
              className="flex items-center gap-4 p-4 rounded-2xl bg-[#0f161b]/40 border border-white/5 hover:bg-[#0f161b] hover:scale-[1.02] transition-all shadow-lg"
            >
              <img 
                src={u.avatarUrl ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : API_URL + u.avatarUrl) : '/avatar.svg'} 
                alt="Avatar" 
                className="w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-md" 
              />
              <div className="flex-1">
                <div className="text-sm font-bold text-white">{u.displayName || u.username}</div>
                <div className="text-xs text-purple-400 font-medium">@{u.username}</div>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">View Profile</div>
            </Link>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
