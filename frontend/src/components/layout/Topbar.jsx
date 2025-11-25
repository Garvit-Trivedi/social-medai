import React, { useEffect, useRef, useState } from "react";

export default function Topbar({ onLogout, onProfile, onCompose, avatarSrc }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const onClick = (e) => {
      if (!menuRef.current || !btnRef.current) return;
      if (!menuRef.current.contains(e.target) && !btnRef.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <header className="navbar h-16 flex items-center justify-between px-6 text-[#EEECF1]">
      <div className="text-xl font-bold tracking-wide text-purple-500 select-none">
        Pulse
      </div>

      <div className="flex items-center gap-4 relative">
        <button
          onClick={onCompose}
          aria-label="Create"
          title="Create"
          className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-[#1c1e22] border border-black/30 shadow hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
        >
          +
        </button>

        <button
          ref={btnRef}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="w-10 h-10 rounded-full overflow-hidden border border-black/40 shadow hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400/40"
        >
          <img
            src={avatarSrc || "/avatar.svg"}
            alt="User avatar"
            className="w-full h-full object-cover"
          />
        </button>

        {open && (
          <div
            ref={menuRef}
            role="menu"
            className="absolute right-2 sm:right-6 top-16 z-50 w-44 panel text-[#EEECF1] overflow-hidden soft-fade"
          >
            <button
              role="menuitem"
              onClick={() => { window.location.href = '/dashboard/settings'; setOpen(false); }}
              className="w-full text-left px-4 py-2 text-sm hover:bg-black/20 focus:outline-none focus:bg-black/30"
            >
              Settings
            </button>
            <button
              role="menuitem"
              onClick={onProfile}
              className="w-full text-left px-4 py-2 text-sm hover:bg-black/20 focus:outline-none focus:bg-black/30"
            >
              Profile
            </button>
            <button
              role="menuitem"
              onClick={onLogout}
              className="w-full text-left px-4 py-2 text-sm hover:bg-black/20 focus:outline-none focus:bg-black/30"
            >
              Logout
            </button>
          </div>
        )}
      </div>
      <div className="navbar-underline" />
    </header>
  );
}
