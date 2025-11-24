import React, { useEffect, useRef, useState } from 'react';
import { apiRequest, API_URL } from '../lib/api';
import { io } from 'socket.io-client';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Messages() {
  const [mutuals, setMutuals] = useState([]);
  const [thread, setThread] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [params, setParams] = useSearchParams();
  const otherId = params.get('u') || '';
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [typingFromOther, setTypingFromOther] = useState(false);
  const typingTimer = useRef(null);

  const loadMutuals = async () => {
    try {
      const res = await apiRequest('/api/messages/mutuals');
      setMutuals(res.users || []);
    } catch (e) {
      setError(e.message);
    }
  };

  const loadThread = async () => {
    if (!otherId) { setThread([]); return; }
    try {
      const res = await apiRequest(`/api/messages/thread/${otherId}`);
      setThread(res.messages || []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => { loadMutuals(); }, []);
  useEffect(() => { loadThread(); }, [otherId]);

  // simple polling every 5s when a chat is selected
  useEffect(() => {
    if (!otherId) return;
    const t = setInterval(loadThread, 5000);
    return () => clearInterval(t);
  }, [otherId]);

  const send = async () => {
    const t = text.trim();
    if (!t || !otherId) return;
    try {
      setText('');
      await apiRequest(`/api/messages/thread/${otherId}`, { method: 'POST', body: { text: t } });
      await loadThread();
      if (socket) socket.emit('typing', { otherId, typing: false });
    } catch (e) {
      setError(e.message);
    }
  };

  // Socket.IO setup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io(API_URL, { auth: { token } });
    setSocket(s);
    s.on('connect_error', () => {});
    s.on('typing', ({ from, typing }) => {
      if (String(from) === String(otherId)) setTypingFromOther(!!typing);
    });
    return () => { s.disconnect(); };
  }, []);

  // Join room when selecting user
  useEffect(() => {
    if (socket && otherId) socket.emit('join', otherId);
    setTypingFromOther(false);
  }, [socket, otherId]);

  const onTyping = (val) => {
    setText(val);
    if (!socket || !otherId) return;
    socket.emit('typing', { otherId, typing: true });
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('typing', { otherId, typing: false });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#EEECF1]">
      <div className="mx-auto max-w-[1200px] grid md:grid-cols-[320px_1fr] gap-4 px-4 py-6">
        <aside className="bg-[#1c1e22] border border-black/30 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[15px] font-semibold">Messages</div>
            <button onClick={()=>navigate('/dashboard')} className="px-2 py-1 rounded-md text-xs border border-black/30">Home</button>
          </div>
          <div className="space-y-1">
            {mutuals.length === 0 && (
              <div className="text-sm text-[#9aa5b1]">No mutual followers yet.</div>
            )}
            {mutuals.map(u => (
              <button
                key={u._id}
                onClick={() => setParams({ u: u._id })}
                className={`w-full text-left p-2 rounded ${otherId===u._id?'bg-black/30':'hover:bg-black/20'}`}
              >
                <div className="flex items-center gap-3">
                  <img src={u.avatarUrl ? (u.avatarUrl.startsWith('http')?u.avatarUrl:API_URL+u.avatarUrl) : '/avatar.svg'} alt="Avatar" className="w-8 h-8 rounded-full" />
                  <div>
                    <div className="text-sm font-medium">{u.displayName || u.username}</div>
                    <div className="text-xs text-[#9aa5b1]">@{u.username}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="bg-[#1c1e22] border border-black/30 rounded-lg p-3 min-h-[60vh] flex flex-col">
          {!otherId ? (
            <div className="flex-1 grid place-items-center text-[#9aa5b1]">Select a user to start chatting</div>
          ) : (
            <>
              <div className="flex-1 overflow-auto space-y-2 pr-2">
                {thread.map(m => (
                  <div key={m._id} className={`max-w-[70%] p-2 rounded ${m.from === otherId ? 'bg-black/20 self-start' : 'bg-[#A28DB9] text-black self-end ml-auto'}`}>
                    <div className="text-sm whitespace-pre-wrap">{m.text}</div>
                    <div className="text-[11px] opacity-70 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e)=>onTyping(e.target.value)}
                  onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); send(); } }}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full bg-[#0b0b0b] border border-black/40 px-4 py-2 text-sm"
                />
                <button onClick={send} className="px-4 py-2 rounded-md bg-[#A28DB9] text-black">Send</button>
              </div>
              {typingFromOther && <div className="text-xs text-[#9aa5b1] mt-1">Typing…</div>}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
