import React, { useEffect, useRef, useState } from 'react';
import { apiRequest, API_URL } from '../lib/api';
import { io } from 'socket.io-client';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

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

  // For mobile responsiveness: track if we are in "chat" mode or "list" mode
  const [showChat, setShowChat] = useState(!!otherId);

  useEffect(() => {
    setShowChat(!!otherId);
  }, [otherId]);

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const s = io(API_URL, { auth: { token } });
    setSocket(s);
    s.on('typing', ({ from, typing }) => {
      if (String(from) === String(otherId)) setTypingFromOther(!!typing);
    });
    return () => { s.disconnect(); };
  }, [otherId]);

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

  const activeUser = mutuals.find(u => u._id === otherId);

  return (
    <AppLayout>
      <div className="h-full flex flex-col max-w-6xl mx-auto md:p-6">
        <div className="flex-1 flex overflow-hidden glass md:rounded-3xl border border-white/5 shadow-2xl">
          
          {/* Chat List (Sidebar) */}
          <aside className={`${showChat ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col border-r border-white/5 bg-[#0b0b0b]/40 backdrop-blur-md`}>
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold tracking-tight text-white">Directs</h2>
              <p className="text-xs text-gray-500 font-medium tracking-widest uppercase mt-1">Pulse Connect</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {mutuals.length === 0 && (
                <div className="text-center py-10 opacity-40 text-sm">No mutuals found</div>
              )}
              {mutuals.map(u => (
                <button
                  key={u._id}
                  onClick={() => setParams({ u: u._id })}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 ${otherId === u._id ? 'bg-[#ff6b6b] text-black shadow-lg shadow-red-500/20' : 'hover:bg-white/5'}`}
                >
                  <img 
                    src={u.avatarUrl ? (u.avatarUrl.startsWith('http')?u.avatarUrl:API_URL+u.avatarUrl) : '/avatar.svg'} 
                    className={`w-12 h-12 rounded-2xl object-cover border-2 ${otherId === u._id ? 'border-black/20' : 'border-white/10'}`} 
                    alt="User" 
                  />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-bold truncate">{u.displayName || u.username}</div>
                    <div className={`text-xs ${otherId === u._id ? 'text-black/60' : 'text-gray-500'}`}>@{u.username}</div>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Chat Window */}
          <section className={`${showChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#0f161b]/30`}>
            {!otherId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-30 select-none">
                <div className="text-6xl mb-4">💬</div>
                <h3 className="text-lg font-bold">Your Sanctuary for Words</h3>
                <p className="text-sm mt-2 max-w-xs">Select a creative collaborator to start a private dialogue.</p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <header className="p-4 md:p-6 border-b border-white/5 flex items-center gap-4 bg-black/20">
                  <button onClick={() => setParams({})} className="md:hidden p-2 rounded-full hover:bg-white/10">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  </button>
                  <img 
                    src={activeUser?.avatarUrl ? (activeUser.avatarUrl.startsWith('http')?activeUser.avatarUrl:API_URL+activeUser.avatarUrl) : '/avatar.svg'} 
                    className="w-10 h-10 rounded-full object-cover border border-white/10" 
                    alt="Active" 
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{activeUser?.displayName || activeUser?.username}</h3>
                    <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">{typingFromOther ? 'Typing...' : 'Active Now'}</div>
                  </div>
                </header>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {thread.map(m => (
                    <div key={m._id} className={`flex ${m.from === otherId ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl shadow-xl ${m.from === otherId ? 'bg-white/5 border border-white/5 text-gray-200' : 'bg-gradient-to-br from-[#b76bff] to-[#ff6b6b] text-black font-bold'}`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                        <span className={`text-[10px] block mt-1 opacity-60 ${m.from === otherId ? '' : 'text-black'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <footer className="p-4 md:p-6 bg-black/40 border-t border-white/5">
                  <div className="flex items-center gap-3 bg-[#0b0f14]/80 rounded-2xl p-2 border border-white/10 focus-within:border-purple-500/50 transition-all duration-300">
                    <input
                      value={text}
                      onChange={(e)=>onTyping(e.target.value)}
                      onKeyDown={(e)=>{ if (e.key==='Enter') { e.preventDefault(); send(); } }}
                      placeholder="Enter cinematic message..."
                      className="flex-1 bg-transparent px-4 py-2 text-sm outline-none placeholder:text-gray-600"
                    />
                    <button 
                      onClick={send} 
                      className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#ff6b6b] text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                    >
                       <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/></svg>
                    </button>
                  </div>
                </footer>
              </>
            )}
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
