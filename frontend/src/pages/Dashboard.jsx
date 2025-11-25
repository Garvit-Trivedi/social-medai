import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest, API_URL } from '../lib/api';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import PostCard from '../components/feed/PostCard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/api/auth/me');
        setUser(res.user);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, []);

  const [avatarSrc, setAvatarSrc] = useState('');
  useEffect(() => {
    (async () => {
      try {
        const prof = await apiRequest('/api/profile/me');
        const url = prof.user?.avatarUrl ? (prof.user.avatarUrl.startsWith('http') ? prof.user.avatarUrl : API_URL + prof.user.avatarUrl) : '';
        setAvatarSrc(url);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const onResize = () => setSidebarCollapsed(window.innerWidth <= 900);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const [feed, setFeed] = useState([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest('/api/posts/feed');
        let mapped = (res.posts || []).map((p) => {
          const mediaSrc = p.video?.url ? p.video.url : p.images?.[0]?.url;
          const resolved = mediaSrc && (mediaSrc.startsWith('http') ? mediaSrc : API_URL + mediaSrc);
          return {
            id: p._id,
            user: { username: p.author?.username || 'user', avatar: p.author?.avatarUrl ? (p.author.avatarUrl.startsWith('http') ? p.author.avatarUrl : API_URL + p.author.avatarUrl) : '/avatar.svg' },
            authorId: p.author?._id,
            isMine: p.author?._id && user?._id ? String(p.author._id) === String(user._id) : false,
            timestamp: new Date(p.createdAt).toLocaleString(),
            media: p.video?.url ? { type: 'video', src: resolved, alt: p.video.alt || 'Video' } : { type: 'image', src: resolved, alt: p.images?.[0]?.alt || 'Image' },
            likes: p.likesCount || 0,
            comments: p.commentsCount || 0,
            liked: false,
            saved: false,
          };
        });
        // Prepend freshly created post if present
        try {
          const raw = sessionStorage.getItem('newPost');
          if (raw) {
            const np = JSON.parse(raw);
            const mediaSrc2 = np.video?.url ? np.video.url : np.images?.[0]?.url;
            const resolved2 = mediaSrc2 && (mediaSrc2.startsWith('http') ? mediaSrc2 : API_URL + mediaSrc2);
            const mappedNew = {
              id: np._id,
              user: { username: np.author?.username || 'me', avatar: np.author?.avatarUrl ? (np.author.avatarUrl.startsWith('http') ? np.author.avatarUrl : API_URL + np.author.avatarUrl) : '/avatar.svg' },
              authorId: np.author?._id,
              isMine: true,
              timestamp: new Date(np.createdAt || Date.now()).toLocaleString(),
              media: np.video?.url ? { type: 'video', src: resolved2, alt: np.video.alt || 'Video' } : { type: 'image', src: resolved2, alt: np.images?.[0]?.alt || 'Image' },
              likes: np.likesCount || 0,
              comments: np.commentsCount || 0,
              liked: false,
              saved: false,
            };
            if (!mapped.some((p) => p.id === mappedNew.id)) {
              mapped = [mappedNew, ...mapped];
            }
            sessionStorage.removeItem('newPost');
          }
        } catch {}
        setFeed(mapped);
      } catch (e) {
        // ignore feed error here, error banner already shown if needed
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiRequest('/api/messages/unread-total');
        setUnread(r.count || 0);
      } catch {}
    })();
    const t = setInterval(async () => {
      try { const r = await apiRequest('/api/messages/unread-total'); setUnread(r.count || 0); } catch {}
    }, 10000);
    return () => clearInterval(t);
  }, []);

  const onLike = async (postId, liked) => {
    try { await apiRequest(`/api/posts/${postId}/like`, { method: 'POST', body: { liked } }); } catch {}
  };
  const onSave = async (postId, saved) => {
    try { await apiRequest(`/api/posts/${postId}/save`, { method: 'POST', body: { saved } }); } catch {}
  };
  const onComment = async (postId, text, parentId) => {
    try { await apiRequest(`/api/posts/${postId}/comments`, { method: 'POST', body: { text, parentId } }); } catch {}
  };

  const onFollowToggle = async (authorId, follow) => {
    try {
      if (follow) {
        await apiRequest(`/api/users/${authorId}/follow`, { method: 'POST' });
      } else {
        await apiRequest(`/api/users/${authorId}/follow`, { method: 'DELETE' });
      }
    } catch {}
  };

  return (
    <div className="app-shell">
      <Topbar onLogout={logout} onProfile={() => navigate('/dashboard/profile')} onCompose={() => navigate('/dashboard/compose')} avatarSrc={avatarSrc} />
      {/* Content area fills the remaining viewport height (64px topbar) and prevents body scroll */}
      <div
        className="grid h-[calc(100vh-64px)] overflow-hidden"
        style={{ gridTemplateColumns: window.innerWidth < 768 ? '1fr' : (sidebarCollapsed ? '72px 1fr' : '240px minmax(0,1fr)') }}
      >
        <div className="hidden md:block">
          <Sidebar collapsed={sidebarCollapsed} unreadCount={unread} />
        </div>
        {/* Only the main feed should scroll; always show scrollbar */}
        <main className="h-full overflow-y-scroll">
          <div className="mx-auto px-4 py-6 max-w-[920px] pb-16 md:pb-6">
            {error && (
              <div className="mb-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-6">
              <section aria-label="Feed" className="space-y-5">
                {feed.map((p) => (
                  <PostCard key={p.id} post={p} onLike={onLike} onSave={onSave} onComment={onComment} onFollowToggle={onFollowToggle} withComments />)
                )}
              </section>
              <aside aria-label="Right rail" className="hidden lg:block">
                <div className="bg-[#1c1e22] rounded-lg p-4 border border-black/20">
                  <div className="text-[15px] font-semibold">Suggested</div>
                  <ul className="mt-3 space-y-2 text-sm text-[#c9c7d0]">
                    <li>Try searching topics you like</li>
                    <li>Follow creators to customize your feed</li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
