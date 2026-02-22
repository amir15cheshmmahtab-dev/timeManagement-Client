import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Plus, Pencil, Trash2, Pin, PinOff,
  Users, Building2, ChevronDown, Search,
  AlertTriangle, CheckCircle, Info, Zap, X,
  Clock, Filter
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MOCK_ANNOUNCEMENTS, MOCK_DEPARTMENTS, Announcement } from '@/data/mockData';

// ─── Types ────────────────────────────────────────────────────────────────────
type AnnouncementType = Announcement['type'];

const TYPE_CONFIG: Record<AnnouncementType, {
  label: string;
  icon: React.ElementType;
  bg: string;
  border: string;
  text: string;
  badge: string;
}> = {
  info: {
    label: 'Info',
    icon: Info,
    bg: 'hsl(var(--primary) / 0.08)',
    border: 'hsl(var(--primary) / 0.25)',
    text: 'hsl(var(--primary))',
    badge: 'hsl(var(--primary) / 0.12)',
  },
  success: {
    label: 'Success',
    icon: CheckCircle,
    bg: 'hsl(var(--status-present) / 0.08)',
    border: 'hsl(var(--status-present) / 0.25)',
    text: 'hsl(var(--status-present))',
    badge: 'hsl(var(--status-present) / 0.12)',
  },
  warning: {
    label: 'Warning',
    icon: AlertTriangle,
    bg: 'hsl(var(--status-late) / 0.08)',
    border: 'hsl(var(--status-late) / 0.25)',
    text: 'hsl(var(--status-late))',
    badge: 'hsl(var(--status-late) / 0.12)',
  },
  urgent: {
    label: 'Urgent',
    icon: Zap,
    bg: 'hsl(var(--status-absent) / 0.08)',
    border: 'hsl(var(--status-absent) / 0.25)',
    text: 'hsl(var(--status-absent))',
    badge: 'hsl(var(--status-absent) / 0.12)',
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = (): Omit<Announcement, 'id' | 'authorId' | 'authorName' | 'authorRole' | 'createdAt'> => ({
  title: '',
  message: '',
  type: 'info',
  audience: 'all',
  pinned: false,
});

// ─── Compose / Edit Modal ─────────────────────────────────────────────────────
interface ComposeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: ReturnType<typeof emptyForm>) => void;
  initial?: ReturnType<typeof emptyForm>;
  departments: string[];
  isAdmin: boolean;
  userDept: string;
}

function ComposeModal({ open, onClose, onSave, initial, departments, isAdmin, userDept }: ComposeModalProps) {
  const [form, setForm] = useState<ReturnType<typeof emptyForm>>(initial ?? emptyForm());

  React.useEffect(() => {
    setForm(initial ?? emptyForm());
  }, [initial, open]);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const valid = form.title.trim().length > 3 && form.message.trim().length > 10;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(0 0% 0% / 0.45)' }}
          onClick={onClose}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-foreground text-sm">
                  {initial ? 'Edit Announcement' : 'New Announcement'}
                </span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Title</label>
                <input
                  className="w-full h-10 px-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ '--tw-ring-color': 'hsl(var(--primary) / 0.4)' } as React.CSSProperties}
                  placeholder="Announcement title…"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  maxLength={120}
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Message</label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all"
                  style={{ '--tw-ring-color': 'hsl(var(--primary) / 0.4)' } as React.CSSProperties}
                  placeholder="Write your announcement here…"
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                />
              </div>

              {/* Type + Audience row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Type</label>
                  <div className="relative">
                    <select
                      className="w-full h-10 pl-3 pr-8 rounded-xl border border-border bg-background text-foreground text-sm appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer"
                      value={form.type}
                      onChange={e => set('type', e.target.value as AnnouncementType)}
                    >
                      {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Audience</label>
                  <div className="relative">
                    <select
                      className="w-full h-10 pl-3 pr-8 rounded-xl border border-border bg-background text-foreground text-sm appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer"
                      value={form.audience}
                      onChange={e => set('audience', e.target.value)}
                      disabled={!isAdmin}
                    >
                      {isAdmin && <option value="all">All Employees</option>}
                      {(isAdmin ? departments : [userDept]).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                  {!isAdmin && (
                    <p className="text-xs text-muted-foreground mt-1">Managers can only post to their department.</p>
                  )}
                </div>
              </div>

              {/* Pin toggle */}
              {isAdmin && (
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div
                    onClick={() => set('pinned', !form.pinned)}
                    className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: form.pinned ? 'hsl(var(--primary))' : 'hsl(var(--muted))' }}
                  >
                    <motion.div
                      animate={{ left: form.pinned ? '22px' : '2px' }}
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                  <span className="text-sm text-foreground font-medium">Pin to top</span>
                </label>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 pb-5">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => { if (valid) { onSave(form); onClose(); } }}
                disabled={!valid}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white gradient-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-purple"
              >
                {initial ? 'Save Changes' : 'Post Announcement'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteModal({ open, onClose, onConfirm, title }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'hsl(0 0% 0% / 0.45)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6 text-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'hsl(var(--status-absent) / 0.12)' }}>
              <Trash2 className="w-6 h-6" style={{ color: 'hsl(var(--status-absent))' }} />
            </div>
            <h3 className="font-bold text-foreground mb-1">Delete Announcement?</h3>
            <p className="text-sm text-muted-foreground mb-5 line-clamp-2">"{title}"</p>
            <div className="flex gap-2 justify-center">
              <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-all">
                Cancel
              </button>
              <button
                onClick={() => { onConfirm(); onClose(); }}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'hsl(var(--status-absent))' }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Announcement Card ────────────────────────────────────────────────────────
interface CardProps {
  ann: Announcement;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  isAdmin: boolean;
  index: number;
}

function AnnouncementCard({ ann, canEdit, canDelete, onEdit, onDelete, onTogglePin, isAdmin, index }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[ann.type];
  const Icon = cfg.icon;
  const isLong = ann.message.length > 200;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 24 }}
      className="group relative rounded-2xl border overflow-hidden transition-shadow hover:shadow-card"
      style={{ borderColor: cfg.border, background: cfg.bg }}
    >
      {/* Pinned ribbon */}
      {ann.pinned && (
        <div className="absolute top-0 right-0 px-2.5 py-1 text-xs font-bold text-white rounded-bl-xl flex items-center gap-1"
          style={{ background: 'hsl(var(--primary))' }}>
          <Pin className="w-3 h-3" /> Pinned
        </div>
      )}

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: cfg.badge }}>
            <Icon className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: cfg.text }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-foreground text-sm leading-snug">{ann.title}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: cfg.badge, color: cfg.text }}>
                {cfg.label}
              </span>
            </div>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {/* Audience */}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                {ann.audience === 'all'
                  ? <><Users className="w-3 h-3" /> All Employees</>
                  : <><Building2 className="w-3 h-3" /> {ann.audience}</>
                }
              </span>
              {/* Author */}
              <span className="text-xs text-muted-foreground">
                by <span className="font-medium text-foreground">{ann.authorName}</span>
              </span>
              {/* Time */}
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(ann.createdAt)}
                {ann.updatedAt && <span className="italic">(edited)</span>}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {isAdmin && (
              <button
                onClick={onTogglePin}
                title={ann.pinned ? 'Unpin' : 'Pin'}
                className="w-7 h-7 rounded-lg hover:bg-background/70 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              >
                {ann.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
              </button>
            )}
            {canEdit && (
              <button
                onClick={onEdit}
                className="w-7 h-7 rounded-lg hover:bg-background/70 flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="w-7 h-7 rounded-lg hover:bg-background/70 flex items-center justify-center transition-colors text-muted-foreground"
                style={{ ['--hover-color' as string]: 'hsl(var(--status-absent))' }}
              >
                <Trash2 className="w-3.5 h-3.5" style={{ color: 'hsl(var(--status-absent))' }} />
              </button>
            )}
          </div>
        </div>

        {/* Message body */}
        <div className="ml-12">
          <p className={`text-sm text-foreground/80 leading-relaxed whitespace-pre-line ${!expanded && isLong ? 'line-clamp-3' : ''}`}>
            {ann.message}
          </p>
          {isLong && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs font-semibold mt-1.5 transition-colors"
              style={{ color: cfg.text }}
            >
              {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NotificationsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'manager';
  const canCreate = isAdmin || isManager;

  const departments = MOCK_DEPARTMENTS.map(d => d.name);

  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<AnnouncementType | 'all'>('all');
  const [filterAudience, setFilterAudience] = useState<'all' | 'mine'>('all');

  const [composing, setComposing] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  // ── Permissions ──────────────────────────────────────────────────────────
  const canEdit = (ann: Announcement) => {
    if (isAdmin) return true;
    if (isManager && ann.authorId === user?.id) return true;
    return false;
  };
  const canDelete = (ann: Announcement) => {
    if (isAdmin) return true;
    if (isManager && ann.authorId === user?.id) return true;
    return false;
  };

  // ── Visibility: employees see only all + their dept ──────────────────────
  const visible = useMemo(() => {
    return announcements.filter(ann => {
      if (isAdmin) return true;
      if (isManager) return ann.audience === 'all' || ann.audience === user?.department;
      // employee
      return ann.audience === 'all' || ann.audience === user?.department;
    });
  }, [announcements, isAdmin, isManager, user]);

  // ── Filters ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = visible;
    if (filterType !== 'all') list = list.filter(a => a.type === filterType);
    if (filterAudience === 'mine' && (isAdmin || isManager))
      list = list.filter(a => a.authorId === user?.id);
    if (search.trim())
      list = list.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.message.toLowerCase().includes(search.toLowerCase())
      );
    // pinned first
    return [...list].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [visible, filterType, filterAudience, search, isAdmin, isManager, user]);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleCreate = (form: ReturnType<typeof emptyForm>) => {
    const ann: Announcement = {
      ...form,
      id: `ann-${Date.now()}`,
      authorId: user!.id,
      authorName: user!.name,
      authorRole: user!.role,
      createdAt: new Date().toISOString(),
    };
    setAnnouncements(prev => [ann, ...prev]);
  };

  const handleEdit = (form: ReturnType<typeof emptyForm>) => {
    setAnnouncements(prev =>
      prev.map(a =>
        a.id === editTarget!.id
          ? { ...a, ...form, updatedAt: new Date().toISOString() }
          : a
      )
    );
    setEditTarget(null);
  };

  const handleDelete = () => {
    setAnnouncements(prev => prev.filter(a => a.id !== deleteTarget!.id));
    setDeleteTarget(null);
  };

  const handleTogglePin = (id: string) => {
    setAnnouncements(prev =>
      prev.map(a => a.id === id ? { ...a, pinned: !a.pinned } : a)
    );
  };

  const pinnedCount = filtered.filter(a => a.pinned).length;
  const totalVisible = visible.length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-8">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Announcements
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {totalVisible} announcement{totalVisible !== 1 ? 's' : ''}
            {pinnedCount > 0 && ` · ${pinnedCount} pinned`}
            {!isAdmin && ` · ${user?.department} + Company-wide`}
          </p>
        </div>

        {canCreate && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setComposing(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary shadow-purple hover:shadow-purple-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            New Announcement
          </motion.button>
        )}
      </motion.div>

      {/* ── Role banner ── */}
      {!canCreate && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 px-4 py-3 rounded-xl border"
          style={{
            background: 'hsl(var(--primary) / 0.06)',
            borderColor: 'hsl(var(--primary) / 0.2)',
          }}
        >
          <Bell className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
          <p className="text-sm text-foreground/80">
            You're viewing announcements relevant to you and your department — <strong>{user?.department}</strong>.
          </p>
        </motion.div>
      )}

      {/* ── Filters toolbar ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="flex items-center gap-2 flex-wrap"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all"
            placeholder="Search announcements…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <select
            className="h-9 pl-8 pr-8 rounded-xl border border-border bg-card text-sm text-foreground appearance-none focus:outline-none focus:ring-2 transition-all cursor-pointer"
            value={filterType}
            onChange={e => setFilterType(e.target.value as typeof filterType)}
          >
            <option value="all">All types</option>
            {Object.entries(TYPE_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Mine filter for admin/manager */}
        {canCreate && (
          <button
            onClick={() => setFilterAudience(p => p === 'mine' ? 'all' : 'mine')}
            className="h-9 px-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5"
            style={
              filterAudience === 'mine'
                ? { background: 'hsl(var(--primary) / 0.12)', borderColor: 'hsl(var(--primary) / 0.4)', color: 'hsl(var(--primary))' }
                : { borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--card))' }
            }
          >
            <Users className="w-3.5 h-3.5" />
            My posts
          </button>
        )}
      </motion.div>

      {/* ── Cards list ── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <Bell className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No announcements found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {search ? 'Try a different search term.' : 'Nothing posted yet.'}
              </p>
            </motion.div>
          ) : (
            filtered.map((ann, i) => (
              <AnnouncementCard
                key={ann.id}
                ann={ann}
                index={i}
                canEdit={canEdit(ann)}
                canDelete={canDelete(ann)}
                isAdmin={isAdmin}
                onEdit={() => setEditTarget(ann)}
                onDelete={() => setDeleteTarget(ann)}
                onTogglePin={() => handleTogglePin(ann.id)}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── Compose Modal ── */}
      <ComposeModal
        open={composing}
        onClose={() => setComposing(false)}
        onSave={handleCreate}
        departments={departments}
        isAdmin={isAdmin}
        userDept={user?.department ?? ''}
      />

      {/* ── Edit Modal ── */}
      <ComposeModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEdit}
        initial={editTarget ? {
          title: editTarget.title,
          message: editTarget.message,
          type: editTarget.type,
          audience: editTarget.audience,
          pinned: editTarget.pinned,
        } : undefined}
        departments={departments}
        isAdmin={isAdmin}
        userDept={user?.department ?? ''}
      />

      {/* ── Delete Modal ── */}
      <DeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={deleteTarget?.title ?? ''}
      />
    </div>
  );
}
