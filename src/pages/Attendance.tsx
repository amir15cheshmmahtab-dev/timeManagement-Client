import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle2, Coffee, Wifi, MapPin, FileText,
  Play, LogOut, AlarmClock, ChevronDown, ChevronUp,
  Navigation, ShieldCheck, ShieldAlert, History
} from 'lucide-react';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { generateAttendanceData, MONTHLY_STATS } from '@/data/mockData';

type CheckState = 'out' | 'in' | 'break';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const h = time.getHours() % 12 || 12;
  const m = time.getMinutes().toString().padStart(2, '0');
  const s = time.getSeconds().toString().padStart(2, '0');
  const ampm = time.getHours() >= 12 ? 'PM' : 'AM';
  return (
    <div className="flex items-baseline gap-1 justify-center">
      <span className="text-5xl font-bold text-white tabular-nums tracking-tight">
        {h.toString().padStart(2, '0')}:{m}
      </span>
      <span className="text-white/60 text-base font-medium">{s}</span>
      <span className="text-white/60 text-base font-medium ml-1">{ampm}</span>
    </div>
  );
}

function SessionTimer({ running, initialSeconds }: { running: boolean; initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const ref = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      if (ref.current) clearInterval(ref.current);
    }
    return () => { if (ref.current) clearInterval(ref.current); };
  }, [running]);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <span className="tabular-nums font-bold text-xl text-white">
      {h}h {m.toString().padStart(2, '0')}m {s.toString().padStart(2, '0')}s
    </span>
  );
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
};

const TIMELINE = [
  { time: '08:47 AM', event: 'Checked In', detail: 'Office · Floor 3', icon: CheckCircle2, color: 'hsl(var(--status-present))' },
  { time: '10:30 AM', event: 'Break Started', detail: 'Coffee break', icon: Coffee, color: 'hsl(var(--status-late))' },
  { time: '10:45 AM', event: 'Resumed Work', detail: 'Back at desk', icon: Play, color: 'hsl(var(--status-present))' },
  { time: '12:00 PM', event: 'Lunch Break', detail: '1h scheduled', icon: Coffee, color: 'hsl(var(--status-late))' },
  { time: '01:00 PM', event: 'Resumed Work', detail: 'Back from lunch', icon: Play, color: 'hsl(var(--status-present))' },
];

export default function Attendance() {
  const { user } = useAuth();
  const [checkState, setCheckState] = useState<CheckState>('in');
  const [wfhMode, setWfhMode] = useState(false);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showTimeline, setShowTimeline] = useState(true);
  const [geofenceStatus, setGeofenceStatus] = useState<'checking' | 'verified' | 'outside' | 'idle'>('verified');
  const checkInTime = '08:47 AM';

  const records = generateAttendanceData(user?.id || 'u3');
  const presentCount = records.filter(r => r.status === 'present' || r.status === 'wfh').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const totalHours = records.reduce((a, r) => a + (r.workHours || 0), 0);

  const handleCheckIn = () => {
    setGeofenceStatus('checking');
    setTimeout(() => {
      setGeofenceStatus(wfhMode ? 'outside' : 'verified');
      setCheckState('in');
    }, 1800);
  };

  const handleCheckOut = () => {
    setCheckState('out');
    setGeofenceStatus('idle');
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <Clock className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
            Attendance
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your check-ins, breaks, and working hours</p>
        </div>
        {/* Live status badge */}
        {checkState === 'in' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm"
            style={{ borderColor: 'hsl(var(--status-present)/0.35)', color: 'hsl(var(--status-present))', background: 'hsl(var(--status-present)/0.08)' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--status-present))' }} />
            Session Active · {checkInTime}
          </motion.div>
        )}
        {checkState === 'break' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full border font-semibold text-sm"
            style={{ borderColor: 'hsl(var(--status-late)/0.35)', color: 'hsl(var(--status-late))', background: 'hsl(var(--status-late)/0.08)' }}
          >
            <Coffee className="w-4 h-4" /> On Break
          </motion.div>
        )}
      </motion.div>

      {/* Top summary chips */}
      <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Days Present', value: presentCount, color: 'hsl(var(--status-present))', bg: 'hsl(var(--status-present)/0.1)' },
          { label: 'Days Late', value: lateCount, color: 'hsl(var(--status-late))', bg: 'hsl(var(--status-late)/0.1)' },
          { label: 'Days Absent', value: absentCount, color: 'hsl(var(--status-absent))', bg: 'hsl(var(--status-absent)/0.1)' },
          { label: 'Total Hours', value: `${totalHours.toFixed(0)}h`, color: 'hsl(var(--primary))', bg: 'hsl(var(--primary)/0.1)' },
        ].map(chip => (
          <div key={chip.label} className="bg-card rounded-2xl border border-border shadow-card p-4 text-center">
            <div className="text-2xl font-bold mb-1" style={{ color: chip.color }}>{chip.value}</div>
            <div className="text-xs text-muted-foreground font-medium">{chip.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT — Check-in widget */}
        <div className="xl:col-span-1 space-y-4">

          {/* Clock + Check In/Out */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="gradient-hero p-6 pb-8 relative overflow-hidden text-center">
              <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-10" style={{ background: 'white', filter: 'blur(40px)' }} />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10" style={{ background: 'white', filter: 'blur(25px)' }} />
              <div className="relative z-10">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">
                  {wfhMode ? '🏠 Work from Home' : '🏢 HQ · Floor 3 · SF'}
                </p>
                <LiveClock />
                <div className="mt-4 flex items-center justify-center gap-2">
                  <span className="text-white/60 text-sm">Session</span>
                  <SessionTimer running={checkState === 'in'} initialSeconds={47 * 60 + 33} />
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4">

              {/* Geofence status */}
              <AnimatePresence mode="wait">
                {checkState === 'in' && (
                  <motion.div
                    key={geofenceStatus}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                      style={{
                        background: geofenceStatus === 'verified' ? 'hsl(var(--status-present)/0.1)' : 'hsl(var(--status-late)/0.1)',
                        border: `1px solid ${geofenceStatus === 'verified' ? 'hsl(var(--status-present)/0.25)' : 'hsl(var(--status-late)/0.25)'}`,
                      }}>
                      {geofenceStatus === 'verified'
                        ? <ShieldCheck className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--status-present))' }} />
                        : <ShieldAlert className="w-4 h-4 flex-shrink-0" style={{ color: 'hsl(var(--status-late))' }} />
                      }
                      <div className="flex-1">
                        <div className="text-xs font-semibold" style={{ color: geofenceStatus === 'verified' ? 'hsl(var(--status-present))' : 'hsl(var(--status-late))' }}>
                          {geofenceStatus === 'verified' ? 'Location Verified · HQ Main Office' : 'Outside Office Zone · WFH mode'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {geofenceStatus === 'verified' ? '~18m from check-in point' : 'Geofence radius: 150m'}
                        </div>
                      </div>
                      <Navigation className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* WFH Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4" style={{ color: 'hsl(var(--status-wfh))' }} />
                  <div>
                    <span className="text-sm font-semibold text-foreground">Work from Home</span>
                    <div className="text-xs text-muted-foreground">Bypass geofence check</div>
                  </div>
                </div>
                <button
                  onClick={() => setWfhMode(!wfhMode)}
                  className="w-11 h-6 rounded-full relative transition-all duration-300 focus:outline-none flex-shrink-0"
                  style={{ background: wfhMode ? 'hsl(var(--primary))' : 'hsl(var(--border))' }}
                >
                  <motion.div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
                    animate={{ left: wfhMode ? '1.25rem' : '0.125rem' }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  />
                </button>
              </div>

              {/* Check In/Out times */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl text-center" style={{ background: 'hsl(var(--status-present)/0.1)', border: '1px solid hsl(var(--status-present)/0.25)' }}>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Check In</p>
                  <p className="text-base font-bold" style={{ color: 'hsl(var(--status-present))' }}>08:47 AM</p>
                </div>
                <div className="p-3 rounded-xl text-center border border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">Check Out</p>
                  <p className="text-base font-bold text-muted-foreground">{checkState === 'out' ? '05:00 PM' : '—'}</p>
                </div>
              </div>

              {/* Notes toggle */}
              <AnimatePresence>
                {showNotes ? (
                  <motion.div key="notes" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Add a note for today (e.g., Sprint planning, client meeting)..."
                      className="w-full text-sm border border-input rounded-xl p-3 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      rows={2}
                      autoFocus
                    />
                  </motion.div>
                ) : (
                  <button onClick={() => setShowNotes(true)} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Add a note to this check-in
                  </button>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setCheckState(checkState === 'break' ? 'in' : 'break')}
                  disabled={checkState === 'out'}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-all disabled:opacity-40"
                  style={{ color: checkState === 'break' ? 'hsl(var(--status-present))' : 'hsl(var(--status-late))' }}
                >
                  {checkState === 'break' ? <Play className="w-4 h-4" /> : <Coffee className="w-4 h-4" />}
                  {checkState === 'break' ? 'Resume' : 'Break'}
                </motion.button>

                {geofenceStatus === 'checking' ? (
                  <div className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white gradient-primary animate-pulse">
                    <Navigation className="w-4 h-4 animate-spin" /> Locating…
                  </div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={checkState === 'out' ? handleCheckIn : handleCheckOut}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white transition-all shadow-sm"
                    style={{ background: checkState !== 'out' ? 'hsl(var(--destructive))' : 'hsl(var(--status-present))' }}
                  >
                    {checkState !== 'out'
                      ? <><LogOut className="w-4 h-4" /> Check Out</>
                      : <><CheckCircle2 className="w-4 h-4" /> Check In</>
                    }
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Punctuality Ring */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-bold text-sm text-foreground mb-4 flex items-center gap-2">
              <AlarmClock className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
              This Month's Punctuality
            </h3>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
                  <motion.circle
                    cx="40" cy="40" r="32" fill="none" strokeWidth="7"
                    stroke="hsl(var(--primary))"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 32}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - MONTHLY_STATS.punctualityScore / 100) }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-foreground">{MONTHLY_STATS.punctualityScore}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                {[
                  { label: 'On-time streak', value: `${MONTHLY_STATS.onTimeStreak} days 🔥` },
                  { label: 'Late arrivals', value: `${MONTHLY_STATS.lateDays} this month` },
                  { label: 'Avg check-in', value: '08:51 AM' },
                ].map(r => (
                  <div key={r.label}>
                    <div className="text-xs text-muted-foreground">{r.label}</div>
                    <div className="text-xs font-semibold text-foreground">{r.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — Calendar + Timeline */}
        <div className="xl:col-span-2 space-y-4">

          {/* Attendance Calendar */}
          <motion.div variants={item}>
            <AttendanceCalendar />
          </motion.div>

          {/* Today's Timeline */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <button
              onClick={() => setShowTimeline(!showTimeline)}
              className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                <span className="font-bold text-sm text-foreground">Today's Timeline</span>
                <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: 'hsl(var(--primary))' }}>
                  {TIMELINE.length} events
                </span>
              </div>
              {showTimeline ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>
            <AnimatePresence>
              {showTimeline && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden border-t border-border"
                >
                  <div className="p-5 space-y-0">
                    {TIMELINE.map((ev, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-start gap-4 relative"
                      >
                        {/* Vertical line */}
                        {i < TIMELINE.length - 1 && (
                          <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border" />
                        )}
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 border-2 border-card"
                          style={{ background: ev.color + '20', border: `2px solid ${ev.color}40` }}>
                          <ev.icon className="w-4 h-4" style={{ color: ev.color }} />
                        </div>
                        <div className="pb-5 flex-1">
                          <div className="font-semibold text-sm text-foreground">{ev.event}</div>
                          <div className="text-xs text-muted-foreground">{ev.detail}</div>
                        </div>
                        <div className="text-xs text-muted-foreground font-medium flex-shrink-0 mt-1">{ev.time}</div>
                      </motion.div>
                    ))}
                    {/* Current state */}
                    {checkState !== 'out' && (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'hsl(var(--primary)/0.12)', border: '2px dashed hsl(var(--primary)/0.4)' }}>
                          <Clock className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                            {checkState === 'break' ? 'Currently on break…' : 'Working…'}
                          </div>
                          <div className="text-xs text-muted-foreground">Session ongoing</div>
                        </div>
                        <div className="ml-auto">
                          <span className="w-2 h-2 rounded-full inline-block animate-pulse" style={{ background: 'hsl(var(--primary))' }} />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Recent Attendance History */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card p-5">
            <h3 className="font-bold text-sm text-foreground mb-4">Recent Attendance History</h3>
            <div className="space-y-2">
              {records.slice(-7).reverse().map((rec, i) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{
                    background:
                      rec.status === 'present' ? 'hsl(var(--status-present))' :
                      rec.status === 'late' ? 'hsl(var(--status-late))' :
                      rec.status === 'wfh' ? 'hsl(var(--status-wfh))' :
                      'hsl(var(--status-absent))'
                  }} />
                  <span className="text-sm font-medium text-foreground flex-1">{new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span className="text-xs text-muted-foreground">{rec.checkIn || '—'} → {rec.checkOut || '—'}</span>
                  <span className="text-xs font-semibold">{rec.workHours ? `${rec.workHours}h` : '—'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium" style={{
                    background: rec.status === 'present' ? 'hsl(var(--status-present)/0.12)' :
                      rec.status === 'late' ? 'hsl(var(--status-late)/0.12)' :
                      rec.status === 'wfh' ? 'hsl(var(--status-wfh)/0.12)' : 'hsl(var(--status-absent)/0.12)',
                    color: rec.status === 'present' ? 'hsl(var(--status-present))' :
                      rec.status === 'late' ? 'hsl(var(--status-late))' :
                      rec.status === 'wfh' ? 'hsl(var(--status-wfh))' : 'hsl(var(--status-absent))',
                  }}>
                    {rec.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
