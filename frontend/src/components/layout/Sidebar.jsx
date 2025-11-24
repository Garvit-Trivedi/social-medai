// import React from 'react';
// import { NavLink } from 'react-router-dom';

// const items = [
//   { to: '/dashboard', label: 'Home', icon: '🏠', key: 'home' },
//   { to: '/dashboard/search', label: 'Search', icon: '🔍', key: 'search' },
//   { to: '/dashboard/messages', label: 'Messages', icon: '💬', key: 'messages' },
//   { to: '/dashboard/settings', label: 'Settings', icon: '⚙️', key: 'settings' },
//   { to: '/dashboard/profile', label: 'Profile', icon: '👤', key: 'profile' },
// ];

// export default function Sidebar({ collapsed = false, unreadCount = 0 }) {
//   return (
//     <aside
//       className={`${collapsed ? 'w-[72px]' : 'w-[240px]'} shrink-0 h-full bg-[#1c1e22] text-[#EEECF1] border-r border-black/20`}
//       aria-label="Primary"
//     >
//       <div className="h-16 flex items-center px-4 text-lg font-semibold">{collapsed ? 'P' : 'Pulse'}</div>
//       <nav className="px-2 space-y-1">
//         {items.map((it) => (
//           <NavLink
//             key={it.key}
//             to={it.to}
//             className={({ isActive }) =>
//               [
//                 'group relative flex items-center gap-3 rounded-md px-3 py-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#A28DB9]/40',
//                 isActive ? 'bg-black/10' : 'hover:bg-black/10',
//               ].join(' ')
//             }
//             title={collapsed ? it.label : undefined}
//           >
//             {({ isActive }) => (
//               <>
//                 <span
//                   aria-hidden
//                   className={`absolute left-0 top-0 h-full w-1 rounded-r ${isActive ? 'bg-[#A28DB9]' : 'bg-transparent group-hover:bg-white/10'}`}
//                 />
//                 <span className="text-lg" aria-hidden>{it.icon}</span>
//                 {!collapsed && <span>{it.label}</span>}
//                 {it.key === 'messages' && unreadCount > 0 && (
//                   <span className="ml-auto text-xs rounded-full bg-[#A28DB9]/20 text-[#A28DB9] px-2 py-0.5">
//                     {unreadCount}
//                   </span>
//                 )}
//               </>
//             )}
//           </NavLink>
//         ))}
//       </nav>
//     </aside>
//   );
// }



import React from "react";
import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard", label: "Home", icon: "🏠", key: "home" },
  { to: "/dashboard/search", label: "Search", icon: "🔍", key: "search" },
  { to: "/dashboard/messages", label: "Messages", icon: "💬", key: "messages" },
  { to: "/dashboard/settings", label: "Settings", icon: "⚙️", key: "settings" },
  { to: "/dashboard/profile", label: "Profile", icon: "👤", key: "profile" },
];

export default function Sidebar({ collapsed = false, unreadCount = 0 }) {
  return (
    <aside
      className={`${
        collapsed ? "w-[72px]" : "w-[240px]"
      } shrink-0 h-full bg-[#0b0b0b] text-[#EEECF1] border-r border-black/20 shadow-xl`}
      aria-label="Primary"
    >
      {/* Empty top spacing for clean professional look */}
      <div className="h-6" />

      <nav className="px-2 space-y-1">
        {items.map((it) => (
          <NavLink
            key={it.key}
            to={it.to}
            className={({ isActive }) =>
              [
                "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-all duration-200 hover:scale-[1.02] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-purple-500/40",
                isActive
                  ? "bg-purple-500/10 text-purple-400"
                  : "text-[#d2d2d2]",
              ].join(" ")
            }
            title={collapsed ? it.label : undefined}
          >
            {({ isActive }) => (
              <>
                {/* Purple accent bar */}
                <span
                  aria-hidden
                  className={`absolute left-0 top-0 h-full w-1 rounded-r transition-all duration-200 ${
                    isActive
                      ? "bg-purple-500"
                      : "bg-transparent group-hover:bg-purple-400/30"
                  }`}
                />

                {/* Icon */}
                <span className="text-xl">{it.icon}</span>

                {/* Label */}
                {!collapsed && (
                  <span className="font-medium tracking-wide">
                    {it.label}
                  </span>
                )}

                {/* Unread messages */}
                {it.key === "messages" && unreadCount > 0 && (
                  <span className="ml-auto text-xs rounded-full bg-purple-600/20 text-purple-300 px-2 py-0.5">
                    {unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
