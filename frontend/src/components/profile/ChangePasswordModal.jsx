import React, { useMemo, useState } from 'react';
import { apiRequest } from '../../lib/api';

function strengthScore(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}

export default function ChangePasswordModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const score = useMemo(() => strengthScore(form.newPassword), [form.newPassword]);

  if (!open) return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.newPassword.length < 8) return setError('New password must be at least 8 characters');
    if (form.newPassword !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await apiRequest('/api/profile/change-password', { method: 'POST', body: form });
      if (res?.token) localStorage.setItem('token', res.token);
      setSuccess('Password updated. Other devices have been signed out.');
      onSuccess?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 grid place-items-center p-4">
      <div className="w-full max-w-md bg-[#1c1e22] text-[#EEECF1] rounded-lg border border-black/30 p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Change Password</h2>
          <button onClick={onClose} aria-label="Close" className="text-xl leading-none">×</button>
        </div>
        {error && <div className="mb-2 text-sm text-red-400">{error}</div>}
        {success && <div className="mb-2 text-sm text-green-400">{success}</div>}
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Current Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">New Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              required
              minLength={8}
            />
            <div className="mt-1 h-2 bg-black/30 rounded">
              <div
                className={`h-2 rounded ${
                  score <= 1 ? 'bg-red-500 w-1/4' : score === 2 ? 'bg-yellow-500 w-2/4' : score === 3 ? 'bg-green-500 w-3/4' : 'bg-green-600 w-full'
                }`}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <input
              type="password"
              className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-md border border-black/40">Cancel</button>
            <button disabled={loading} className="px-4 py-2 rounded-md bg-[#A28DB9] text-black font-medium">
              {loading ? 'Updating…' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
