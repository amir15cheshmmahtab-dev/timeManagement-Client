import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, CheckCircle2, XCircle, Wifi, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

type DayStatus = 'present' | 'absent' | 'late' | 'wfh' | 'leave' | 'holiday' | 'weekend' | 'future' | 'empty';

interface CalendarDay {
  day: number;
  status: DayStatus;
  checkIn?: string;
  checkOut?: string;
  hours?: number;
  note?: string;
  overtime?: number;
}

const statusConfig: Record<DayStatus, { label: string; bg: string; text: string; border: string }> = {
  present: { label: 'Present', bg: 'hsl(var(--status-present) / 0.15)', text: 'hsl(var(--status-present))', border: 'hsl(var(--status-present) / 0.35)' },
  absent:  { label: 'Absent',  bg: 'hsl(var(--status-absent) / 0.15)',  text: 'hsl(var(--status-absent))',  border: 'hsl(var(--status-absent) / 0.35)' },
  late:    { label: 'Late',    bg: 'hsl(var(--status-late) / 0.15)',    text: 'hsl(var(--status-late))',    border: 'hsl(var(--status-late) / 0.35)' },
  wfh:     { label: 'WFH',     bg: 'hsl(var(--status-wfh) / 0.15)',     text: 'hsl(var(--status-wfh))',     border: 'hsl(var(--status-wfh) / 0.35)' },
  leave:   { label: 'Leave',   bg: 'hsl(var(--status-leave) / 0.15)',   text: 'hsl(var(--status-leave))',   border: 'hsl(var(--status-leave) / 0.35)' },
  holiday: { label: 'Holiday', bg: 'hsl(var(--status-holiday) / 0.15)', text: 'hsl(var(--status-holiday))', border: 'hsl(var(--status-holiday) / 0.35)' },
  weekend: { label: 'Weekend', bg: 'transparent', text: 'hsl(var(--muted-foreground))', border: 'transparent' },
  future:  { label: '',        bg: 'hsl(var(--muted) / 0.4)',           text: 'hsl(var(--muted-foreground))', border: 'transparent' },
  empty:   { label: '',        bg: 'transparent',                        text: 'transparent',                  border: 'transparent' },
};

const calendarData: Record<number, CalendarDay> = {
  2:  { day: 2,  status: 'present', checkIn: '08:52', checkOut: '17:30', hours: 7.8 },
  3:  { day: 3,  status: 'present', checkIn: '08:45', checkOut: '17:45', hours: 8.5, overtime: 0.5 },
  4:  { day: 4,  status: 'late',    checkIn: '09:22', checkOut: '18:00', hours: 7.9, note: 'Traffic delay' },
  5:  { day: 5,  status: 'present', checkIn: '08:48', checkOut: '17:30', hours: 7.7 },
  6:  { day: 6,  status: 'wfh',     checkIn: '09:00', checkOut: '17:30', hours: 7.5, note: 'Working from home' },
  9:  { day: 9,  status: 'present', checkIn: '08:55', checkOut: '17:30', hours: 7.6 },
  10: { day: 10, status: 'present', checkIn: '08:40', checkOut: '18:30', hours: 9.2, overtime: 1.2 },
  11: { day: 11, status: 'absent',  hours: 0, note: 'Unplanned absence' },
  12: { day: 12, status: 'wfh',     checkIn: '09:00', checkOut: '17:30', hours: 7.5, note: 'WFH day' },
  13: { day: 13, status: 'present', checkIn: '08:50', checkOut: '17:30', hours: 7.7 },
  16: { day: 16, status: 'late',    checkIn: '09:18', checkOut: '17:30', hours: 7.2, note: 'Doctor appointment' },
  17: { day: 17, status: 'present', checkIn: '08:45', checkOut: '17:30', hours: 7.8 },
  18: { day: 18, status: 'present', checkIn: '08:47', hours: undefined, note: 'Currently active' },
};

function buildCalendar(): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let d = 1; d <= 28; d++) {
    const dow = new Date(2026, 1, d).getDay();
    if (dow === 0 || dow === 6) {
      days.push({ day: d, status: 'weekend' });
    } else if (d > 18) {
      days.push({ day: d, status: 'future' });
    } else {
      days.push(calendarData[d] || { day: d, status: 'present', checkIn: '08:52', checkOut: '17:30', hours: 7.8 });
    }
  }
  return days;
}

interface DayDetailModalProps {
  day: CalendarDay;
  onClose: () => void;
}

function DayDetailModal({ day, onClose }: DayDetailModalProps) {
  const cfg = statusConfig[day.status];
  const weekday = new Date(2026, 1, day.day).toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'hsl(var(--foreground) / 0.2)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 16 }}
          transition={{ type: 'spring', damping: 22, stiffness: 350 }}
          className="bg-card rounded-2xl shadow-xl border border-border w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 relative" style={{ background: cfg.bg, borderBottom: `1px solid ${cfg.border}` }}>
            <button onClick={onClose} className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors">
              <X className="w-4 h-4" style={{ color: cfg.text }} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: cfg.text + '22', border: `1px solid ${cfg.border}` }}>
                <Calendar className="w-6 h-6" style={{ color: cfg.text }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: cfg.text }}>{weekday}</p>
                <p className="text-2xl font-bold text-foreground leading-none mt-0.5">Feb {day.day}, 2026</p>
              </div>
            </div>
            <span className="inline-flex mt-3 items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ background: cfg.text + '22', color: cfg.text }}>
              {cfg.label}
            </span>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Check In</p>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" style={{ color: 'hsl(var(--status-present))' }} />
                  <span className="text-sm font-bold text-foreground">{day.checkIn ?? '—'}</span>
                </div>
              </div>
              <div className="p-3 rounded-xl border border-border bg-muted/30">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Check Out</p>
                <div className="flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-bold text-foreground">{day.checkOut ?? (day.day === 18 ? 'Active' : '—')}</span>
                </div>
              </div>
            </div>

            {/* Hours & Overtime */}
            {day.hours !== undefined && (
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Hours Worked</p>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                    <span className="text-sm font-bold text-foreground">{day.hours}h</span>
                  </div>
                </div>
                {day.overtime && day.overtime > 0 ? (
                  <div className="flex-1 p-3 rounded-xl" style={{ background: 'hsl(var(--warning) / 0.1)', border: '1px solid hsl(var(--warning) / 0.25)' }}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: 'hsl(var(--warning))' }}>Overtime</p>
                    <span className="text-sm font-bold" style={{ color: 'hsl(var(--warning))' }}>+{day.overtime}h</span>
                  </div>
                ) : null}
              </div>
            )}

            {/* WFH */}
            {day.status === 'wfh' && (
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'hsl(var(--status-wfh) / 0.1)', border: '1px solid hsl(var(--status-wfh) / 0.25)' }}>
                <Wifi className="w-4 h-4" style={{ color: 'hsl(var(--status-wfh))' }} />
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--status-wfh))' }}>Work From Home Day</span>
              </div>
            )}

            {/* Note */}
            {day.note && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Note</p>
                <p className="text-sm text-foreground">{day.note}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function AttendanceCalendar() {
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const days = buildCalendar();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const legend = [
    { status: 'present' as DayStatus, label: 'Present' },
    { status: 'late' as DayStatus, label: 'Late' },
    { status: 'absent' as DayStatus, label: 'Absent' },
    { status: 'wfh' as DayStatus, label: 'WFH' },
    { status: 'leave' as DayStatus, label: 'Leave' },
  ];

  const handleDayClick = (d: CalendarDay) => {
    if (d.status === 'weekend' || d.status === 'future' || d.status === 'empty') return;
    setSelectedDay(d);
  };

  // Summary counts
  const summary = days.reduce((acc, d) => {
    if (d.status !== 'weekend' && d.status !== 'future' && d.status !== 'empty') {
      acc[d.status] = (acc[d.status] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-bold text-foreground text-base" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Attendance Calendar
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">Click any day to view details</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </motion.button>
              <span className="text-sm font-semibold text-foreground px-1">Feb 2026</span>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-3">
            {legend.map(l => (
              <div key={l.status} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: statusConfig[l.status].text }} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-4 gap-px bg-border mx-6 rounded-xl overflow-hidden mb-5">
          {[
            { key: 'present', label: 'Present' },
            { key: 'late', label: 'Late' },
            { key: 'absent', label: 'Absent' },
            { key: 'wfh', label: 'WFH' },
          ].map(({ key, label }) => (
            <div key={key} className="bg-card px-3 py-2 text-center">
              <p className="text-lg font-bold" style={{ color: statusConfig[key as DayStatus].text }}>{summary[key] || 0}</p>
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="px-4 pb-5">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map(w => (
              <div key={w} className="text-center text-xs font-semibold text-muted-foreground py-1 tracking-wide">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((d, i) => {
              const cfg = statusConfig[d.status];
              const isToday = d.day === 18;
              const isClickable = d.status !== 'weekend' && d.status !== 'future' && d.status !== 'empty';

              if (d.status === 'empty') return <div key={i} />;

              return (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.008, type: 'spring', damping: 20, stiffness: 300 }}
                  whileHover={isClickable ? { scale: 1.1, y: -1 } : undefined}
                  whileTap={isClickable ? { scale: 0.95 } : undefined}
                  onClick={() => handleDayClick(d)}
                  className={`relative flex flex-col items-center justify-center rounded-xl aspect-square transition-all duration-150 ${
                    d.status === 'weekend' ? 'opacity-30 cursor-default' :
                    d.status === 'future'  ? 'opacity-40 cursor-default' :
                    'cursor-pointer'
                  } ${isToday ? 'ring-2' : ''}`}
                  style={{
                    background: (d.status !== 'weekend' && d.status !== 'future') ? cfg.bg : 'hsl(var(--muted) / 0.25)',
                    border: `1px solid ${cfg.border || 'transparent'}`,
                    ...(isToday ? { ringColor: 'hsl(var(--primary))' } : {}),
                    outline: isToday ? `2px solid hsl(var(--primary))` : undefined,
                  }}
                >
                  <span className={`text-xs font-bold leading-none ${
                    isToday ? 'text-primary' :
                    d.status === 'absent' ? '' :
                    d.status === 'weekend' || d.status === 'future' ? 'text-muted-foreground' :
                    'text-foreground'
                  }`}
                    style={d.status === 'absent' ? { color: 'hsl(var(--status-absent))' } : {}}>
                    {d.day}
                  </span>
                  {isClickable && d.status !== 'future' && (
                    <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: cfg.text }} />
                  )}
                  {d.overtime && d.overtime > 0 && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-card flex items-center justify-center"
                      style={{ background: 'hsl(var(--warning))' }} />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDay && (
        <DayDetailModal day={selectedDay} onClose={() => setSelectedDay(null)} />
      )}
    </>
  );
}
