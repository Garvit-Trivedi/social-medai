// import React, { useMemo, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { apiRequest } from '../lib/api';

// export default function PostComposer() {
//   const navigate = useNavigate();
//   const [files, setFiles] = useState([]); // File[]
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [form, setForm] = useState({ caption: '', location: '', allowComments: true, visibility: 'public', status: 'active' });
//   const [error, setError] = useState('');
//   const [saving, setSaving] = useState(false);
//   const [videoDuration, setVideoDuration] = useState(null); // seconds
//   const [videoReady, setVideoReady] = useState(true);

//   const onFiles = (fList) => {
//     const arr = Array.from(fList || []);
//     // Validate: only images or single video
//     const isVideo = arr[0]?.type.startsWith('video/');
//     if (isVideo && arr.length > 1) {
//       setError('Only one video is allowed');
//       return;
//     }
//     if (!isVideo && arr.some((f) => f.type.startsWith('video/'))) {
//       setError('Cannot mix images and video');
//       return;
//     }
//     if (!isVideo && arr.length > 4) {
//       setError('You can select up to 4 images');
//       return;
//     }
//     if (arr.some((f) => f.size > 8 * 1024 * 1024)) {
//       setError('Each file must be ≤ 8MB');
//       return;
//     }
//     setError('');
//     setFiles(arr);
//     setPreviewUrls(arr.map((f) => URL.createObjectURL(f)));

//     if (isVideo) {
//       setVideoReady(false);
//       setVideoDuration(null);
//       // load metadata to read duration
//       const v = document.createElement('video');
//       v.preload = 'metadata';
//       v.src = URL.createObjectURL(arr[0]);
//       v.onloadedmetadata = () => {
//         const d = Number(v.duration);
//         setVideoDuration(d);
//         setVideoReady(true);
//         URL.revokeObjectURL(v.src);
//         if (!Number.isFinite(d) || d <= 0) {
//           setError('Could not read video duration');
//         } else if (d > 60) {
//           setError('Video must be 60 seconds or less');
//         }
//       };
//       v.onerror = () => {
//         setVideoReady(true);
//         setError('Failed to read video file');
//       };
//     } else {
//       setVideoDuration(null);
//       setVideoReady(true);
//     }
//   };

//   const isImageMode = useMemo(() => files[0]?.type.startsWith('image/'), [files]);

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     if (files.length === 0) return setError('Please select media');
//     if (!isImageMode) {
//       if (!videoReady) return setError('Reading video metadata…');
//       if (!Number.isFinite(videoDuration) || videoDuration <= 0) return setError('Invalid video');
//       if (videoDuration > 60) return setError('Video must be 60 seconds or less');
//     }
//     try {
//       setSaving(true);
//       const fd = new FormData();
//       files.forEach((f) => fd.append('media', f));
//       fd.append('caption', form.caption);
//       fd.append('location', form.location);
//       fd.append('allowComments', String(form.allowComments));
//       fd.append('visibility', form.visibility);
//       fd.append('status', form.status);
//       if (!isImageMode && Number.isFinite(videoDuration)) {
//         fd.append('durationSeconds', String(Math.round(videoDuration)));
//       }
//       const res = await apiRequest('/api/posts', { method: 'POST', body: fd });
//       // Stash the created post so Dashboard can prepend without waiting
//       try { sessionStorage.setItem('newPost', JSON.stringify(res.post)); } catch {}
//       navigate('/dashboard');
//     } catch (e2) {
//       setError(e2.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#0b0b0b] text-[#EEECF1]">
//       <div className="max-w-[920px] mx-auto px-4 py-6">
//         <h1 className="text-xl font-semibold mb-4">Create Post</h1>
//         {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
//         <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6">
//           <div className="bg-[#1c1e22] border border-black/30 rounded-lg p-4">
//             <label className="block text-sm mb-2">Media</label>
//             <input
//               type="file"
//               accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/ogg"
//               multiple
//               onChange={(e) => onFiles(e.target.files)}
//             />
//             <div className="mt-3">
//               {previewUrls.length === 0 ? (
//                 <div className="text-sm text-[#9aa5b1]">Choose images or a single video.</div>
//               ) : isImageMode ? (
//                 <div className="flex gap-2 overflow-x-auto">
//                   {previewUrls.map((u, i) => (
//                     <img key={i} src={u} alt={`Preview ${i + 1}`} className="w-32 h-32 object-cover rounded" />
//                   ))}
//                 </div>
//               ) : (
//                 <video src={previewUrls[0]} controls className="w-full max-h-[420px] rounded" />
//               )}
//             </div>
//           </div>

//           <div className="space-y-3">
//             <div className="bg-[#1c1e22] border border-black/30 rounded-lg p-4">
//               <label className="block text-sm mb-1">Caption</label>
//               <textarea maxLength={2200} value={form.caption} onChange={(e)=>setForm({...form, caption: e.target.value})} className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2" />
//               <div className="text-xs text-[#9aa5b1]">{form.caption.length}/2200</div>
//             </div>
//             <div className="bg-[#1c1e22] border border-black/30 rounded-lg p-4">
//               <label className="block text-sm mb-1">Location</label>
//               <input value={form.location} onChange={(e)=>setForm({...form, location: e.target.value})} className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2" />
//             </div>
//             <div className="bg-[#1c1e22] border border-black/30 rounded-lg p-4 grid gap-2 text-sm">
//               <label className="flex items-center gap-2"><input type="checkbox" checked={form.allowComments} onChange={(e)=>setForm({...form, allowComments: e.target.checked})} /> Allow Comments</label>
//               <label className="block">
//                 <span className="block mb-1">Visibility</span>
//                 <select value={form.visibility} onChange={(e)=>setForm({...form, visibility: e.target.value})} className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2">
//                   <option value="public">Public</option>
//                   <option value="followers">Followers</option>
//                 </select>
//               </label>
//               <label className="block">
//                 <span className="block mb-1">Save as</span>
//                 <select value={form.status} onChange={(e)=>setForm({...form, status: e.target.value})} className="w-full rounded-md bg-[#0b0b0b] border border-black/40 px-3 py-2">
//                   <option value="active">Post now</option>
//                   <option value="draft">Draft</option>
//                 </select>
//               </label>
//             </div>
//             <div className="flex justify-end gap-2">
//               <button type="button" onClick={()=>navigate('/dashboard/profile')} className="px-4 py-2 rounded-md border border-black/40">Cancel</button>
//               <button disabled={saving || (!isImageMode && (!videoReady || (videoDuration ?? 0) > 60))} className="px-4 py-2 rounded-md bg-[#A28DB9] text-black font-medium">{saving?'Uploading…':'Publish'}</button>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../lib/api';

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
      const fd = new FormData();
      files.forEach(f => fd.append('media', f));
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (!isImageMode) fd.append('durationSeconds', Math.round(videoDuration));

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
    <div className="min-h-screen bg-gradient-to-b from-black to-[#0b0b0b] text-[#EEECF1] py-10 pb-28 sm:pb-10">
      <div className="max-w-[900px] mx-auto px-4">

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
          Create a New Post
        </h1>

        {error && (
          <div className="mb-4 bg-red-900/40 border border-red-700/40 text-red-300 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6 sm:gap-8">

          {/* -------- LEFT CARD -------- */}
          <div className="bg-[#151518] border border-[#2a2a2d] rounded-2xl p-6 shadow-xl shadow-black/30 backdrop-blur-md transition-all hover:border-purple-400/40">

            <label className="block text-sm mb-3 font-medium opacity-80">
              Upload Media
            </label>

            <div className="border border-[#2a2a2d] rounded-xl p-4 bg-black/20 hover:bg-black/30 transition cursor-pointer">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => onFiles(e.target.files)}
                className="w-full text-sm"
              />
            </div>

            {/* Media Preview */}
            <div className="mt-5">
              {previewUrls.length === 0 ? (
                <p className="text-sm opacity-60">No media selected.</p>
              ) : isImageMode ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {previewUrls.map((u, i) => (
                    <img
                      key={i}
                      src={u}
                      className="w-32 h-32 rounded-xl object-cover border border-[#2a2a2d] hover:scale-105 transition"
                    />
                  ))}
                </div>
              ) : (
                <video
                  src={previewUrls[0]}
                  controls
                  className="w-full max-h-[420px] rounded-xl border border-[#2a2a2d]"
                />
              )}
            </div>
          </div>

          {/* -------- RIGHT PANEL -------- */}
          <div className="space-y-6">

            {/* Caption */}
            <div className="bg-[#151518] border border-[#2a2a2d] rounded-2xl p-5 backdrop-blur-md hover:border-purple-400/30 transition">
              <label className="block text-sm mb-2 opacity-80">Caption</label>
              <textarea
                value={form.caption}
                maxLength={2200}
                onChange={(e) => setForm({ ...form, caption: e.target.value })}
                className="w-full h-28 bg-black/30 border border-[#2a2a2d] rounded-xl px-3 py-2 text-sm focus:border-purple-400 outline-none"
              />
              <div className="text-right text-xs opacity-50">
                {form.caption.length}/2200
              </div>
            </div>

            {/* Location */}
            <div className="bg-[#151518] border border-[#2a2a2d] rounded-2xl p-5 hover:border-purple-400/30 transition">
              <label className="block text-sm mb-2 opacity-80">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full bg-black/30 border border-[#2a2a2d] rounded-xl px-3 py-2 text-sm focus:border-purple-400 outline-none"
              />
            </div>

            {/* Settings */}
            <div className="bg-[#151518] border border-[#2a2a2d] rounded-2xl p-5 grid gap-3 hover:border-purple-400/30 transition">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.allowComments}
                  onChange={(e) => setForm({ ...form, allowComments: e.target.checked })}
                />
                Allow comments
              </label>

              <label className="block text-sm">
                Visibility
                <select
                  value={form.visibility}
                  onChange={(e) => setForm({ ...form, visibility: e.target.value })}
                  className="mt-1 w-full bg-black border border-[#2a2a2d] rounded-xl px-3 py-2 text-sm focus:border-purple-400 outline-none"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers</option>
                </select>
              </label>

              <label className="block text-sm">
                Save As
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="mt-1 w-full bg-black border border-[#2a2a2d] rounded-xl px-3 py-2 text-sm focus:border-purple-400 outline-none"
                >
                  <option value="active">Post now</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
            </div>

            {/* Buttons */}
            <div className="hidden sm:flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/dashboard/profile')}
                className="px-5 py-2 rounded-xl border border-[#2a2a2d] hover:bg-[#222] transition text-sm"
              >
                Cancel
              </button>

              <button
                disabled={saving || (!isImageMode && (!videoReady || videoDuration > 60))}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-300 to-purple-400 text-black font-semibold shadow-md hover:scale-[1.02] active:scale-95 transition disabled:opacity-50"
              >
                {saving ? 'Uploading…' : 'Publish'}
              </button>
            </div>

          </div>
        </form>
        {/* Mobile Action Bar */}
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 bg-[#0b0b0b]/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-t border-[#2a2a2d] p-3">
          <div className="max-w-[900px] mx-auto px-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard/profile')}
              className="flex-1 py-3 rounded-xl border border-[#2a2a2d] hover:bg-[#222] transition text-sm"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={saving || (!isImageMode && (!videoReady || videoDuration > 60))}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-300 to-purple-400 text-black font-semibold shadow-md active:scale-95 transition disabled:opacity-50"
            >
              {saving ? 'Uploading…' : 'Publish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

