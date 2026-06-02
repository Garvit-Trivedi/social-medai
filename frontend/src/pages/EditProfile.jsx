import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import AppLayout from '../components/layout/AppLayout';

function useDebouncedValue(value, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ displayName: '', username: '', bio: '', website: '', location: '', pronouns: '', isPrivate: false, notifications: { likes: true, comments: true, follows: true, messages: true } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usernameState, setUsernameState] = useState('idle'); 

  const debouncedUsername = useDebouncedValue(form.username);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/api/profile/me');
        const u = res.user;
        setForm({
          displayName: u.displayName || '',
          username: u.username || '',
          bio: u.bio || '',
          website: u.website || '',
          location: u.location || '',
          pronouns: u.pronouns || '',
          isPrivate: !!u.isPrivate,
          notifications: u.notifications || { likes: true, comments: true, follows: true, messages: true },
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const re = /^[a-zA-Z0-9_]{3,30}$/;
    if (!debouncedUsername || !re.test(debouncedUsername)) {
      setUsernameState('invalid');
      return;
    }
    setUsernameState('checking');
    apiRequest(`/api/profile/username-available?u=${encodeURIComponent(debouncedUsername)}`)
      .then((r) => setUsernameState(r.available ? 'ok' : 'taken'))
      .catch(() => setUsernameState('idle'));
  }, [debouncedUsername]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await apiRequest('/api/profile', { method: 'PATCH', body: form });
      navigate('/dashboard/profile');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const usernameHint = useMemo(() => {
    return usernameState === 'checking' ? 'Checking…' : usernameState === 'ok' ? 'Available' : usernameState === 'taken' ? 'Taken' : usernameState === 'invalid' ? '3–30 chars, letters/numbers/_' : '';
  }, [usernameState]);

  if (loading) return <div className="min-h-screen bg-[#0b0f14] text-white grid place-items-center">Loading…</div>;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Identity</h1>
          <p className="mt-2 text-gray-500 font-medium">Refine how you appear in the Pulse ecosystem.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="bg-[#0f161b] rounded-3xl border border-white/5 p-6 md:p-10 shadow-2xl space-y-8 transition-all hover:border-white/10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#52606d]">Display Name</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50" 
                value={form.displayName} 
                onChange={(e)=>setForm({...form, displayName:e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#52606d]">Username</label>
              <input 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50" 
                value={form.username} 
                onChange={(e)=>setForm({...form, username:e.target.value})} 
              />
              <div className={`text-[10px] uppercase tracking-tighter font-bold ${usernameState==='ok'?'text-green-400':usernameState==='taken'?'text-red-400':'text-gray-600'}`}>{usernameHint}</div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[#52606d]">Biography</label>
            <textarea 
              maxLength={150} 
              className="w-full h-24 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50 resize-none" 
              value={form.bio} 
              onChange={(e)=>setForm({...form, bio:e.target.value})} 
            />
            <div className="text-right text-[10px] text-gray-600 font-bold">{form.bio.length}/150</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#52606d]">Website</label>
              <input 
                placeholder="https://yourspace.com" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50" 
                value={form.website} 
                onChange={(e)=>setForm({...form, website:e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-[#52606d]">Location</label>
              <input 
                placeholder="The Matrix"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500/50" 
                value={form.location} 
                onChange={(e)=>setForm({...form, location:e.target.value})} 
              />
            </div>
          </div>

          <fieldset className="p-6 rounded-2xl bg-black/20 border border-white/5">
             <legend className="px-2 text-[10px] font-extrabold uppercase tracking-[0.3em] text-purple-400 mb-4">Notification Hooks</legend>
             <div className="grid grid-cols-2 gap-4">
                {['likes','comments','follows','messages'].map(k => (
                  <label key={k} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded bg-purple-500 border-none"
                      checked={!!form.notifications[k]} 
                      onChange={(e)=>setForm({...form, notifications:{...form.notifications, [k]: e.target.checked}})} 
                    />
                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-300 capitalize">{k}</span>
                  </label>
                ))}
             </div>
          </fieldset>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onSubmit}
              disabled={saving}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#b76bff] to-[#ff6b6b] text-black font-extrabold shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? "SAVING..." : "SAVE CHANGES"}
            </button>
            <button type="button" onClick={()=>navigate('/dashboard/profile')} className="px-8 py-4 rounded-2xl bg-white/5 text-xs font-bold hover:bg-white/10 transition-all">Cancel</button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
