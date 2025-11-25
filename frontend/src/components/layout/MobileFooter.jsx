import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../lib/api';

export default function MobileFooter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await apiRequest('/api/messages/unread-total');
        if (mounted) setUnread(r.count || 0);
      } catch {}
    })();
    const t = setInterval(async () => {
      try {
        const r = await apiRequest('/api/messages/unread-total');
        if (mounted) setUnread(r.count || 0);
      } catch {}
    }, 10000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, []);

  const items = [
    { label: 'Home', icon: '🏠', to: '/dashboard' },
    { label: 'Search', icon: '🔍', to: '/dashboard/search' },
    { label: 'New', icon: '➕', to: '/dashboard/compose' },
    { label: 'Messages', icon: '💬', to: '/dashboard/messages', badge: unread },
    { label: 'Profile', icon: '👤', to: '/dashboard/profile' },
  ];

  return (
    <nav
      className="mobile-nav grid grid-cols-5 md:hidden z-40"
      aria-label="Bottom navigation"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {items.map((b) => {
        const active = location.pathname === b.to;
        return (
          <button
            key={b.label}
            aria-label={b.label}
            onClick={() => navigate(b.to)}
            className={`icon-btn justify-center ${active ? 'active' : ''}`}
          >
            <span aria-hidden className="icon text-lg">{b.icon}</span>
            {b.badge > 0 && (
              <span className="ml-1 text-[10px] rounded-full px-1.5 py-0.5" style={{
                background: 'color-mix(in srgb, var(--accent), transparent 85%)',
                color: 'var(--accent)'
              }}>
                {b.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
