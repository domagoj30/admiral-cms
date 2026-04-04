'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/admin', icon: '◫', label: 'Dashboard' },
  { href: '/admin/pages', icon: '☰', label: 'Stranice' },
  { href: '/admin/templates', icon: '❒', label: 'Predlošci' },
  { href: '/admin/campaigns', icon: '⚡', label: 'Kampanje' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-admiral-dark text-[#c8d4e6]">
      {/* Sidebar */}
      <div
        className="flex flex-col border-r border-white/5 transition-all duration-300 flex-shrink-0"
        style={{ width: collapsed ? 64 : 240 }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 border-b border-white/5 cursor-pointer"
          style={{ padding: collapsed ? '20px 12px' : '20px 20px' }}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="w-9 h-9 rounded-[10px] flex items-center justify-center font-oswald font-extrabold text-base text-admiral-dark flex-shrink-0 bg-gradient-to-br from-admiral-accent to-[#d4a80f]">
            A
          </div>
          {!collapsed && (
            <div>
              <div className="text-[15px] font-bold text-white font-oswald tracking-wider">ADMIRAL</div>
              <div className="text-[10px] text-admiral-accent tracking-[2px] font-oswald">CMS PANEL</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="p-2 flex-1">
          {navItems.map(item => {
            const active = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 mb-0.5 rounded-[10px] text-[13px] transition-all duration-200 no-underline ${
                  active
                    ? 'bg-admiral-accent/10 text-admiral-accent font-semibold'
                    : 'text-[#8b95a5] hover:text-white hover:bg-white/5'
                }`}
                style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}
              >
                <span className="text-[17px] w-6 text-center flex-shrink-0">{item.icon}</span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="px-5 py-4 border-t border-white/5 text-[11px] text-[#5a6577]">
            <div className="text-[#8b95a5] font-semibold mb-1">Novi CMS v1.0</div>
            Next.js + Supabase
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="px-7 py-3 border-b border-white/5 flex justify-between items-center">
          <div className="text-[11px] text-[#5a6577]">
            admiral.hr / admin
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-admiral-green">
              <div className="w-1.5 h-1.5 rounded-full bg-admiral-green" />
              Sustav aktivan
            </div>
            <Link
              href="/info/put-do-finala"
              className="text-[11px] text-admiral-accent bg-admiral-accent/10 px-3 py-1.5 rounded-lg no-underline hover:bg-admiral-accent/20 transition-colors"
            >
              ◉ Preview stranice
            </Link>
            <div className="w-[30px] h-[30px] rounded-lg bg-admiral-accent/10 text-admiral-accent flex items-center justify-center text-[13px] font-bold font-oswald">
              D
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-7">
          {children}
        </div>
      </div>
    </div>
  );
}
