import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MobileFooter from './MobileFooter';
import { apiRequest, API_URL } from '../../lib/api';

/**
 * AppLayout provides a consistent responsive shell for all dashboard-related pages.
 * - Persistent Topbar
 * - Responsive Sidebar (hidden on mobile)
 * - Mobile Navigation Footer (hidden on desktop)
 * - Centralized User & Notification state
 */
export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [avatarSrc, setAvatarSrc] = useState('');
  const [unread, setUnread] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth <= 900);

  useEffect(() => {
    const onResize = () => setSidebarCollapsed(window.innerWidth <= 900);
    window.addEventListener('resize', onResize);
    
    // Initial fetch
    (async () => {
      try {
        const u = await apiRequest('/api/auth/me');
        setUser(u.user);
        
        const prof = await apiRequest('/api/profile/me');
        const url = prof.user?.avatarUrl 
          ? (prof.user.avatarUrl.startsWith('http') ? prof.user.avatarUrl : API_URL + prof.user.avatarUrl) 
          : '';
        setAvatarSrc(url);
        
        const r = await apiRequest('/api/messages/unread-total');
        setUnread(r.count || 0);
      } catch (err) {
        console.error("Layout fetch error:", err);
      }
    })();

    // Poll for notifications
    const t = setInterval(async () => {
      try { 
        const r = await apiRequest('/api/messages/unread-total'); 
        setUnread(r.count || 0); 
      } catch {}
    }, 15000);

    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(t);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-[#0b0f14] text-[#e6eef3]">
      {/* Fixed Topbar */}
      <div className="z-40">
        <Topbar 
          onLogout={logout} 
          onProfile={() => navigate('/dashboard/profile')} 
          onCompose={() => navigate('/dashboard/compose')} 
          avatarSrc={avatarSrc} 
        />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Responsive Desktop Sidebar */}
        <aside className={`hidden md:block border-r border-white/5 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'}`}>
          <Sidebar collapsed={sidebarCollapsed} unreadCount={unread} />
        </aside>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide relative focus:outline-none">
          {/* Main content padding (bottom padding for mobile footer) */}
          <div className="pb-24 md:pb-6 min-h-full">
             {children}
          </div>
        </main>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <MobileFooter unreadCount={unread} />
      </div>
    </div>
  );
}
