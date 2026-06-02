import React, { useEffect, useState } from 'react';
import { apiRequest, API_URL } from '../lib/api';
import PostCard from '../components/feed/PostCard';
import AppLayout from '../components/layout/AppLayout';

export default function Dashboard() {
  const [feed, setFeed] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await apiRequest('/api/posts/feed');
        let mapped = (res.posts || []).map((p) => {
          const mediaSrc = p.video?.url ? p.video.url : p.images?.[0]?.url;
          const resolved = mediaSrc && (mediaSrc.startsWith('http') ? mediaSrc : API_URL + mediaSrc);
          return {
            id: p._id,
            user: { 
              username: p.author?.username || 'user', 
              avatar: p.author?.avatarUrl ? (p.author.avatarUrl.startsWith('http') ? p.author.avatarUrl : API_URL + p.author.avatarUrl) : '/avatar.svg' 
            },
            authorId: p.author?._id,
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
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
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
      if (follow) await apiRequest(`/api/users/${authorId}/follow`, { method: 'POST' });
      else await apiRequest(`/api/users/${authorId}/follow`, { method: 'DELETE' });
    } catch {}
  };

  return (
    <AppLayout>
      <div className="mx-auto px-4 py-8 max-w-4xl">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Main Feed Section */}
          <section aria-label="Feed" className="space-y-6">
            {feed.map((p) => (
              <PostCard 
                key={p.id} 
                post={p} 
                onLike={onLike} 
                onSave={onSave} 
                onComment={onComment} 
                onFollowToggle={onFollowToggle} 
                withComments 
              />
            ))}
            {feed.length === 0 && !loading && (
              <div className="text-center py-20 bg-[#0f161b] rounded-3xl border border-white/5 p-8 shadow-xl">
                 <div className="text-4xl mb-4">✨</div>
                 <h3 className="text-lg font-bold text-white">Your feed is empty</h3>
                 <p className="mt-2 text-gray-500 text-sm">Discover and follow creators to fill your space.</p>
              </div>
            )}
            {loading && (
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="h-96 rounded-3xl bg-white/5 animate-pulse border border-white/5" />
                ))}
              </div>
            )}
          </section>

          {/* Right Sidebar - Hidden on Tablet/Mobile */}
          <aside className="hidden lg:block space-y-6 sticky top-8">
            <div className="bg-[#0f161b] rounded-2xl p-6 border border-white/5 shadow-xl">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 mb-4">Discovery</h4>
              <p className="text-sm text-[#9aa5b1] leading-relaxed">
                Connect with makers and creators to personalize your Pulse.
              </p>
              <div className="mt-6 pt-4 border-t border-white/5">
                 <button className="w-full py-2.5 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition-all">
                    Find People
                 </button>
              </div>
            </div>
            
            <div className="px-2">
               <p className="text-[10px] text-gray-600 font-medium tracking-wide">
                 Pulse Social &copy; 2025. Nocturnal Creative System.
               </p>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
