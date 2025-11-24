// import React, { useEffect, useMemo, useRef, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { apiRequest } from '../../lib/api';

// export default function PostCard({ post, onLike, onSave, onComment, withComments = false, onFollowToggle }) {
//   const videoRef = useRef(null);
//   const [liked, setLiked] = useState(post.liked || false);
//   const [saved, setSaved] = useState(post.saved || false);
//   const [likes, setLikes] = useState(post.likes || 0);
//   const [commentsCount, setCommentsCount] = useState(post.comments || 0);
//   const [comment, setComment] = useState('');
//   const [paused, setPaused] = useState(false);
//   const [comments, setComments] = useState([]); // flat list
//   const [showComments, setShowComments] = useState(false);
//   const [replyFor, setReplyFor] = useState(null); // comment id
//   const [following, setFollowing] = useState(post.following || false);

//   const isVideo = useMemo(() => post.media?.type === 'video', [post.media]);

//   useEffect(() => {
//     if (!withComments) return;
//     if (!showComments) return;
//     (async () => {
//       try {
//         const res = await apiRequest(`/api/posts/${post.id}/comments`);
//         setComments(res.comments || []);
//       } catch {}
//     })();
//   }, [withComments, showComments, post.id]);

//   const toggleLike = () => {
//     const next = !liked;
//     setLiked(next);
//     setLikes((n) => (next ? n + 1 : Math.max(0, n - 1)));
//     onLike?.(post.id, next);
//   };
//   const toggleSave = () => {
//     const next = !saved;
//     setSaved(next);
//     onSave?.(post.id, next);
//   };
//   const submitComment = () => {
//     const text = comment.trim();
//     if (!text) return;
//     onComment?.(post.id, text);
//     setCommentsCount((n) => n + 1);
//     setComment('');
//     // refresh comments if open
//     if (showComments) {
//       setTimeout(async () => {
//         try {
//           const res = await apiRequest(`/api/posts/${post.id}/comments`);
//           setComments(res.comments || []);
//         } catch {}
//       }, 50);
//     }
//   };
//   const submitReply = (parentId, text) => {
//     const t = text.trim();
//     if (!t) return;
//     onComment?.(post.id, t, parentId);
//     setCommentsCount((n) => n + 1);
//     if (showComments) {
//       setTimeout(async () => {
//         try {
//           const res = await apiRequest(`/api/posts/${post.id}/comments`);
//           setComments(res.comments || []);
//         } catch {}
//       }, 50);
//     }
//   };

//   const onVideoClick = () => {
//     if (!videoRef.current) return;
//     if (videoRef.current.paused) {
//       videoRef.current.play();
//       setPaused(false);
//     } else {
//       videoRef.current.pause();
//       setPaused(true);
//     }
//   };

//   return (
//     <article className="bg-[#1c1e22] text-[#EEECF1] rounded-lg p-4 border border-black/20" aria-label={`Post by ${post.user.username}`}>
//       <header className="flex items-center gap-3 mb-3">
//         <img src={post.user.avatar || '/avatar.svg'} alt={`${post.user.username} avatar`} className="w-8 h-8 rounded-full" />
//         <div className="leading-tight">
//           <div className="text-[15px] font-semibold"><Link to={`/u/${post.user.username}`}>@{post.user.username}</Link></div>
//           <div className="text-xs text-[#9aa5b1]" aria-label="Timestamp">{post.timestamp}</div>
//         </div>
//         {post.authorId && !post.isMine && (
//           <div className="ml-auto">
//             <button
//               onClick={() => { const next = !following; setFollowing(next); onFollowToggle?.(post.authorId, next); }}
//               className={`px-3 py-1 rounded-md text-sm border ${following ? 'bg-transparent border-[#A28DB9] text-[#A28DB9]' : 'bg-[#A28DB9] text-black border-[#A28DB9]'}`}
//               aria-label={following ? 'Unfollow user' : 'Follow user'}
//             >
//               {following ? 'Following' : 'Follow'}
//             </button>
//           </div>
//         )}
//       </header>

//       <div className="relative">
//         {isVideo ? (
//           <div className="relative">
//             <video
//               ref={videoRef}
//               className="w-full rounded-md"
//               src={post.media.src}
//               aria-label={post.media.alt}
//               muted
//               loop
//               playsInline
//               autoPlay
//               onClick={onVideoClick}
//             />
//             {paused && (
//               <div className="absolute inset-0 grid place-items-center">
//                 <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-2xl">▶</div>
//               </div>
//             )}
//           </div>
//         ) : (
//           <img className="w-full rounded-md object-cover" src={post.media?.src} alt={post.media?.alt} />
//         )}
//       </div>

//       <div className="mt-3 flex items-center gap-3">
//         <button
//           aria-label={liked ? 'Unlike' : 'Like'}
//           onClick={toggleLike}
//           className={`min-w-[44px] min-h-[44px] flex items-center gap-1 px-2 rounded-md focus:outline-none focus:ring-2 ${liked ? 'text-[#A28DB9]' : 'text-[#EEECF1]'} transition-colors`}
//         >
//           <span aria-hidden>♥</span>
//           <span className="text-sm">Like</span>
//         </button>
//         <button
//           aria-label="Comment"
//           onClick={() => {
//             setShowComments((v) => !v);
//             const el = document.getElementById(`cmt-${post.id}`);
//             el?.focus();
//           }}
//           className="min-w-[44px] min-h-[44px] flex items-center gap-1 px-2 rounded-md focus:outline-none focus:ring-2"
//         >
//           <span aria-hidden>💬</span>
//           <span className="text-sm">Comment</span>
//         </button>
//         <button
//           aria-label={saved ? 'Unsave' : 'Save'}
//           onClick={toggleSave}
//           className={`min-w-[44px] min-h-[44px] flex items-center gap-1 px-2 rounded-md focus:outline-none focus:ring-2 ${saved ? 'text-[#A28DB9]' : 'text-[#EEECF1]'} transition-colors`}
//         >
//           <span aria-hidden>🔖</span>
//           <span className="text-sm">Save</span>
//         </button>
//         <div className="ml-auto text-sm text-[#9aa5b1]">
//           <span aria-label="likes">{likes} likes</span>
//           <span className="mx-2">•</span>
//           <span aria-label="comments">{commentsCount} comments</span>
//         </div>
//       </div>

//       <div className="mt-3">
//         <label className="sr-only" htmlFor={`cmt-${post.id}`}>Add a comment</label>
//         <input
//           id={`cmt-${post.id}`}
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//           onKeyDown={(e) => {
//             if (e.key === 'Enter') {
//               e.preventDefault();
//               submitComment();
//             }
//           }}
//           placeholder="Add a comment…"
//           className="w-full rounded-full bg-[#3b3839] px-4 py-2 text-[14px] placeholder:text-[#bfb9c5] focus:outline-none focus:ring-2 focus:ring-[#A28DB9]/40"
//         />
//       </div>

//       {withComments && showComments && (
//         <div className="mt-3 space-y-3">
//           {comments
//             .filter((c) => !c.parent)
//             .map((c) => (
//               <div key={c._id} className="text-sm">
//                 <div className="flex items-start gap-2">
//                   <div className="w-7 h-7 rounded-full bg-[#0b0b0b]" />
//                   <div className="flex-1">
//                     <div className="text-[#EEECF1]">{c.text}</div>
//                     <button className="text-xs text-[#A28DB9] mt-1" onClick={() => setReplyFor(c._id)}>Reply</button>
//                     {/* Replies */}
//                     <div className="mt-2 pl-4 border-l border-black/30 space-y-2">
//                       {comments.filter((r) => String(r.parent) === String(c._id)).map((r) => (
//                         <div key={r._id} className="text-sm">
//                           <div className="text-[#EEECF1]">{r.text}</div>
//                         </div>
//                       ))}
//                       {replyFor === c._id && (
//                         <ReplyInput onSubmit={(text) => { submitReply(c._id, text); setReplyFor(null); }} onCancel={() => setReplyFor(null)} />
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//         </div>
//       )}
//     </article>
//   );
// }

// function ReplyInput({ onSubmit, onCancel }) {
//   const [val, setVal] = useState('');
//   return (
//     <div className="flex items-center gap-2">
//       <input
//         value={val}
//         onChange={(e) => setVal(e.target.value)}
//         onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmit(val); setVal(''); } }}
//         placeholder="Write a reply…"
//         className="flex-1 rounded-full bg-[#3b3839] px-3 py-2 text-[13px]"
//       />
//       <button className="text-xs px-2 py-1 rounded bg-[#1c1e22] border border-black/30" onClick={onCancel}>Cancel</button>
//       <button className="text-xs px-2 py-1 rounded bg-[#A28DB9] text-black" onClick={() => { onSubmit(val); setVal(''); }}>Reply</button>
//     </div>
//   );
// }


import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

export default function PostCard({
  post,
  onLike,
  onSave,
  onComment,
  withComments = false,
  onFollowToggle,
}) {
  const videoRef = useRef(null);

  const [liked, setLiked] = useState(post.liked || false);
  const [saved, setSaved] = useState(post.saved || false);
  const [likes, setLikes] = useState(post.likes || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments || 0);
  const [comment, setComment] = useState('');
  const [paused, setPaused] = useState(false);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [replyFor, setReplyFor] = useState(null);
  const [following, setFollowing] = useState(post.following || false);

  const isVideo = useMemo(() => post.media?.type === 'video', [post.media]);

  // Load comments
  useEffect(() => {
    if (!withComments || !showComments) return;

    (async () => {
      try {
        const res = await apiRequest(`/api/posts/${post.id}/comments`);
        setComments(res.comments || []);
      } catch {}
    })();
  }, [withComments, showComments, post.id]);

  const toggleLike = () => {
    const next = !liked;
    setLiked(next);
    setLikes((n) => (next ? n + 1 : Math.max(0, n - 1)));
    onLike?.(post.id, next);
  };

  const toggleSave = () => {
    const next = !saved;
    setSaved(next);
    onSave?.(post.id, next);
  };

  const submitComment = () => {
    const text = comment.trim();
    if (!text) return;

    onComment?.(post.id, text);
    setCommentsCount((n) => n + 1);
    setComment('');

    if (showComments) refreshComments();
  };

  const refreshComments = async () => {
    try {
      const res = await apiRequest(`/api/posts/${post.id}/comments`);
      setComments(res.comments || []);
    } catch {}
  };

  const onVideoClick = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPaused(false);
    } else {
      videoRef.current.pause();
      setPaused(true);
    }
  };

  return (
    <article
      className="
        relative rounded-2xl p-5 
        bg-white/5 backdrop-blur-xl 
        border border-purple-500/20 shadow-xl 
        overflow-hidden
        transition-all duration-300
        hover:border-purple-500/50 hover:shadow-purple-500/20
      "
      aria-label={`Post by ${post.user.username}`}
    >
      {/* Header */}
      <header className="flex items-center gap-3 mb-4">
        <img
          src={post.user.avatar || '/avatar.svg'}
          className="w-10 h-10 rounded-full shadow-md"
        />
        <div className="min-w-0 flex-1">
          <Link
            to={`/u/${post.user.username}`}
            className="text-sm font-semibold text-white block truncate"
          >
            @{post.user.username}
          </Link>
          <div className="text-[11px] text-gray-400">{post.timestamp}</div>
        </div>

        {!post.isMine && post.authorId && (
          <button
            onClick={() => {
              const next = !following;
              setFollowing(next);
              onFollowToggle?.(post.authorId, next);
            }}
            className={`
              ml-auto px-3 py-1 rounded-full text-xs 
              transition-all duration-300
              ${
                following
                  ? 'border border-purple-400 text-purple-400 bg-white/5'
                  : 'bg-purple-500 text-black shadow'
              }
            `}
          >
            {following ? 'Following' : 'Follow'}
          </button>
        )}
      </header>

      {/* Media */}
      <div className="relative rounded-xl overflow-hidden">
        {isVideo ? (
          <div className="relative">
            <video
              ref={videoRef}
              src={post.media.src}
              className="w-full h-auto max-h-[70vh] rounded-xl object-contain"
              muted
              loop
              playsInline
              autoPlay
              onClick={onVideoClick}
            />
            {paused && (
              <div className="absolute inset-0 grid place-items-center">
                <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur text-3xl flex items-center justify-center">
                  ▶
                </div>
              </div>
            )}
          </div>
        ) : (
          <img
            src={post.media.src}
            alt=""
            className="w-full h-auto max-h-[70vh] rounded-xl object-contain"
          />
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-4 flex-wrap">
        {/* Like */}
        <button
          onClick={toggleLike}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur transition-all duration-300 ${
            liked
              ? 'text-purple-400 bg-purple-400/10 shadow-purple-500/20'
              : 'text-white/80 hover:bg-white/5'
          }`}
        >
          ♥ <span className="text-sm">Like</span>
        </button>

        {/* Comment */}
        <button
          onClick={() => {
            setShowComments((v) => !v);
            document.getElementById(`cmt-${post.id}`)?.focus();
          }}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white/80 hover:bg-white/5 backdrop-blur"
        >
          💬 <span className="text-sm">Comment</span>
        </button>

        {/* Save */}
        <button
          onClick={toggleSave}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full backdrop-blur transition-all duration-300 ${
            saved
              ? 'text-purple-400 bg-purple-400/10 shadow-purple-500/20'
              : 'text-white/80 hover:bg-white/5'
          }`}
        >
          🔖 <span className="text-sm">Save</span>
        </button>

        <div className="ml-auto text-xs text-gray-400">
          {likes} likes • {commentsCount} comments
        </div>
      </div>

      {/* Comment Input */}
      <div className="mt-4">
        <input
          id={`cmt-${post.id}`}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          placeholder="Add a comment…"
          className="
            w-full rounded-full px-4 py-2 bg-white/10 
            text-sm text-white placeholder-gray-400
            backdrop-blur focus:ring-2 focus:ring-purple-500/40
          "
        />
      </div>

      {/* Comments Section */}
      {withComments && showComments && (
        <div className="mt-4 space-y-3">
          {comments
            .filter((c) => !c.parent)
            .map((c) => (
              <CommentItem
                key={c._id}
                comment={c}
                comments={comments}
                replyFor={replyFor}
                setReplyFor={setReplyFor}
                submitReply={(text) => {
                  onComment?.(post.id, text, c._id);
                  setCommentsCount((n) => n + 1);
                  refreshComments();
                }}
              />
            ))}
        </div>
      )}
    </article>
  );
}

/* ──────────────────────────────── REPLY INPUT ─────────────────────────────── */

function CommentItem({ comment, comments, replyFor, setReplyFor, submitReply }) {
  const replies = comments.filter((r) => String(r.parent) === String(comment._id));

  return (
    <div className="text-sm">
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-white/10" />
        <div className="flex-1">
          <div className="text-white">{comment.text}</div>

          <button
            onClick={() => setReplyFor(comment._id)}
            className="text-xs text-purple-400 mt-1"
          >
            Reply
          </button>

          <div className="mt-2 pl-4 border-l border-white/10 space-y-2">
            {replies.map((r) => (
              <div key={r._id} className="text-gray-300 text-sm">
                {r.text}
              </div>
            ))}

            {replyFor === comment._id && (
              <ReplyInput
                onSubmit={(t) => {
                  submitReply(t);
                  setReplyFor(null);
                }}
                onCancel={() => setReplyFor(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReplyInput({ onSubmit, onCancel }) {
  const [val, setVal] = useState('');

  return (
    <div className="flex items-center gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit(val);
            setVal('');
          }
        }}
        placeholder="Write a reply…"
        className="flex-1 rounded-full bg-white/10 px-3 py-2 text-[13px] backdrop-blur text-white"
      />
      <button
        onClick={onCancel}
        className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300"
      >
        Cancel
      </button>
      <button
        onClick={() => {
          onSubmit(val);
          setVal('');
        }}
        className="text-xs px-2 py-1 rounded bg-purple-500 text-black"
      >
        Reply
      </button>
    </div>
  );
}
