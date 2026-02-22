import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, Clock, CheckCircle2, Target, Award,
  ChevronRight, AlarmClock, DollarSign, BarChart2, Flame,
  Zap, LogOut, Coffee
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { MONTHLY_STATS, LEAVE_BALANCE, MOCK_LEAVE_REQUESTS, DEPARTMENT_STATS } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { AnimatePresence } from 'framer-motion';

const WEEK_DATA = [
  { day: 'Mon', hours: 7.8, target: 8 },
  { day: 'Tue', hours: 8.5, target: 8 },
  { day: 'Wed', hours: 7.2, target: 8 },
  { day: 'Thu', hours: 7.8, target: 8 },
  { day: 'Fri', hours: 9.2, target: 8 },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] } },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [showPayslip, setShowPayslip] = useState(false);

  const myLeaves = MOCK_LEAVE_REQUESTS.filter(l => l.userId === user?.id || l.userId === 'u3');

  const stats = [
    {
      title: 'Hours This Month',
      value: `${MONTHLY_STATS.totalHours}h`,
      subtitle: `${MONTHLY_STATS.overtimeHours}h overtime logged`,
      icon: Clock,
      iconColor: 'hsl(var(--primary))',
      iconBg: 'hsl(var(--primary) / 0.12)',
      trend: 'up' as const,
      trendValue: '+4.5h vs last month',
      delay: 0,
      highlight: true,
    },
    {
      title: 'Days Present',
      value: MONTHLY_STATS.presentDays,
      subtitle: `of ${MONTHLY_STATS.totalWorkDays} work days`,
      icon: CheckCircle2,
      iconColor: 'hsl(var(--status-present))',
      iconBg: 'hsl(var(--status-present) / 0.12)',
      trend: 'up' as const,
      trendValue: '65% attendance rate',
      delay: 0.05,
    },
    {
      title: 'Punctuality Score',
      value: `${MONTHLY_STATS.punctualityScore}%`,
      subtitle: `🔥 ${MONTHLY_STATS.onTimeStreak} day streak`,
      icon: Target,
      iconColor: 'hsl(var(--status-wfh))',
      iconBg: 'hsl(var(--status-wfh) / 0.12)',
      trend: 'up' as const,
      trendValue: '+3% vs last month',
      delay: 0.1,
    },
    {
      title: 'Leave Balance',
      value: `${LEAVE_BALANCE.vacation.remaining}d`,
      subtitle: 'Vacation remaining',
      icon: Calendar,
      iconColor: 'hsl(var(--status-leave))',
      iconBg: 'hsl(var(--status-leave) / 0.12)',
      trend: 'neutral' as const,
      trendValue: `${LEAVE_BALANCE.sick.remaining}d sick · ${LEAVE_BALANCE.personal.remaining}d personal`,
      delay: 0.15,
    },
  ];

  const greetHour = new Date().getHours();
  const greeting = greetHour < 12 ? 'Good morning' : greetHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <motion.div variants={item} className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {greeting}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Thursday · February 19, 2026 · Your monthly overview
          </p>
        </div>

        {/* Quick navigate to attendance */}
        <motion.a
          href="/attendance"
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary shadow-purple self-start sm:self-auto"
        >
          <Zap className="w-4 h-4" /> Go to Attendance
        </motion.a>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => <StatCard key={i} {...s} />)}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT column */}
        <div className="xl:col-span-1 space-y-4">

          {/* Punctuality Ring */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.12)' }}>
                  <Award className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <h3 className="font-bold text-sm text-foreground">Punctuality Score</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
                This Month
              </span>
            </div>
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
              <div className="flex-1 space-y-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4" style={{ color: 'hsl(var(--warning))' }} />
                    <span className="text-2xl font-bold text-foreground">{MONTHLY_STATS.onTimeStreak}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">day on-time streak</div>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" style={{ color: 'hsl(var(--status-present))' }} />
                  <span className="text-xs font-semibold" style={{ color: 'hsl(var(--status-present))' }}>+3% vs last month</span>
                </div>
                <div className="text-xs text-muted-foreground">{MONTHLY_STATS.lateDays} late arrivals this month</div>
              </div>
            </div>
          </motion.div>

          {/* Leave Balance */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-foreground">Leave Balance</h3>
              <a href="/leave" className="text-xs font-semibold flex items-center gap-0.5 transition-colors" style={{ color: 'hsl(var(--primary))' }}>
                Request <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="space-y-3.5">
              {[
                { label: 'Vacation', ...LEAVE_BALANCE.vacation, color: 'hsl(var(--status-leave))' },
                { label: 'Sick Days', ...LEAVE_BALANCE.sick, color: 'hsl(var(--status-absent))' },
                { label: 'Personal', ...LEAVE_BALANCE.personal, color: 'hsl(var(--status-wfh))' },
              ].map(b => (
                <div key={b.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-foreground font-semibold">{b.label}</span>
                    <span className="text-muted-foreground"><strong className="text-foreground">{b.remaining}</strong>/{b.total} days left</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.remaining / b.total) * 100}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
                      style={{ background: b.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Payslip Summary */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <button
              onClick={() => setShowPayslip(!showPayslip)}
              className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'hsl(var(--status-present) / 0.12)' }}>
                  <DollarSign className="w-4.5 h-4.5" style={{ color: 'hsl(var(--status-present))' }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">Payslip Summary</p>
                  <p className="text-xs text-muted-foreground">February 2026</p>
                </div>
              </div>
              <motion.div animate={{ rotate: showPayslip ? 90 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.div>
            </button>
            <AnimatePresence>
              {showPayslip && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                    {[
                      { label: 'Regular Hours', value: '104.0h', amount: '$3,120.00' },
                      { label: 'Overtime Hours', value: `${MONTHLY_STATS.overtimeHours}h`, amount: '$202.50', highlight: true },
                      { label: 'WFH Days', value: `${MONTHLY_STATS.wfhDays}d`, amount: '$0' },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{row.label} <span className="text-foreground font-medium">({row.value})</span></span>
                        <span className={`font-bold`} style={row.highlight ? { color: 'hsl(var(--status-present))' } : { color: 'hsl(var(--foreground))' }}>
                          {row.amount}
                        </span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">Estimated Total</span>
                      <span className="text-base font-bold" style={{ color: 'hsl(var(--primary))' }}>$3,322.50</span>
                    </div>
                    <p className="text-xs text-muted-foreground">*Estimate only. Final payslip generated Mar 1.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* RIGHT column */}
        <div className="xl:col-span-2 space-y-4">

          {/* Weekly Hours Chart */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'hsl(var(--primary) / 0.12)' }}>
                  <BarChart2 className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>This Week's Hours</h3>
                  <p className="text-xs text-muted-foreground">Feb 16 – 20, 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: 'hsl(var(--primary))' }} />
                  <span className="text-muted-foreground">Worked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-border" />
                  <span className="text-muted-foreground">Target (8h)</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={WEEK_DATA} barGap={4} barCategoryGap="30%">
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={28} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 700, color: 'hsl(var(--foreground))', marginBottom: 4 }}
                  formatter={(value: number) => [`${value}h`, 'Worked']}
                  cursor={{ fill: 'hsl(var(--muted) / 0.4)', radius: 6 }}
                />
                <Bar dataKey="target" fill="hsl(var(--border))" radius={[6, 6, 0, 0]} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
                  {WEEK_DATA.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.hours > entry.target ? 'hsl(var(--status-present))' : entry.hours < entry.target - 0.5 ? 'hsl(var(--status-late))' : 'hsl(var(--primary))'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
              {[
                { label: 'Total', value: '40.5h', color: 'hsl(var(--primary))' },
                { label: 'Overtime', value: '0.5h', color: 'hsl(var(--status-present))' },
                { label: 'Avg/day', value: '8.1h', color: 'hsl(var(--foreground))' },
                { label: 'Target', value: '40h', color: 'hsl(var(--muted-foreground))' },
              ].map(chip => (
                <div key={chip.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 border border-border">
                  <span className="text-xs text-muted-foreground">{chip.label}</span>
                  <span className="text-xs font-bold" style={{ color: chip.color }}>{chip.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Monthly breakdown — attendance breakdown bars */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground text-sm mb-4">February Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Present', value: MONTHLY_STATS.presentDays, total: MONTHLY_STATS.totalWorkDays, color: 'hsl(var(--status-present))' },
                { label: 'WFH', value: MONTHLY_STATS.wfhDays, total: MONTHLY_STATS.totalWorkDays, color: 'hsl(var(--status-wfh))' },
                { label: 'Late', value: MONTHLY_STATS.lateDays, total: MONTHLY_STATS.totalWorkDays, color: 'hsl(var(--status-late))' },
                { label: 'Absent', value: MONTHLY_STATS.absentDays, total: MONTHLY_STATS.totalWorkDays, color: 'hsl(var(--status-absent))' },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-14">{b.label}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(b.value / b.total) * 100}%` }}
                      transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
                      style={{ background: b.color }}
                    />
                  </div>
                  <span className="text-xs font-bold text-foreground w-6 text-right">{b.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Recent Activity</h3>
              <a href="/attendance" className="text-xs font-semibold flex items-center gap-0.5 transition-colors" style={{ color: 'hsl(var(--primary))' }}>
                Full attendance <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
            <div className="space-y-1">
              {[
                { date: 'Today 08:47', action: 'Checked in at the office', sub: 'Floor 3 · Session active', icon: CheckCircle2, color: 'hsl(var(--status-present))' },
                { date: 'Feb 17 17:30', action: 'Checked out · 7.8h worked', sub: 'Full day — 2 min early', icon: LogOut, color: 'hsl(var(--primary))' },
                { date: 'Feb 16 09:18', action: 'Late check-in (18 min)', sub: 'Doctor appointment — noted', icon: AlarmClock, color: 'hsl(var(--status-late))' },
                { date: 'Feb 14', action: 'Vacation leave approved', sub: 'Approved by Marcus Chen', icon: Calendar, color: 'hsl(var(--status-leave))' },
                { date: 'Feb 13 18:30', action: 'Overtime 1.5h logged', sub: 'Pending manager approval', icon: TrendingUp, color: 'hsl(var(--warning))' },
              ].map((a, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors cursor-default group"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-transform group-hover:scale-105"
                    style={{ background: a.color + '18', border: `1px solid ${a.color}30` }}>
                    <a.icon className="w-4 h-4" style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.action}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.sub}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5 font-medium">{a.date}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* My Leave Requests */}
          {myLeaves.length > 0 && (
            <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>My Leave Requests</h3>
                <a href="/leave" className="text-xs font-semibold flex items-center gap-0.5" style={{ color: 'hsl(var(--primary))' }}>
                  All requests <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="space-y-3">
                {myLeaves.slice(0, 3).map((lr, i) => (
                  <motion.div
                    key={lr.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground capitalize">{lr.type} Leave</p>
                      <p className="text-xs text-muted-foreground">{lr.startDate} → {lr.endDate} · {lr.days}d</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize flex-shrink-0" style={{
                      background: lr.status === 'approved' ? 'hsl(var(--status-present) / 0.12)' : lr.status === 'rejected' ? 'hsl(var(--status-absent) / 0.12)' : 'hsl(var(--status-late) / 0.12)',
                      color: lr.status === 'approved' ? 'hsl(var(--status-present))' : lr.status === 'rejected' ? 'hsl(var(--status-absent))' : 'hsl(var(--status-late))',
                    }}>
                      {lr.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
