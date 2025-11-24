import React, { useEffect, useMemo, useState } from 'react';
import { apiRequest, API_URL } from '../lib/api';

export default function Settings() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [blocked, setBlocked] = useState([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    (async () => {
      try {
        const b = await apiRequest('/api/users/blocks/list');
        setBlocked(b.blocked || []);
      } catch {}
      try {
        const p = await apiRequest('/api/posts/me');
        setMyPosts(p.posts || []);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setResults([]); return; }
      try {
        const res = await apiRequest(`/api/users/search?u=${encodeURIComponent(search.trim())}`);
        setResults(res.users || []);
      } catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const blockUser = async (id) => {
    setBusy(true);
    try {
      await apiRequest(`/api/users/${id}/block`, { method: 'POST' });
      const b = await apiRequest('/api/users/blocks/list'); setBlocked(b.blocked || []);
    } catch (e) { setError(e.message); }
    setBusy(false);
  };
  const unblockUser = async (id) => {
    setBusy(true);
    try {
      await apiRequest(`/api/users/${id}/block`, { method: 'DELETE' });
      const b = await apiRequest('/api/users/blocks/list'); setBlocked(b.blocked || []);
    } catch (e) { setError(e.message); }
    setBusy(false);
  };
  const deletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;
    setBusy(true);
    try {
      await apiRequest(`/api/posts/${postId}`, { method: 'DELETE' });
      setMyPosts((arr) => arr.filter((p) => p._id !== postId));
    } catch (e) { setError(e.message); }
    setBusy(false);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#EEECF1]">
      <div className="mx-auto max-w-[920px] px-4 py-6 space-y-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        {error && <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">{error}</div>}

        {/* Theme */}
        <section className="bg-[#1c1e22] border border-black/30 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[15px] font-semibold">Appearance</div>
              <div className="text-sm text-[#bfb9c5]">Toggle color theme</div>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <span className="text-sm">Dark</span>
              <input type="checkbox" checked={theme === 'light'} onChange={(e)=>setTheme(e.target.checked?'light':'dark')} className="sr-only" />
              <span className="relative w-12 h-6 bg-black/30 rounded-full">
                <span className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${theme==='light'?'left-6 bg-[#A28DB9]':'left-1 bg-white/60'}`} />
              </span>
              <span className="text-sm">Light</span>
            </label>
          </div>
        </section>

        {/* Block management */}
        <section className="bg-[#1c1e22] border border-black/30 rounded-lg p-4">
          <div className="text-[15px] font-semibold mb-2">Blocked users</div>
          <div className="flex gap-2 mb-3">
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search username to block" className="flex-1 rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2 text-sm" />
          </div>
          <div className="space-y-2">
            {results.map(u => (
              <div key={u._id} className="flex items-center gap-3 p-2 rounded bg-black/20">
                <img src={u.avatarUrl ? (u.avatarUrl.startsWith('http')?u.avatarUrl:API_URL+u.avatarUrl) : '/avatar.svg'} alt="Avatar" className="w-8 h-8 rounded-full" />
                <div className="flex-1 text-sm">@{u.username}</div>
                <button disabled={busy} onClick={()=>blockUser(u._id)} className="px-3 py-1 rounded-md text-sm bg-red-500/20 text-red-300 border border-red-500/30">Block</button>
              </div>
            ))}
            {results.length===0 && <div className="text-sm text-[#9aa5b1]">Type a username to find and block</div>}
          </div>
          <div className="mt-4 text-sm text-[#bfb9c5]">Currently blocked</div>
          <ul className="mt-2 space-y-2">
            {blocked.map(u => (
              <li key={u._id} className="flex items-center gap-3 p-2 rounded bg-black/10">
                <img src={u.avatarUrl ? (u.avatarUrl.startsWith('http')?u.avatarUrl:API_URL+u.avatarUrl) : '/avatar.svg'} alt="Avatar" className="w-8 h-8 rounded-full" />
                <div className="flex-1 text-sm">@{u.username}</div>
                <button disabled={busy} onClick={()=>unblockUser(u._id)} className="px-3 py-1 rounded-md text-sm border border-black/40">Unblock</button>
              </li>
            ))}
            {blocked.length===0 && <li className="text-sm text-[#9aa5b1]">No blocked users</li>}
          </ul>
        </section>

        {/* Delete posts */}
        <section className="bg-[#1c1e22] border border-black/30 rounded-lg p-4">
          <div className="text-[15px] font-semibold mb-2">Manage your posts</div>
          {myPosts.length === 0 ? (
            <div className="text-sm text-[#9aa5b1]">You have no posts.</div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {myPosts.map(p => {
                const mediaSrc = p.video?.url ? p.video.url : p.images?.[0]?.url;
                const resolved = mediaSrc && (mediaSrc.startsWith('http') ? mediaSrc : API_URL + mediaSrc);
                return (
                  <li key={p._id} className="relative group">
                    <div className="aspect-square bg-black/20 rounded overflow-hidden">
                      {p.video?.url ? (
                        <video src={resolved} muted loop autoPlay className="w-full h-full object-cover" />
                      ) : (
                        <img src={resolved} alt="Post" className="w-full h-full object-cover" />
                      )}
                    </div>
                    <button
                      onClick={()=>deletePost(p._id)}
                      className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-red-500/80 text-white opacity-0 group-hover:opacity-100"
                    >Delete</button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
      {/* Simple theme CSS variables that other pages can adopt later */}
      <style>{`
        :root { --accent: #A28DB9; }
        [data-theme="light"] { --accent: #60a5fa; }
        .accent { color: var(--accent); }
        .accent-bg { background-color: var(--accent); }
        .accent-ring:focus { outline-color: color-mix(in srgb, var(--accent), transparent 60%); }
      `}</style>
    </div>
  );
}
