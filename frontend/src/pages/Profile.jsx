import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest, API_URL } from '../lib/api';
import PostCard from '../components/feed/PostCard';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';

// Inline SVG Icons (no external deps)
function Icon({ d, className = 'w-5 h-5' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const icons = {
  home: 'M12 3.172 2.879 12.293a1 1 0 1 0 1.414 1.414L5 13v6a1 1 0 0 0 1 1h4v-4h4v4h4a1 1 0 0 0 1-1v-6l.707.707a1 1 0 0 0 1.414-1.414L12 3.172Z',
  edit: 'M16.862 3.487a1.75 1.75 0 0 1 2.475 2.475l-10.3 10.3a4 4 0 0 1-1.69 1.01l-3.083.88a.75.75 0 0 1-.93-.93l.88-3.082a4 4 0 0 1 1.01-1.69l10.3-10.3Zm-2.12 2.121-9.9 9.9a2.5 2.5 0 0 0-.632 1.057l-.553 1.938 1.939-.553a2.5 2.5 0 0 0 1.056-.632l9.9-9.9-1.81-1.81Z',
  key: 'M15.75 1.5a5.25 5.25 0 0 0-5.16 6.34L1.97 16.46a1.5 1.5 0 0 0-.37.59l-.55 1.76a.75.75 0 0 0 .93.93l1.76-.55c.23-.07.43-.2.59-.37l1.13-1.13h2.12v-2.12l1.13-1.13h2.12l1.76-1.76a5.25 5.25 0 1 0 2.28-10.21Zm0 2.25a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z',
  bookmark: 'M6 2.25A2.25 2.25 0 0 0 3.75 4.5v16.19a.75.75 0 0 0 1.16.63L12 17.55l7.09 3.77a.75.75 0 0 0 1.16-.63V4.5A2.25 2.25 0 0 0 18 2.25H6Z',
  upload: 'M12 3a1 1 0 0 1 1 1v7.586l2.293-2.293a1 1 0 0 1 1.414 1.414l-4.004 4.004a1 1 0 0 1-1.414 0L7.285 10.707a1 1 0 0 1 1.414-1.414L11 10.586V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 1 0 0 2h14a1 1 0 1 0 0-2H5Z',
  trash: 'M9 3.75A2.25 2.25 0 0 1 11.25 1.5h1.5A2.25 2.25 0 0 1 15 3.75V4.5h4.5a.75.75 0 0 1 0 1.5H18.6l-1.02 12.24A3 3 0 0 1 14.59 21H9.41a3 3 0 0 1-2.99-2.76L5.4 6H4.5a.75.75 0 0 1 0-1.5H9V3.75ZM6.91 6l1 12a1.5 1.5 0 0 0 1.5 1.35h5.18A1.5 1.5 0 0 0 16.09 18l1-12H6.91Z',
  globe: 'M12 2.25c5.385 0 9.75 4.365 9.75 9.75S17.385 21.75 12 21.75 2.25 17.385 2.25 12 6.615 2.25 12 2.25Zm0 1.5c-1.2 0-2.918 2.94-3.23 7.5h6.46C14.918 6.69 13.2 3.75 12 3.75Zm-3.23 9c.312 4.56 2.03 7.5 3.23 7.5s2.918-2.94 3.23-7.5H8.77Z',
  mapPin: 'M12 2.25a6.75 6.75 0 0 0-6.75 6.75c0 4.5 6.75 12.75 6.75 12.75S18.75 13.5 18.75 9A6.75 6.75 0 0 0 12 2.25Zm0 9a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5Z',
  at: 'M12 2.25a9.75 9.75 0 1 0 9.75 9.75v-1.5a1.5 1.5 0 1 0-3 0v1.5a6.75 6.75 0 1 1-2.28-5.03 1.5 1.5 0 0 0 2.28.03A9.72 9.72 0 0 0 12 2.25Z',
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
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [searchF, setSearchF] = useState('');
  const [searchG, setSearchG] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
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

  const loadFollowers = async () => {
    if (!user?._id) return;
    try {
      const res = await apiRequest(`/api/users/${user._id}/followers`);
      setFollowers(res.followers || []);
    } catch {}
  };
  const loadFollowing = async () => {
    if (!user?._id) return;
    try {
      const res = await apiRequest(`/api/users/${user._id}/following`);
      setFollowing(res.following || []);
    } catch {}
  };

  useEffect(() => { if (followersOpen) loadFollowers(); }, [followersOpen, user?._id]);
  useEffect(() => { if (followingOpen) loadFollowing(); }, [followingOpen, user?._id]);

  const toggleFollowUser = async (targetId, follow) => {
    try {
      if (follow) await apiRequest(`/api/users/${targetId}/follow`, { method: 'POST' });
      else await apiRequest(`/api/users/${targetId}/follow`, { method: 'DELETE' });
      if (followersOpen) loadFollowers();
      if (followingOpen) loadFollowing();
      await load(); // refresh counts
    } catch {}
  };

  const uploadFile = async (path, field, file) => {
    // Validate client-side
    if (file) {
      const okType = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
      if (!okType) return setError('Only JPG, PNG, or WEBP images are allowed');
      if (file.size > 8 * 1024 * 1024) return setError('File must be ≤ 8MB');
    }
    const fd = new FormData();
    if (field && file) fd.append(field, file);
    setUploading(true);
    try {
      const options = field && file ? { method: 'POST', body: fd } : { method: 'POST' };
      await apiRequest(path, options);
      await load();
      setCacheBust(Date.now());
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
    }
  };

  const onLike = async (id, liked) => {
    try { await apiRequest(`/api/posts/${id}/like`, { method: 'POST', body: { liked } }); } catch (e) { /* ignore */ }
  };
  const onSave = async (id, saved) => {
    try { await apiRequest(`/api/posts/${id}/save`, { method: 'POST', body: { saved } }); } catch (e) { /* ignore */ }
  };
  const onComment = async (id, text) => {
    // Placeholder: backend comments route not implemented yet
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#07030b] to-[#050405] text-[#EEECF1]">

      {/* COVER */}
      <div className="w-full overflow-hidden">
        <div className="h-44 sm:h-56 md:h-72 lg:h-80 relative border-b border-white/5 bg-gradient-to-b from-[#0f0f13] to-[#0b0b0b]">
          {user?.coverUrl ? (
            <img
              src={`${user.coverUrl.startsWith('http') ? user.coverUrl : API_URL + user.coverUrl}?v=${cacheBust}`}
              alt="Cover"
              className="w-full h-full object-cover transform transition-transform duration-700 ease-out hover:scale-105"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-[#8f94a3]">Add a cover image</div>
          )}

          {/* avatar */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full ring-4 ring-[#7b5cff55] overflow-hidden bg-[#111117] shadow-neon animate-avatarPop">
              <img
                src={user?.avatarUrl ? `${user.avatarUrl.startsWith('http') ? user.avatarUrl : API_URL + user.avatarUrl}?v=${cacheBust}` : '/avatar.svg'}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-[980px] mx-auto px-4 pt-16 pb-20">
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          {/* LEFT */}
          <div className="flex-1">
            <div className="text-2xl sm:text-3xl font-semibold tracking-tight drop-shadow-sm">{user?.displayName || user?.username}</div>
            <div className="text-sm text-[#bfb9c5] mt-1">@{user?.username}</div>
            {user?.bio && <p className="mt-3 text-sm text-[#cfc8dd] max-w-[80%]">{user.bio}</p>}

            <div className="mt-4 flex flex-wrap gap-3 items-center text-sm text-[#d0cbe0]">
              {user?.website && (
                <a href={user.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/3 border border-white/5 hover:bg-white/6 transition">
                  <Icon d={icons.globe} className="w-4 h-4 text-[#a8a2ff]" />
                  <span className="truncate max-w-[200px]">{user.website}</span>
                </a>
              )}

              {user?.location && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/3 border border-white/5">
                  <Icon d={icons.mapPin} className="w-4 h-4 text-[#7bdff6]" />
                  <span>{user.location}</span>
                </div>
              )}

              {user?.pronouns && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/3 border border-white/5">
                  <Icon d={icons.at} className="w-4 h-4 text-[#f0b3ff]" />
                  <span>{user.pronouns}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex gap-6 text-sm items-center text-[#e6e1f6]">
              <button onClick={()=>setFollowersOpen(true)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/2 border border-white/6 hover:shadow-neon-sm transition">
                <Icon d={icons.users} className="w-4 h-4 text-[#c7b8ff]" />
                <span><b>{user?.followersCount || 0}</b> Followers</span>
              </button>

              <button onClick={()=>setFollowingOpen(true)} className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/2 border border-white/6 hover:shadow-neon-sm transition">
                <Icon d={icons.users} className="w-4 h-4 text-[#c7b8ff]" />
                <span><b>{user?.followingCount || 0}</b> Following</span>
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/2 border border-white/6">
                <Icon d={icons.bookmark} className="w-4 h-4 text-[#b6fff6]" />
                <span><b>{user?.postsCount || 0}</b> Posts</span>
              </div>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex flex-wrap gap-3 items-center">
            <Link to="/dashboard" aria-label="Home" title="Home"
              className="p-2 rounded-full bg-gradient-to-br from-[#9b7dff] to-[#6ee7ff] text-black shadow-md hover:scale-105 transition">
              <Icon d={icons.home} className="w-5 h-5" />
            </Link>

            <Link to="/dashboard/profile/edit" aria-label="Edit Profile" title="Edit Profile"
              className="px-3 py-2 rounded-md bg-white/5 border border-white/6 hover:bg-white/6 transition">
              Edit Profile
            </Link>

            <button onClick={() => setPwdOpen(true)} aria-label="Change Password" title="Change Password"
              className="px-3 py-2 rounded-md bg-gradient-to-br from-[#7b5cff] to-[#c98bff] text-black font-medium hover:brightness-95 transition">
              Change Password
            </button>

            <label className="px-3 py-2 rounded-md bg-white/5 border border-white/6 cursor-pointer hover:bg-white/6 transition">
              Upload Avatar
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e)=>{
                const f=e.target.files?.[0]; if (f) uploadFile('/api/profile/avatar','avatar',f);
              }} />
            </label>

            <button onClick={()=>uploadFile('/api/profile/avatar/remove')} className="px-3 py-2 rounded-md bg-white/5 border border-red-400/30 hover:bg-red-500/10 transition">
              Remove Avatar
            </button>

            <label className="px-3 py-2 rounded-md bg-white/5 border border-white/6 cursor-pointer hover:bg-white/6 transition">
              Upload Cover
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e)=>{
                const f=e.target.files?.[0]; if (f) uploadFile('/api/profile/cover','cover',f);
              }} />
            </label>

            <button onClick={()=>uploadFile('/api/profile/cover/remove')} className="px-3 py-2 rounded-md bg-white/5 border border-red-400/30 hover:bg-red-500/10 transition">
              Remove Cover
            </button>

            {uploading && <span className="text-sm text-[#9aa5b1]">Uploading…</span>}
          </div>
        </div>

        {/* POSTS */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Posts</h3>

          {loading ? (
            <div className="text-sm text-[#9aa5b1]">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="text-sm text-[#9aa5b1]">No posts yet.</div>
          ) : (
            <div className="space-y-6">
              {posts.map((p) => {
                const mediaSrc = p.video?.url ? p.video.url : p.images?.[0]?.url;
                const resolved = mediaSrc && (mediaSrc.startsWith('http') ? mediaSrc : API_URL + mediaSrc);
                return (
                  <div key={p._id || p.id} className="rounded-xl bg-gradient-to-br from-[#07060b]/60 to-[#0b0b0b] border border-white/6 p-3 shadow-card hover:shadow-card-lg transition transform hover:-translate-y-1">
                    <PostCard post={{
                      id: p._id || p.id,
                      user: { username: user?.username || 'me', avatar: user?.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : API_URL + user.avatarUrl) : '/avatar.svg' },
                      timestamp: new Date(p.createdAt).toLocaleString(),
                      media: p.video?.url
                        ? { type: 'video', src: resolved, alt: p.video.alt || 'Video' }
                        : { type: 'image', src: resolved, alt: p.images?.[0]?.alt || 'Image' },
                      likes: p.likesCount || 0,
                      comments: p.commentsCount || 0,
                      liked: false,
                      saved: false,
                    }} onLike={onLike} onSave={onSave} onComment={onComment} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <ChangePasswordModal open={pwdOpen} onClose={() => setPwdOpen(false)} onSuccess={load} />

        {/* FOLLOWERS MODAL */}
        {followersOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md grid place-items-center p-4">
            <div className="w-full max-w-md bg-[#0f0f14] text-[#EEECF1] rounded-xl border border-white/6 p-4 shadow-neon-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Followers</div>
                <button onClick={()=>setFollowersOpen(false)} aria-label="Close" className="text-xl leading-none">×</button>
              </div>

              <input value={searchF} onChange={(e)=>setSearchF(e.target.value)} placeholder="Search followers" className="w-full rounded-md bg-[#07070b] border border-white/6 px-3 py-2 text-sm mb-3" />

              <div className="max-h-80 overflow-auto space-y-2">
                {followers.filter(u=>!searchF || u.username.toLowerCase().includes(searchF.toLowerCase())).map(u=> (
                  <div key={u._id} className="flex items-center gap-3 p-2 rounded-md bg-white/3">
                    {/* <img src={u.avatarUrl ? (u.avatarUrl.startsWith('http')?u.avatarUrl:API_URL+u.avatarUrl):'/avatar.svg'} alt="Avatar" className="w-8 h-8 rounded-full" /> */}
                    <div className="flex-1">
                      <div className="text-sm font-medium">@{u.username}</div>
                    </div>
                    <button onClick={()=>toggleFollowUser(u._id, false)} className="px-3 py-1 rounded-md text-sm border border-[#A28DB9] text-[#A28DB9] hover:bg-[#A28DB9]/10">Unfollow</button>
                  </div>
                ))}
                {followers.length===0 && <div className="text-sm text-[#9aa5b1]">No followers</div>}
              </div>
            </div>
          </div>
        )}

        {/* FOLLOWING MODAL */}
        {followingOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md grid place-items-center p-4">
            <div className="w-full max-w-md bg-[#0f0f14] text-[#EEECF1] rounded-xl border border-white/6 p-4 shadow-neon-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Following</div>
                <button onClick={()=>setFollowingOpen(false)} aria-label="Close" className="text-xl leading-none">×</button>
              </div>

              <input value={searchG} onChange={(e)=>setSearchG(e.target.value)} placeholder="Search following" className="w-full rounded-md bg-[#07070b] border border-white/6 px-3 py-2 text-sm mb-3" />

              <div className="max-h-80 overflow-auto space-y-2">
                {following.filter(u=>!searchG || u.username.toLowerCase().includes(searchG.toLowerCase())).map(u=> (
                  <div key={u._id} className="flex items-center gap-3 p-2 rounded-md bg-white/3">
                    <img src={u.avatarUrl ? (u.avatarUrl.startsWith('http')?u.avatarUrl:API_URL+u.avatarUrl):'/avatar.svg'} alt="Avatar" className="w-8 h-8 rounded-full" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">@{u.username}</div>
                    </div>
                    <button onClick={()=>toggleFollowUser(u._id, false)} className="px-3 py-1 rounded-md text-sm border border-[#A28DB9] text-[#A28DB9] hover:bg-[#A28DB9]/10">Unfollow</button>
                  </div>
                ))}
                {following.length===0 && <div className="text-sm text-[#9aa5b1]">Not following anyone</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
