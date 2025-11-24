import React, { useEffect, useState } from 'react';
import { apiRequest, API_URL } from '../lib/api';

export default function Saved() {
  const [posts, setPosts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const s = await apiRequest('/api/posts/saved/list');
      setPosts(s.posts || []);
      const c = await apiRequest('/api/posts/collections');
      setCollections(c.collections || []);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { load(); }, []);

  const createCollection = async () => {
    if (!name.trim()) return;
    try {
      await apiRequest('/api/posts/collections', { method: 'POST', body: { name } });
      setName('');
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#EEECF1]">
      <div className="max-w-[920px] mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">Saved Posts</h1>
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-[#1c1e22] border border-black/30 rounded-lg p-4">
            <h2 className="text-[15px] font-semibold mb-3">All Saved</h2>
            {posts.length === 0 ? (
              <div className="text-sm text-[#9aa5b1]">No saved posts yet.</div>
            ) : (
              <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {posts.map((p) => {
                  const mediaSrc = p.video?.url ? p.video.url : p.images?.[0]?.url;
                  const resolved = mediaSrc && (mediaSrc.startsWith('http') ? mediaSrc : API_URL + mediaSrc);
                  return (
                    <li key={p._id} className="aspect-square bg-black/20 rounded overflow-hidden">
                      {p.video?.url ? (
                        <video src={resolved} muted loop autoPlay className="w-full h-full object-cover" />
                      ) : (
                        <img src={resolved} alt="Saved" className="w-full h-full object-cover" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="bg-[#1c1e22] border border-black/30 rounded-lg p-4">
            <h2 className="text-[15px] font-semibold mb-3">Collections</h2>
            <div className="flex gap-2 mb-3">
              <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="New collection name" className="flex-1 rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2 text-sm" />
              <button onClick={createCollection} className="px-3 py-2 rounded-md bg-[#A28DB9] text-black text-sm">Create</button>
            </div>
            {collections.length === 0 ? (
              <div className="text-sm text-[#9aa5b1]">No collections.</div>
            ) : (
              <ul className="space-y-2">
                {collections.map((c) => (
                  <li key={c._id} className="p-3 bg-black/20 rounded">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-[#9aa5b1]">{c.posts?.length || 0} items</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
