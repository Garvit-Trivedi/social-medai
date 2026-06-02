import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, API_URL } from '../lib/api';
import PostCard from '../components/feed/PostCard';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import AppLayout from '../components/layout/AppLayout';

function Icon({ d, className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const icons = {
  home: 'M12 3.172 2.879 12.293a1 1 0 1 0 1.414 1.414L5 13v6a1 1 0 0 0 1 1h4v-4h4v4h4a1 1 0 0 0 1-1v-6l.707.707a1 1 0 0 0 1.414-1.414L12 3.172Z',
  edit: 'M16.862 3.487a1.75 1.75 0 0 1 2.475 2.475l-10.3 10.3a4 4 0 0 1-1.69 1.01l-3.083.88a.75.75 0 0 1-.93-.93l.88-3.082a4 4 0 0 1 1.01-1.69l10.3-10.3Zm-2.12 2.121-9.9 9.9a2.5 2.5 0 0 0-.632 1.057l-.553 1.938 1.939-.553a2.5 2.5 0 0 0 1.056-.632l9.9-9.9-1.81-1.81Z',
  bookmark: 'M6 2.25A2.25 2.25 0 0 0 3.75 4.5v16.19a.75.75 0 0 0 1.16.63L12 17.55l7.09 3.77a.75.75 0 0 0 1.16-.63V4.5A2.25 2.25 0 0 0 18 2.25H6Z',
  globe: 'M12 2.25c5.385 0 9.75 4.365 9.75 9.75S17.385 21.75 12 21.75 2.25 17.385 2.25 12 6.615 2.25 12 2.25Zm0 1.5c-1.2 0-2.918 2.94-3.23 7.5h6.46C14.918 6.69 13.2 3.75 12 3.75Zm-3.23 9c.312 4.56 2.03 7.5 3.23 7.5s2.918-2.94 3.23-7.5H8.77Z',
  mapPin: 'M12 2.25a6.75 6.75 0 0 0-6.75 6.75c0 4.5 6.75 12.75 6.75 12.75S18.75 13.5 18.75 9A6.75 6.75 0 0 0 12 2.25Zm0 9a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z',
  users: 'M7.5 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Zm-3 11.25A4.5 4.5 0 0 1 9 13.5h6a4.5 4.5 0 0 1 4.5 4.5v.75A2.25 2.25 0 0 1 17.25 21h-10.5A2.25 2.25 0 0 1 4.5 18.75V18Z',
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pwdOpen, setPwdOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cacheBust, setCacheBust] = useState(Date.now());

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const u = await apiRequest('/api/profile/me');
      setUser(u.user);
      const p = await apiRequest('/api/posts/me');
      setPosts(p.posts || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const uploadFile = async (path, field, file) => {
    if (file) {
      const okType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
      if (!okType) return setError('Only JPG, PNG, or WEBP allowed');
    }
    const fd = new FormData();
    if (field && file) fd.append(field, file);
    setUploading(true);
    try {
      await apiRequest(path, { method: 'POST', body: fd });
      await load();
      setCacheBust(Date.now());
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="bg-[#0b0f14] min-h-full">
        {/* COVER AREA */}
        <div className="relative h-48 md:h-72 w-full bg-[#070b0e] overflow-hidden">
          {user?.coverUrl ? (
            <img 
               src={`${user.coverUrl.startsWith('http') ? user.coverUrl : API_URL + user.coverUrl}?v=${cacheBust}`} 
               className="w-full h-full object-cover opacity-80" 
               alt="Cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-900/20 to-red-900/10" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f14] to-transparent" />
          
          {/* Cover Upload controls (Desktop hover) */}
          <label className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:bg-black/60 transition-all">
             Change Cover
             <input type="file" className="hidden" onChange={(e) => uploadFile('/api/profile/cover', 'cover', e.target.files?.[0])} />
          </label>
        </div>

        {/* PROFILE CONTENT */}
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <div className="relative -mt-16 md:-mt-24 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-end gap-5">
              {/* Avatar */}
              <div className="relative group w-32 h-32 md:w-44 md:h-44 rounded-3xl overflow-hidden border-4 border-[#0b0f14] bg-[#0b0f14] shadow-2xl">
                <img 
                   src={user?.avatarUrl ? `${user.avatarUrl.startsWith('http') ? user.avatarUrl : API_URL + user.avatarUrl}?v=${cacheBust}` : '/avatar.svg'} 
                   className="w-full h-full object-cover" 
                   alt="Avatar"
                />
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                   <input type="file" className="hidden" onChange={(e) => uploadFile('/api/profile/avatar', 'avatar', e.target.files?.[0])} />
                </label>
              </div>

              <div className="pb-2">
                <h2 className="text-3xl font-extrabold text-white">{user?.displayName || user?.username}</h2>
                <p className="text-purple-400 font-medium">@{user?.username}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Link to="/dashboard/profile/edit" className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">
                Edit Profile
              </Link>
              <button 
                onClick={() => setPwdOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#b76bff] to-[#ff6b6b] text-black text-sm font-bold hover:opacity-90 transition-all shadow-lg"
              >
                Settings
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-10">
            {/* Left: Feed / Experience */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#52606d]">Moments</h3>
                {posts.length === 0 ? (
                  <div className="py-20 text-center bg-white/3 border border-dashed border-white/10 rounded-3xl text-gray-500">
                    No moments captured yet.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(p => (
                      <PostCard 
                        key={p._id || p.id} 
                        post={{
                          id: p._id || p.id,
                          user: { username: user?.username, avatar: user?.avatarUrl },
                          timestamp: new Date(p.createdAt).toLocaleString(),
                          media: p.video?.url ? { type:'video', src: p.video.url.startsWith('http')?p.video.url:API_URL+p.video.url } : { type:'image', src: p.images?.[0]?.url.startsWith('http')?p.images[0].url:API_URL+p.images[0].url },
                          likes: p.likesCount || 0,
                          comments: p.commentsCount || 0
                        }} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Bio / Stats */}
            <aside className="space-y-6">
              <div className="bg-[#0f161b] rounded-2xl p-6 border border-white/5 shadow-xl">
                 <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 mb-4">Biography</h4>
                 <p className="text-sm text-[#9aa5b1] leading-relaxed">
                   {user?.bio || "No bio added yet. Tell the Pulse community about your vision."}
                 </p>
                 
                 <div className="mt-8 space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs font-medium">
                       <span className="text-gray-500">Following</span>
                       <span className="text-white font-bold">{user?.followingCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                       <span className="text-gray-500">Followers</span>
                       <span className="text-white font-bold">{user?.followersCount || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-medium">
                       <span className="text-gray-500">Posts</span>
                       <span className="text-white font-bold">{user?.postsCount || 0}</span>
                    </div>
                 </div>
              </div>

              {/* Extra Info */}
              {(user?.website || user?.location) && (
                <div className="bg-[#0f161b] rounded-2xl p-6 border border-white/5 shadow-xl space-y-3">
                   {user?.website && (
                     <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-xs text-blue-400 hover:underline">
                        <Icon d={icons.globe} className="w-4 h-4" />
                        {user.website.replace(/^https?:\/\//, '')}
                     </a>
                   )}
                   {user?.location && (
                     <div className="flex items-center gap-3 text-xs text-gray-400">
                        <Icon d={icons.mapPin} className="w-4 h-4" />
                        {user.location}
                     </div>
                   )}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>

      <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} onSuccess={load} />
    </AppLayout>
  );
}
