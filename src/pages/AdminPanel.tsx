import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MoreVertical, CheckCircle, XCircle, Clock,
  Wifi, Building2, Users, UserCheck, UserX, Edit3, Trash2,
  ChevronDown, Shield, MapPin, Navigation, ShieldCheck, ShieldAlert,
  ToggleLeft, ToggleRight, Plus, Radio
} from 'lucide-react';
import { MOCK_USERS, LIVE_ATTENDANCE, MOCK_LEAVE_REQUESTS, MOCK_DEPARTMENTS, AUDIT_LOG, GEOFENCE_ZONES, GeofenceZone } from '@/data/mockData';

type AdminTab = 'live' | 'employees' | 'leave' | 'geofence' | 'audit';

const STATUS_PILL: Record<string, { label: string; style: React.CSSProperties }> = {
  in: { label: '● In Office', style: { background: 'hsl(var(--status-present) / 0.12)', color: 'hsl(var(--status-present))', border: '1px solid hsl(var(--status-present) / 0.25)' } },
  break: { label: '⏸ On Break', style: { background: 'hsl(var(--status-late) / 0.12)', color: 'hsl(var(--status-late))', border: '1px solid hsl(var(--status-late) / 0.25)' } },
  wfh: { label: '🏠 WFH', style: { background: 'hsl(var(--status-wfh) / 0.12)', color: 'hsl(var(--status-wfh))', border: '1px solid hsl(var(--status-wfh) / 0.25)' } },
};

const LEAVE_STATUS_PILL: Record<string, React.CSSProperties> = {
  pending: { background: 'hsl(var(--status-late) / 0.12)', color: 'hsl(var(--status-late))', border: '1px solid hsl(var(--status-late) / 0.25)' },
  approved: { background: 'hsl(var(--status-present) / 0.12)', color: 'hsl(var(--status-present))', border: '1px solid hsl(var(--status-present) / 0.25)' },
  rejected: { background: 'hsl(var(--status-absent) / 0.12)', color: 'hsl(var(--status-absent))', border: '1px solid hsl(var(--status-absent) / 0.25)' },
};

export default function AdminPanel() {
  const [tab, setTab] = useState<AdminTab>('live');
  const [search, setSearch] = useState('');
  const [leaveRequests, setLeaveRequests] = useState(MOCK_LEAVE_REQUESTS);
  const [deptFilter, setDeptFilter] = useState('all');
  const [zones, setZones] = useState<GeofenceZone[]>(GEOFENCE_ZONES);
  const [showAddZone, setShowAddZone] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneAddress, setNewZoneAddress] = useState('');
  const [newZoneRadius, setNewZoneRadius] = useState(100);

  const tabs: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'live', label: 'Live Board', count: LIVE_ATTENDANCE.length },
    { id: 'employees', label: 'Employees', count: MOCK_USERS.length },
    { id: 'leave', label: 'Leave Requests', count: leaveRequests.filter(l => l.status === 'pending').length },
    { id: 'geofence', label: 'Geofencing' },
    { id: 'audit', label: 'Audit Log' },
  ];

  const filteredUsers = MOCK_USERS.filter(u =>
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.department.toLowerCase().includes(search.toLowerCase())) &&
    (deptFilter === 'all' || u.department === deptFilter)
  );

  const handleLeave = (id: string, action: 'approved' | 'rejected') => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, status: action, reviewedBy: 'Sarah Johnson', reviewedOn: '2026-02-18' } : l));
  };

  const departments = ['all', ...Array.from(new Set(MOCK_USERS.map(u => u.department)))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <Shield className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage attendance, employees, and leave requests</p>
        </div>

        {/* Dept overview */}
        <div className="hidden lg:flex items-center gap-3">
          {MOCK_DEPARTMENTS.slice(0, 3).map(dept => (
            <div key={dept.id} className="bg-card rounded-xl border border-border px-4 py-2 text-center shadow-card">
              <div className="text-lg font-bold text-foreground">{dept.presentToday}<span className="text-muted-foreground text-sm">/{dept.headcount}</span></div>
              <div className="text-xs text-muted-foreground">{dept.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t.id ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'text-white' : 'bg-muted-foreground/20 text-muted-foreground'}`}
                style={tab === t.id ? { background: 'hsl(var(--primary))' } : {}}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LIVE BOARD */}
      {tab === 'live' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--status-present))' }} />
            <span className="text-sm font-medium text-foreground">Live — {LIVE_ATTENDANCE.length} employees checked in</span>
            <span className="text-xs text-muted-foreground">· Updated just now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {LIVE_ATTENDANCE.map((emp, i) => (
              <motion.div
                key={emp.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border shadow-card p-4 hover:shadow-purple transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                      {emp.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-foreground">{emp.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />{emp.department}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={STATUS_PILL[emp.status].style}>
                    {STATUS_PILL[emp.status].label}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Check In</div>
                    <div className="text-sm font-semibold text-foreground">{emp.checkIn}</div>
                  </div>
                  <div className="flex-1 h-px bg-border" />
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground">Duration</div>
                    <div className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>{emp.duration}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {emp.geofenceVerified ? (
                      <ShieldCheck className="w-4 h-4" style={{ color: 'hsl(var(--status-present))' }} />
                    ) : emp.status === 'wfh' ? (
                      <Wifi className="w-4 h-4" style={{ color: 'hsl(var(--status-wfh))' }} />
                    ) : (
                      <ShieldAlert className="w-4 h-4" style={{ color: 'hsl(var(--status-late))' }} />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Absent today */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-sm text-foreground mb-3">Not Checked In Today</h3>
            <div className="flex flex-wrap gap-2">
              {MOCK_USERS.filter(u => !LIVE_ATTENDANCE.find(l => l.userId === u.id) && u.status === 'active').map(u => (
                <div key={u.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ background: 'hsl(var(--status-absent))' }}>
                    {u.avatar[0]}
                  </div>
                  <span className="text-xs text-foreground">{u.name}</span>
                  <span className="text-xs text-muted-foreground">· {u.department}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* EMPLOYEES */}
      {tab === 'employees' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search employees..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {departments.map(d => <option key={d} value={d}>{d === 'all' ? 'All Departments' : d}</option>)}
            </select>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary shadow-purple">
              + Add Employee
            </button>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Employee', 'Department', 'Position', 'Role', 'Status', ''].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u, i) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                          {u.avatar}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{u.department}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{u.position}</td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-medium px-2 py-1 rounded-full capitalize"
                        style={{
                          background: u.role === 'admin' ? 'hsl(263 70% 50% / 0.1)' : u.role === 'manager' ? 'hsl(199 89% 48% / 0.1)' : 'hsl(142 71% 45% / 0.1)',
                          color: u.role === 'admin' ? 'hsl(263, 70%, 50%)' : u.role === 'manager' ? 'hsl(199, 89%, 48%)' : 'hsl(142, 71%, 45%)',
                        }}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${u.status === 'active' ? 'status-present' : 'status-absent'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* LEAVE REQUESTS */}
      {tab === 'leave' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {leaveRequests.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl border border-border shadow-card p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {req.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-foreground">{req.userName}</span>
                      <span className="text-xs text-muted-foreground">· {req.department}</span>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full capitalize border"
                        style={{
                          background: 'hsl(var(--primary) / 0.1)',
                          color: 'hsl(var(--primary))',
                          borderColor: 'hsl(var(--primary) / 0.2)'
                        }}>
                        {req.type}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{req.startDate} → {req.endDate} · {req.days} day{req.days > 1 ? 's' : ''}</div>
                    <div className="text-xs text-foreground mt-1 italic">"{req.reason}"</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Requested {req.requestedOn}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs font-medium px-3 py-1 rounded-full border capitalize"
                    style={LEAVE_STATUS_PILL[req.status]}>
                    {req.status}
                  </span>
                  {req.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleLeave(req.id, 'approved')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:opacity-90"
                        style={{ background: 'hsl(var(--status-present))' }}
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => handleLeave(req.id, 'rejected')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-90 border"
                        style={{ color: 'hsl(var(--status-absent))', borderColor: 'hsl(var(--status-absent) / 0.3)', background: 'hsl(var(--status-absent) / 0.08)' }}
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    </>
                  )}
                  {req.reviewedBy && (
                    <span className="text-xs text-muted-foreground">by {req.reviewedBy}</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* GEOFENCING */}
      {tab === 'geofence' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

          {/* Header + legend */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Define office zones. Employees outside these zones get flagged on check-in.</p>
            </div>
            <button
              onClick={() => setShowAddZone(!showAddZone)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary shadow-purple self-start"
            >
              <Plus className="w-4 h-4" /> Add Zone
            </button>
          </div>

          {/* Add zone form */}
          <AnimatePresence>
            {showAddZone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card rounded-2xl border border-border shadow-card p-5 space-y-4">
                  <h4 className="font-semibold text-sm text-foreground">New Geofence Zone</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Zone Name</label>
                      <input
                        value={newZoneName}
                        onChange={e => setNewZoneName(e.target.value)}
                        placeholder="e.g., Branch Office - NYC"
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Address</label>
                      <input
                        value={newZoneAddress}
                        onChange={e => setNewZoneAddress(e.target.value)}
                        placeholder="Full address or landmark"
                        className="w-full px-3 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-2 block">
                      Radius: <span style={{ color: 'hsl(var(--primary))' }}>{newZoneRadius}m</span>
                    </label>
                    <input
                      type="range" min={50} max={500} step={10}
                      value={newZoneRadius}
                      onChange={e => setNewZoneRadius(Number(e.target.value))}
                      className="w-full accent-primary"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>50m (tight)</span><span>500m (broad)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!newZoneName || !newZoneAddress) return;
                        setZones(prev => [...prev, {
                          id: `gz${prev.length + 1}`,
                          name: newZoneName,
                          address: newZoneAddress,
                          lat: 37.7749 + Math.random() * 0.01,
                          lng: -122.4194 + Math.random() * 0.01,
                          radius: newZoneRadius,
                          active: true,
                        }]);
                        setNewZoneName(''); setNewZoneAddress(''); setNewZoneRadius(100);
                        setShowAddZone(false);
                      }}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-white gradient-primary"
                    >
                      Save Zone
                    </button>
                    <button
                      onClick={() => setShowAddZone(false)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold border border-border text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zone cards */}
          <div className="space-y-3">
            {zones.map((zone, i) => (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-card rounded-2xl border border-border shadow-card p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: zone.active ? 'hsl(var(--status-present)/0.12)' : 'hsl(var(--border))' }}>
                      <Radio className="w-5 h-5" style={{ color: zone.active ? 'hsl(var(--status-present))' : 'hsl(var(--muted-foreground))' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{zone.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full border font-medium"
                          style={zone.active
                            ? { background: 'hsl(var(--status-present)/0.1)', color: 'hsl(var(--status-present))', borderColor: 'hsl(var(--status-present)/0.25)' }
                            : { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' }}>
                          {zone.active ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" /> {zone.address}
                      </div>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Radius: <span className="font-semibold text-foreground">{zone.radius}m</span>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Coords: <span className="font-semibold text-foreground">{zone.lat.toFixed(4)}, {zone.lng.toFixed(4)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Toggle active */}
                    <button
                      onClick={() => setZones(prev => prev.map(z => z.id === zone.id ? { ...z, active: !z.active } : z))}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
                      style={zone.active
                        ? { color: 'hsl(var(--status-present))', borderColor: 'hsl(var(--status-present)/0.3)', background: 'hsl(var(--status-present)/0.08)' }
                        : { color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))', background: 'hsl(var(--muted))' }}
                    >
                      {zone.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {zone.active ? 'Enabled' : 'Disabled'}
                    </button>
                    <button
                      onClick={() => setZones(prev => prev.filter(z => z.id !== zone.id))}
                      className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live geofence verification summary */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
              Today's Check-in Verification
            </h3>
            <div className="space-y-2">
              {LIVE_ATTENDANCE.map((emp, i) => (
                <motion.div key={emp.userId} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{emp.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{emp.department}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{emp.checkIn}</span>
                  <div className="flex items-center gap-1.5">
                    {emp.geofenceVerified ? (
                      <>
                        <ShieldCheck className="w-4 h-4" style={{ color: 'hsl(var(--status-present))' }} />
                        <span className="text-xs font-semibold" style={{ color: 'hsl(var(--status-present))' }}>Verified</span>
                      </>
                    ) : emp.status === 'wfh' ? (
                      <>
                        <Wifi className="w-4 h-4" style={{ color: 'hsl(var(--status-wfh))' }} />
                        <span className="text-xs font-semibold" style={{ color: 'hsl(var(--status-wfh))' }}>WFH</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" style={{ color: 'hsl(var(--status-late))' }} />
                        <span className="text-xs font-semibold" style={{ color: 'hsl(var(--status-late))' }}>Outside Zone</span>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border flex gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: 'hsl(var(--status-present))' }} />
                <span className="text-muted-foreground">{LIVE_ATTENDANCE.filter(e => e.geofenceVerified).length} Verified</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" style={{ color: 'hsl(var(--status-late))' }} />
                <span className="text-muted-foreground">{LIVE_ATTENDANCE.filter(e => !e.geofenceVerified && e.status !== 'wfh').length} Outside zone</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Wifi className="w-3.5 h-3.5" style={{ color: 'hsl(var(--status-wfh))' }} />
                <span className="text-muted-foreground">{LIVE_ATTENDANCE.filter(e => e.status === 'wfh').length} WFH</span>
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* AUDIT LOG */}
      {tab === 'audit' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-semibold text-foreground">System Audit Log</h3>
              <p className="text-xs text-muted-foreground mt-0.5">All administrative actions and changes</p>
            </div>
            <div className="divide-y divide-border">
              {AUDIT_LOG.map((log, i) => (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 hover:bg-muted/40 transition-colors">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{
                    background: log.type === 'leave' ? 'hsl(var(--primary) / 0.1)' :
                      log.type === 'attendance' ? 'hsl(var(--status-wfh) / 0.1)' :
                        'hsl(var(--status-present) / 0.1)'
                  }}>
                    <Shield className="w-4 h-4" style={{
                      color: log.type === 'leave' ? 'hsl(var(--primary))' :
                        log.type === 'attendance' ? 'hsl(var(--status-wfh))' : 'hsl(var(--status-present))'
                    }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                      <span className="font-medium text-sm text-foreground">{log.user}</span>
                      <span className="text-sm text-muted-foreground">{log.action}</span>
                      <span className="text-sm font-medium" style={{ color: 'hsl(var(--primary))' }}>{log.target}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">{log.time}</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full border capitalize text-muted-foreground border-border">
                    {log.type}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
