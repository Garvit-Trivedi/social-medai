import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { uploadFileToSupabase } from '../utils/supabaseStorage';
import AppLayout from '../components/layout/AppLayout';

export default function PostComposer() {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [form, setForm] = useState({
    caption: '',
    location: '',
    allowComments: true,
    visibility: 'public',
    status: 'active',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);
  const [videoReady, setVideoReady] = useState(true);

  const onFiles = (fList) => {
    const arr = Array.from(fList || []);
    const isVideo = arr[0]?.type.startsWith('video/');

    if (isVideo && arr.length > 1) return setError('Only one video allowed');
    if (!isVideo && arr.some(f => f.type.startsWith('video/')))
      return setError('Cannot mix images and video');
    if (!isVideo && arr.length > 4)
      return setError('You can select up to 4 images');
    if (arr.some(f => f.size > 8 * 1024 * 1024))
      return setError('Each file must be ≤ 8MB');

    setFiles(arr);
    setPreviewUrls(arr.map((f) => URL.createObjectURL(f)));
    setError('');

    if (isVideo) {
      setVideoReady(false);
      const v = document.createElement('video');
      v.src = URL.createObjectURL(arr[0]);
      v.onloadedmetadata = () => {
        setVideoDuration(v.duration);
        setVideoReady(true);
        if (v.duration > 60) setError('Video must be ≤ 60 seconds');
      };
      v.onerror = () => setError('Video load error');
    }
  };

  const isImageMode = useMemo(() => files[0]?.type.startsWith('image/'), [files]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return setError('Please select media');
    if (!isImageMode && videoDuration > 60) return;

    try {
      setSaving(true);
      let supabaseUrls = [];
      let uploadSuccess = true;

      try {
        const uploadPromises = files.map((file) => uploadFileToSupabase(file, 'posts'));
        const results = await Promise.all(uploadPromises);
        
        if (results.every(res => res.url)) {
          supabaseUrls = results.map(res => res.url);
        } else {
          uploadSuccess = false;
        }
      } catch (err) {
        uploadSuccess = false;
      }

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (!isImageMode) fd.append('durationSeconds', Math.round(videoDuration));

      if (uploadSuccess && supabaseUrls.length > 0) {
        fd.append('supabaseUrls', JSON.stringify(supabaseUrls));
      } else {
        files.forEach(f => fd.append('media', f));
      }

      const res = await apiRequest('/api/posts', { method: 'POST', body: fd });
      sessionStorage.setItem('newPost', JSON.stringify(res.post));
      navigate('/dashboard');
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white">Create Moment</h1>
          <p className="mt-2 text-gray-500 font-medium">Share your visual journey with the Pulse community.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          {/* Main Upload Area */}
          <div className="space-y-6">
            <div className="bg-[#0f161b] rounded-3xl border border-white/5 p-6 md:p-8 shadow-xl">
              <label className="block text-xs font-bold uppercase tracking-[0.22em] text-[#52606d] mb-4">Upload Media</label>
              
              <div className="relative group rounded-[24px] border-2 border-dashed border-white/10 hover:border-purple-500/40 transition-all duration-300 p-8 text-center cursor-pointer">
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  multiple 
                  onChange={(e) => onFiles(e.target.files)} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">📸</div>
                <h3 className="text-sm font-bold text-gray-400">Tap to upload images or video</h3>
                <p className="text-[10px] text-gray-600 mt-2">Maximum 4 images or 1 minute video</p>
              </div>

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div className="mt-8 flex gap-4 overflow-x-auto pb-4">
                  {previewUrls.map((u, i) => (
                    <div key={i} className="relative flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden shadow-lg">
                      {isImageMode ? (
                        <img src={u} className="w-full h-full object-cover" alt="Preview" />
                      ) : (
                        <video src={u} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-[#0f161b] rounded-3xl border border-white/5 p-6 md:p-8 shadow-xl space-y-4">
              <label className="block text-xs font-bold uppercase tracking-[0.22em] text-[#52606d]">Caption</label>
              <textarea 
                value={form.caption} 
                onChange={(e) => setForm({ ...form, caption: e.target.value })} 
                placeholder="What's the story behind this moment?"
                className="w-full h-32 bg-transparent text-[#e6eef3] text-sm outline-none resize-none placeholder:text-gray-700" 
              />
            </div>
          </div>

          {/* Settings Sidebar */}
          <aside className="space-y-6">
            <div className="bg-[#0f161b] rounded-3xl border border-white/5 p-6 shadow-xl space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">Location</label>
                <input 
                  value={form.location} 
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Where was this?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-purple-500 transition-all font-medium" 
                />
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <label className="flex items-center justify-between group cursor-pointer">
                  <span className="text-xs font-bold text-gray-500 group-hover:text-gray-300">Comments</span>
                  <input 
                    type="checkbox" 
                    checked={form.allowComments} 
                    onChange={(e) => setForm({ ...form, allowComments: e.target.checked })} 
                    className="w-4 h-4 rounded bg-purple-500"
                  />
                </label>
                
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-600">Visibility</span>
                  <select 
                    value={form.visibility} 
                    onChange={(e) => setForm({ ...form, visibility: e.target.value })} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none"
                  >
                    <option value="public" className="bg-[#0b0f14]">Everyone</option>
                    <option value="followers" className="bg-[#0b0f14]">Followers Only</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={onSubmit}
                disabled={saving || (!isImageMode && (!videoReady || (videoDuration || 0) > 60))}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#b76bff] via-[#ff6b6b] to-[#ff9a8a] text-black font-extrabold shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? "Publishing..." : "POST NOW"}
              </button>
              <button onClick={() => navigate('/dashboard')} className="w-full py-4 rounded-2xl bg-white/5 text-xs font-bold hover:bg-white/10 transition-all">Cancel</button>
            </div>
          </aside>
        </form>
      </div>
    </AppLayout>
  );
}
