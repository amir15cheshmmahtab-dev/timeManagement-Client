import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, LayoutDashboard, Users, BarChart3, Settings, Bell, LogOut,
  ChevronLeft, ChevronRight, Shield, CalendarDays, FileText,
  Cake, Trophy, X, Megaphone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_NOTIFICATIONS } from '@/data/mockData';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  roles?: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: CalendarDays, label: 'Attendance', path: '/attendance' },
  { icon: FileText, label: 'Leave Requests', path: '/leave', badge: 3 },
  { icon: Megaphone, label: 'Notifications', path: '/notifications' },
  { icon: Users, label: 'Employees', path: '/employees', roles: ['admin', 'manager'] },
  { icon: BarChart3, label: 'Reports', path: '/reports', roles: ['admin', 'manager'] },
  { icon: Shield, label: 'Admin Panel', path: '/admin', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/settings', roles: ['admin'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, sessionWarning, extendSession, dismissSessionWarning } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  const handleLogout = (reason?: 'manual' | 'timeout') => {
    logout(reason);
    navigate('/login');
  };

  const filteredNav = navItems.filter(item =>
    !item.roles || item.roles.includes(user?.role || '')
  );

  const roleColor = {
    admin: 'hsl(263, 70%, 50%)',
    manager: 'hsl(199, 89%, 48%)',
    employee: 'hsl(142, 71%, 45%)',
  }[user?.role || 'employee'];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative flex flex-col border-r border-border shadow-card overflow-hidden"
        style={{ background: 'hsl(var(--sidebar-background))', minWidth: collapsed ? 72 : 256 }}
      >
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 h-16 border-b border-border ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-purple">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="font-bold text-sm leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'hsl(var(--primary))' }}>TimeTrack</div>
                <div className="text-xs text-muted-foreground font-medium">Pro</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-card flex items-center justify-center shadow-sm hover:shadow-purple transition-all z-10"
          style={{ color: 'hsl(var(--primary))' }}
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto mt-2">
          {filteredNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? 'text-primary shadow-sm'
                    : 'text-sidebar-foreground hover:bg-muted'
                } ${collapsed ? 'justify-center' : ''}`
              }
              style={({ isActive }) => isActive ? { background: 'hsl(var(--sidebar-accent))', color: 'hsl(var(--sidebar-primary))' } : {}}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full" style={{ background: 'hsl(var(--primary))' }} />
                  )}
                  <item.icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? '' : 'text-muted-foreground group-hover:text-foreground'}`} style={{ width: 18, height: 18 }} />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {!collapsed && item.badge && (
                    <span className="ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: 'hsl(var(--primary))' }}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className={`p-3 border-t border-border ${collapsed ? 'flex justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: roleColor }}>
                {user?.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground truncate">{user?.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
              </div>
              <button onClick={() => handleLogout('manual')} className="text-muted-foreground hover:text-destructive transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={() => handleLogout('manual')} className="text-muted-foreground hover:text-destructive transition-colors p-2">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
          <div>
            <div className="font-bold text-foreground text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="text-xs text-muted-foreground">{user?.department} · {user?.position}</div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative w-9 h-9 rounded-xl bg-muted flex items-center justify-center hover:bg-secondary transition-colors"
              >
                <Bell className="w-4 h-4 text-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 text-white text-xs font-bold rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--primary))' }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-96 bg-card rounded-2xl border border-border shadow-purple-lg z-50"
                  >
                    <div className="p-4 border-b border-border flex justify-between items-center">
                      <span className="font-semibold text-sm text-foreground">Notifications</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: 'hsl(var(--primary))' }}>{unreadCount} new</span>
                        <button onClick={() => setShowNotifications(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-border">
                      {MOCK_NOTIFICATIONS.map(n => {
                        const isBirthday = n.type === 'birthday';
                        const isAnniversary = n.type === 'anniversary';
                        const dotColor =
                          isBirthday ? 'hsl(330 80% 60%)' :
                          isAnniversary ? 'hsl(45 90% 55%)' :
                          n.type === 'success' ? 'hsl(var(--status-present))' :
                          n.type === 'warning' ? 'hsl(var(--status-late))' :
                          n.type === 'error' ? 'hsl(var(--status-absent))' : 'hsl(var(--primary))';
                        return (
                          <div key={n.id} className={`p-3.5 hover:bg-muted transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                            <div className="flex gap-2.5">
                              <div className="flex-shrink-0 mt-0.5">
                                {isBirthday ? (
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(330 80% 60% / 0.15)' }}>
                                    <Cake className="w-3.5 h-3.5" style={{ color: 'hsl(330 80% 60%)' }} />
                                  </div>
                                ) : isAnniversary ? (
                                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(45 90% 55% / 0.15)' }}>
                                    <Trophy className="w-3.5 h-3.5" style={{ color: 'hsl(45 90% 55%)' }} />
                                  </div>
                                ) : (
                                  <div className="w-2 h-2 rounded-full mt-1" style={{ background: dotColor }} />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-foreground">{n.title}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{n.message}</div>
                                <div className="text-xs text-muted-foreground mt-1 font-medium">{n.time}</div>
                              </div>
                              {!n.read && <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: 'hsl(var(--primary))' }} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="p-3 border-t border-border">
                      <button className="w-full text-xs font-semibold text-center transition-colors" style={{ color: 'hsl(var(--primary))' }}>
                        Mark all as read
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: roleColor }}>
              {user?.avatar}
            </div>
          </div>
        </header>

        {/* Session expiry warning */}
        <AnimatePresence>
          {sessionWarning && (
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="mx-6 mt-4 px-4 py-3 rounded-xl flex items-center justify-between gap-4 border"
              style={{
                background: 'hsl(38,92%,50%/0.1)',
                borderColor: 'hsl(38,92%,50%/0.35)',
                color: 'hsl(38,92%,32%)',
              }}
            >
              <div className="flex items-center gap-2.5 text-sm">
                <span className="text-base">⏱</span>
                <span>
                  <strong>Session expiring soon</strong> — you'll be signed out due to inactivity.
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={extendSession}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                  style={{ background: 'hsl(38,92%,50%)' }}
                >
                  Stay signed in
                </button>
                <button
                  onClick={dismissSessionWarning}
                  className="text-xs underline underline-offset-2 opacity-70 hover:opacity-100"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

