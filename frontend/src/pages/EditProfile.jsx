import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

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
  const [usernameState, setUsernameState] = useState('idle'); // idle|checking|ok|taken|invalid

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

  if (loading) return <div className="min-h-screen bg-[#0b0b0b] text-[#EEECF1] grid place-items-center">Loading…</div>;

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#EEECF1]">
      <div className="max-w-[720px] mx-auto px-4 py-6">
        <h1 className="text-xl font-semibold mb-4">Edit Profile</h1>
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        <form onSubmit={onSubmit} className="bg-[#1c1e22] border border-black/30 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">Display Name</label>
            <input className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2" value={form.displayName} onChange={(e)=>setForm({...form, displayName:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm mb-1">Username</label>
            <input className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2" value={form.username} onChange={(e)=>setForm({...form, username:e.target.value})} />
            <div className={`mt-1 text-xs ${usernameState==='ok'?'text-green-400':usernameState==='taken'?'text-red-400':'text-[#bfb9c5]'}`}>{usernameHint}</div>
          </div>
          <div>
            <label className="block text-sm mb-1">Bio</label>
            <textarea maxLength={150} className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2" value={form.bio} onChange={(e)=>setForm({...form, bio:e.target.value})} />
            <div className="text-xs text-[#9aa5b1]">{form.bio.length}/150</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Website</label>
              <input placeholder="https://example.com" className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2" value={form.website} onChange={(e)=>setForm({...form, website:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm mb-1">Location</label>
              <input className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2" value={form.location} onChange={(e)=>setForm({...form, location:e.target.value})} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">Pronouns</label>
              <input className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2" value={form.pronouns} onChange={(e)=>setForm({...form, pronouns:e.target.value})} />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <input id="priv" type="checkbox" checked={form.isPrivate} onChange={(e)=>setForm({...form, isPrivate:e.target.checked})} />
              <label htmlFor="priv" className="text-sm">Private Account</label>
            </div>
          </div>
          <fieldset className="border border-black/30 rounded-md p-3">
            <legend className="px-1 text-sm">Notifications</legend>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              {['likes','comments','follows','messages'].map((k)=> (
                <label key={k} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!form.notifications[k]} onChange={(e)=>setForm({...form, notifications:{...form.notifications, [k]: e.target.checked}})} />
                  <span className="capitalize">{k}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={()=>navigate('/dashboard/profile')} className="px-4 py-2 rounded-md border border-black/40">Cancel</button>
            <button disabled={saving} className="px-4 py-2 rounded-md bg-[#A28DB9] text-black font-medium">{saving?'Saving…':'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
