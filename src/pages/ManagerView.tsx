import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, Users, Building2, AlertTriangle } from 'lucide-react';
import { MOCK_LEAVE_REQUESTS, LIVE_ATTENDANCE, MOCK_USERS, MONTHLY_STATS } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/StatCard';

export default function ManagerView() {
  const { user } = useAuth();
  const deptName = user?.department || 'Engineering';
  const [leaveRequests, setLeaveRequests] = useState(
    MOCK_LEAVE_REQUESTS.filter(l => l.department === deptName)
  );

  const deptTeam = MOCK_USERS.filter(u => u.department === deptName && u.id !== user?.id);
  const deptLive = LIVE_ATTENDANCE.filter(l => l.department === deptName);
  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');

  const handleLeave = (id: string, action: 'approved' | 'rejected') => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
  };

  const stats = [
    { title: 'Team Size', value: deptTeam.length + 1, subtitle: `${deptName} department`, icon: Users, iconColor: 'hsl(var(--primary))', iconBg: 'hsl(var(--primary) / 0.1)', delay: 0 },
    { title: 'Present Today', value: deptLive.length, subtitle: 'Currently checked in', icon: CheckCircle, iconColor: 'hsl(var(--status-present))', iconBg: 'hsl(var(--status-present) / 0.1)', delay: 0.05 },
    { title: 'Pending Leaves', value: pendingLeaves.length, subtitle: 'Awaiting your review', icon: Clock, iconColor: 'hsl(var(--status-late))', iconBg: 'hsl(var(--status-late) / 0.1)', delay: 0.1 },
    { title: 'Avg Punctuality', value: '91%', subtitle: 'This month', icon: Building2, iconColor: 'hsl(var(--status-wfh))', iconBg: 'hsl(var(--status-wfh) / 0.1)', delay: 0.15 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {deptName} Team
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manager view — attendance and leave for your department</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team live */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Live Team Status
          </h3>
          <div className="space-y-3">
            {deptTeam.map(member => {
              const live = deptLive.find(l => l.userId === member.id);
              return (
                <div key={member.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {member.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.position}</div>
                  </div>
                  {live ? (
                    <div className="text-right">
                      <div className="text-xs font-medium" style={{ color: 'hsl(var(--status-present))' }}>
                        {live.status === 'wfh' ? '🏠 WFH' : live.status === 'break' ? '⏸ Break' : '● In'}
                      </div>
                      <div className="text-xs text-muted-foreground">{live.duration}</div>
                    </div>
                  ) : (
                    <span className="text-xs" style={{ color: 'hsl(var(--status-absent))' }}>Absent</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending approvals */}
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Leave Approvals
            {pendingLeaves.length > 0 && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full text-white" style={{ background: 'hsl(var(--primary))' }}>
                {pendingLeaves.length} pending
              </span>
            )}
          </h3>
          <div className="space-y-3">
            {leaveRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">No leave requests for your team</div>
            ) : leaveRequests.map(req => (
              <div key={req.id} className="p-4 rounded-xl border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-medium text-foreground">{req.userName}</div>
                    <div className="text-xs text-muted-foreground capitalize">{req.type} · {req.days} day{req.days > 1 ? 's' : ''}</div>
                    <div className="text-xs text-muted-foreground">{req.startDate} → {req.endDate}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {req.status === 'pending' ? (
                      <>
                        <button onClick={() => handleLeave(req.id, 'approved')}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                          style={{ background: 'hsl(var(--status-present) / 0.15)' }}>
                          <CheckCircle className="w-4 h-4" style={{ color: 'hsl(var(--status-present))' }} />
                        </button>
                        <button onClick={() => handleLeave(req.id, 'rejected')}
                          className="w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-all"
                          style={{ background: 'hsl(var(--status-absent) / 0.15)' }}>
                          <XCircle className="w-4 h-4" style={{ color: 'hsl(var(--status-absent))' }} />
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-medium capitalize" style={{
                        color: req.status === 'approved' ? 'hsl(var(--status-present))' : 'hsl(var(--status-absent))'
                      }}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
