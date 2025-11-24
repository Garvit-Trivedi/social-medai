import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiRequest, API_URL } from '../lib/api';
import PostCard from '../components/feed/PostCard';

// Inline SVG Icons (no external deps)
function Icon({ d, className = 'w-5 h-5' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const icons = {
  home: 'M12 3.172 2.879 12.293a1 1 0 1 0 1.414 1.414L5 13v6a1 1 0 0 0 1 1h4v-4h4v4h4a1 1 0 0 0 1-1v-6l.707.707a1 1 0 0 0 1.414-1.414L12 3.172Z',
  users: 'M7.5 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Zm-3 11.25A4.5 4.5 0 0 1 9 13.5h6a4.5 4.5 0 0 1 4.5 4.5v.75A2.25 2.25 0 0 1 17.25 21h-10.5A2.25 2.25 0 0 1 4.5 18.75V18Z',
  bookmark: 'M6 2.25A2.25 2.25 0 0 0 3.75 4.5v16.19a.75.75 0 0 0 1.16.63L12 17.55l7.09 3.77a.75.75 0 0 0 1.16-.63V4.5A2.25 2.25 0 0 0 18 2.25H6Z',
};

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setError('');
        setLoading(true);
        const res = await apiRequest(`/api/users/by-username/${encodeURIComponent(username)}`);
        setUser(res.user);
        try {
          const f = await apiRequest(`/api/users/${res.user._id}/is-following`);
          setFollowing(!!f.following);
        } catch {}
        // Fetch their posts (public only)
        const mine = await apiRequest('/api/posts/feed');
        const userPosts = (mine.posts || []).filter((p) => String(p.author?._id) === String(res.user._id));
        setPosts(userPosts);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  const toggleFollow = async () => {
    try {
      const next = !following; setFollowing(next);
      if (next) await apiRequest(`/api/users/${user._id}/follow`, { method: 'POST' });
      else await apiRequest(`/api/users/${user._id}/follow`, { method: 'DELETE' });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#EEECF1]">
      <div className="max-w-[920px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigate('/dashboard')} aria-label="Home" title="Home" className="p-2 rounded-full bg-[#1c1e22] border border-black/30 hover:border-[#A28DB9] hover:text-[#A28DB9] transition-colors">
            <Icon d={icons.home} />
          </button>
        </div>
        {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
        {loading ? (
          <div className="text-sm text-[#9aa5b1]">Loading…</div>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <img src={user?.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : API_URL + user.avatarUrl) : '/avatar.svg'} alt="Avatar" className="w-16 h-16 rounded-full" />
              <div>
                <div className="text-lg font-semibold">{user?.displayName || user?.username}</div>
                <div className="text-[#bfb9c5]">@{user?.username}</div>
                <div className="text-sm text-[#d9d3df] mt-1">{user?.bio}</div>
                <div className="flex flex-wrap items-center gap-4 text-sm mt-2 text-[#d9d3df]">
                  <span className="inline-flex items-center gap-1" title="Followers" aria-label="Followers">
                    <Icon d={icons.users} className="w-4 h-4" />
                    <span className="hidden sm:inline"><b>{user?.followersCount || 0}</b> Followers</span>
                  </span>
                  <span className="inline-flex items-center gap-1" title="Following" aria-label="Following">
                    <Icon d={icons.users} className="w-4 h-4" />
                    <span className="hidden sm:inline"><b>{user?.followingCount || 0}</b> Following</span>
                  </span>
                  <span className="inline-flex items-center gap-1" title="Posts" aria-label="Posts">
                    <Icon d={icons.bookmark} className="w-4 h-4" />
                    <span className="hidden sm:inline"><b>{user?.postsCount || 0}</b> Posts</span>
                  </span>
                </div>
              </div>
              <div className="ml-auto">
                <button onClick={toggleFollow} className={`px-4 py-2 rounded-full text-sm border ${following ? 'bg-transparent border-[#A28DB9] text-[#A28DB9]' : 'bg-[#A28DB9] text-black border-[#A28DB9]'} hover:brightness-110 transition`}>{following ? 'Following' : 'Follow'}</button>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {posts.map((p) => {
                const mediaSrc = p.video?.url ? p.video.url : p.images?.[0]?.url;
                const resolved = mediaSrc && (mediaSrc.startsWith('http') ? mediaSrc : API_URL + mediaSrc);
                return (
                  <PostCard
                    key={p._id}
                    post={{
                      id: p._id,
                      user: { username: user.username, avatar: user.avatarUrl ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : API_URL + user.avatarUrl) : '/avatar.svg' },
                      authorId: user._id,
                      isMine: false,
                      timestamp: new Date(p.createdAt).toLocaleString(),
                      media: p.video?.url ? { type: 'video', src: resolved, alt: p.video?.alt || 'Video' } : { type: 'image', src: resolved, alt: p.images?.[0]?.alt || 'Image' },
                      likes: p.likesCount || 0,
                      comments: p.commentsCount || 0,
                      liked: false,
                      saved: false,
                    }}
                    onFollowToggle={() => toggleFollow()}
                    withComments
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
