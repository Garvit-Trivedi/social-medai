import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, API_URL } from '../lib/api';

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

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#EEECF1]">
      <div className="max-w-[720px] mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">Search Users</h1>
        <input
          value={q}
          onChange={(e)=>setQ(e.target.value)}
          placeholder="Search by username"
          className="w-full rounded-md bg-[#1c1e22] border border-black/30 px-3 py-2"
        />
        <div className="mt-4 space-y-2">
          {loading && <div className="text-sm text-[#9aa5b1]">Searching…</div>}
          {!loading && results.map(u => (
            <Link key={u._id} to={`/u/${u.username}`} className="flex items-center gap-3 p-2 rounded bg-[#1c1e22] border border-black/20 hover:bg-black/20">
              <img src={u.avatarUrl ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : API_URL + u.avatarUrl) : '/avatar.svg'} alt={`${u.username} avatar`} className="w-8 h-8 rounded-full" />
              <div>
                <div className="text-sm font-medium">{u.displayName || u.username}</div>
                <div className="text-xs text-[#9aa5b1]">@{u.username}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
