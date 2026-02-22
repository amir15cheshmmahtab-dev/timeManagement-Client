import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, FileText, Filter } from 'lucide-react';
import { MOCK_LEAVE_REQUESTS, LEAVE_BALANCE } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

const LEAVE_TYPE_COLORS: Record<string, string> = {
  vacation: 'hsl(var(--status-leave))',
  sick: 'hsl(var(--status-absent))',
  personal: 'hsl(var(--status-wfh))',
  emergency: 'hsl(var(--status-late))',
};

export default function LeaveRequests() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const leaves = user?.role === 'admin'
    ? MOCK_LEAVE_REQUESTS
    : MOCK_LEAVE_REQUESTS.filter(l => l.userId === 'u3');

  const filtered = filter === 'all' ? leaves : leaves.filter(l => l.status === filter);

  const statusIcon = {
    pending: <Clock className="w-4 h-4" style={{ color: 'hsl(var(--status-late))' }} />,
    approved: <CheckCircle className="w-4 h-4" style={{ color: 'hsl(var(--status-present))' }} />,
    rejected: <XCircle className="w-4 h-4" style={{ color: 'hsl(var(--status-absent))' }} />,
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <Calendar className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
            Leave Requests
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and track leave applications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary shadow-purple hover:opacity-90 transition-all"
        >
          + New Request
        </button>
      </div>

      {/* Leave Balance */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Vacation', ...LEAVE_BALANCE.vacation, color: 'hsl(var(--status-leave))' },
          { label: 'Sick', ...LEAVE_BALANCE.sick, color: 'hsl(var(--status-absent))' },
          { label: 'Personal', ...LEAVE_BALANCE.personal, color: 'hsl(var(--status-wfh))' },
        ].map(b => (
          <div key={b.label} className="bg-card rounded-2xl border border-border shadow-card p-5">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-foreground">{b.label}</span>
              <span className="text-2xl font-bold" style={{ color: b.color, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{b.remaining}</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(b.remaining / b.total) * 100}%`, background: b.color }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{b.used} used · {b.total} total</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${filter === f ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Leave list */}
      <div className="space-y-3">
        {filtered.map((req, i) => (
          <motion.div
            key={req.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl border border-border shadow-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: LEAVE_TYPE_COLORS[req.type] + '15' }}>
                  <FileText className="w-4 h-4" style={{ color: LEAVE_TYPE_COLORS[req.type] }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-foreground">{req.userName}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                      style={{ background: LEAVE_TYPE_COLORS[req.type] + '15', color: LEAVE_TYPE_COLORS[req.type] }}>
                      {req.type}
                    </span>
                    <span className="text-xs text-muted-foreground">· {req.department}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {req.startDate} → {req.endDate} · <strong className="text-foreground">{req.days} day{req.days > 1 ? 's' : ''}</strong>
                  </div>
                  <div className="text-xs text-foreground mt-1 italic">"{req.reason}"</div>
                  {req.reviewedBy && (
                    <div className="text-xs text-muted-foreground mt-1">Reviewed by {req.reviewedBy} on {req.reviewedOn}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {statusIcon[req.status]}
                <span className="text-sm font-medium capitalize" style={{
                  color: req.status === 'approved' ? 'hsl(var(--status-present))' :
                         req.status === 'rejected' ? 'hsl(var(--status-absent))' :
                         'hsl(var(--status-late))'
                }}>
                  {req.status}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No leave requests found</p>
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setShowForm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border shadow-purple-lg p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-foreground mb-5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>New Leave Request</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Leave Type</label>
                <select className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option>Vacation</option><option>Sick Leave</option><option>Personal</option><option>Emergency</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">Start Date</label>
                  <input type="date" className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1.5">End Date</label>
                  <input type="date" className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1.5">Reason</label>
                <textarea rows={3} placeholder="Explain your reason..." className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary shadow-purple hover:opacity-90 transition-all">Submit Request</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
