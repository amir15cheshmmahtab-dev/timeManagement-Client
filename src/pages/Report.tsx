import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { Download, TrendingUp, Users, Award, Calendar } from 'lucide-react';
import { DEPARTMENT_STATS, TOP_PUNCTUAL, MONTHLY_STATS } from '@/data/mockData';

type ReportTab = 'overview' | 'departments' | 'individual' | 'overtime';

const weeklyData = [
  { week: 'Jan W1', present: 88, absent: 5, late: 7 },
  { week: 'Jan W2', present: 82, absent: 10, late: 8 },
  { week: 'Jan W3', present: 91, absent: 4, late: 5 },
  { week: 'Jan W4', present: 86, absent: 8, late: 6 },
  { week: 'Feb W1', present: 90, absent: 5, late: 5 },
  { week: 'Feb W2', present: 87, absent: 6, late: 7 },
  { week: 'Feb W3', present: 93, absent: 3, late: 4 },
];

const heatmapData = Array.from({ length: 28 }, (_, i) => {
  const d = i + 1;
  const dow = new Date(2026, 1, d).getDay();
  return {
    day: d,
    value: dow === 0 || dow === 6 ? 0 : Math.floor(Math.random() * 30) + 60,
    isWeekend: dow === 0 || dow === 6,
  };
});

const overtimeData = [
  { name: 'Engineering', hours: 24 },
  { name: 'Design', hours: 8 },
  { name: 'Marketing', hours: 6 },
  { name: 'Finance', hours: 4 },
  { name: 'HR', hours: 2 },
];

const COLORS = [
  'hsl(263, 70%, 50%)',
  'hsl(199, 89%, 48%)',
  'hsl(142, 71%, 45%)',
  'hsl(38, 92%, 50%)',
  'hsl(320, 70%, 55%)',
];

const punctualityTrend = [
  { month: 'Sep', score: 78 },
  { month: 'Oct', score: 81 },
  { month: 'Nov', score: 79 },
  { month: 'Dec', score: 84 },
  { month: 'Jan', score: 85 },
  { month: 'Feb', score: 87 },
];

export default function Reports() {
  const [tab, setTab] = useState<ReportTab>('overview');

  const tabs: { id: ReportTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'departments', label: 'Departments' },
    { id: 'individual', label: 'Individual' },
    { id: 'overtime', label: 'Overtime' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">Company-wide attendance insights — February 2026</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border hover:bg-muted transition-colors">
            <Download className="w-4 h-4" /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white gradient-primary shadow-purple">
            <Download className="w-4 h-4" /> Export Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${tab === t.id ? 'bg-card shadow-card text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Avg Attendance', value: '87%', icon: Users, color: 'hsl(var(--primary))' },
              { label: 'Total Hours', value: '2,840h', icon: Calendar, color: 'hsl(var(--status-wfh))' },
              { label: 'Avg Punctuality', value: '91%', icon: TrendingUp, color: 'hsl(var(--status-present))' },
              { label: 'Total Overtime', value: '44h', icon: Award, color: 'hsl(var(--status-late))' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border shadow-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{item.label}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.color + '15' }}>
                    <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{item.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Attendance Heatmap */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Attendance Heatmap — February 2026</h3>
            <p className="text-xs text-muted-foreground mb-5">Daily company-wide attendance rate (%)</p>
            <div className="grid grid-cols-7 gap-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i} className="text-center text-xs text-muted-foreground font-medium pb-1">{d}</div>
              ))}
              {heatmapData.map((d, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all hover:scale-110 cursor-default"
                  style={d.isWeekend
                    ? { background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }
                    : {
                      background: `hsl(263, 70%, ${Math.max(100 - d.value * 0.45, 50)}%)`,
                      color: d.value > 80 ? 'white' : 'hsl(263, 70%, 30%)',
                      opacity: d.value > 0 ? 1 : 0.3,
                    }}
                  title={d.isWeekend ? 'Weekend' : `${d.value}%`}
                >
                  {d.day}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-4 justify-end">
              <span className="text-xs text-muted-foreground">Low</span>
              {[0.2, 0.4, 0.6, 0.8, 1.0].map(v => (
                <div key={v} className="w-6 h-4 rounded" style={{ background: `hsl(263, 70%, ${100 - v * 40}%)` }} />
              ))}
              <span className="text-xs text-muted-foreground">High</span>
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground mb-1" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Weekly Attendance Trend</h3>
            <p className="text-xs text-muted-foreground mb-5">Last 7 weeks</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barSize={10} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="present" fill="hsl(263, 70%, 50%)" radius={[4, 4, 0, 0]} name="Present %" />
                <Bar dataKey="late" fill="hsl(38, 92%, 50%)" radius={[4, 4, 0, 0]} name="Late %" />
                <Bar dataKey="absent" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} name="Absent %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Punctual */}
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>⭐ Most Punctual Employees</h3>
            <div className="space-y-3">
              {TOP_PUNCTUAL.map((emp, i) => (
                <div key={emp.name} className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-foreground">{emp.name} <span className="text-muted-foreground text-xs">· {emp.dept}</span></span>
                      <span className="font-semibold" style={{ color: 'hsl(var(--primary))' }}>{emp.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full gradient-primary" style={{ width: `${emp.score}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">🔥 {emp.streak} day streak</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* DEPARTMENTS */}
      {tab === 'departments' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Department Comparison</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={DEPARTMENT_STATS} layout="vertical" barSize={8}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'hsl(215, 16%, 47%)' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                  <Bar dataKey="present" fill="hsl(263, 70%, 50%)" radius={[0, 4, 4, 0]} name="Present %" />
                  <Bar dataKey="absent" fill="hsl(0, 84%, 60%)" radius={[0, 4, 4, 0]} name="Absent %" />
                  <Bar dataKey="late" fill="hsl(38, 92%, 50%)" radius={[0, 4, 4, 0]} name="Late %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-2xl border border-border shadow-card p-6">
              <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Attendance Distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={DEPARTMENT_STATS} dataKey="present" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}%`} labelLine={false}>
                    {DEPARTMENT_STATS.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Department table */}
          <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {['Department', 'Present %', 'Late %', 'Absent %', 'WFH %', 'Score'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {DEPARTMENT_STATS.map((d, i) => (
                  <tr key={i} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-sm text-foreground">{d.name}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${d.present}%`, background: 'hsl(var(--primary))' }} />
                        </div>
                        <span className="text-sm text-foreground">{d.present}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'hsl(var(--status-late))' }}>{d.late}%</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'hsl(var(--status-absent))' }}>{d.absent}%</td>
                    <td className="px-5 py-3.5 text-sm" style={{ color: 'hsl(var(--status-wfh))' }}>{d.wfh}%</td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-semibold" style={{ color: 'hsl(var(--primary))' }}>
                        {Math.round((d.present * 0.7) + ((100 - d.late) * 0.3))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* INDIVIDUAL */}
      {tab === 'individual' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Emily Rodriguez — Punctuality Trend</h3>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={punctualityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="score" stroke="hsl(263, 70%, 50%)" strokeWidth={3} dot={{ fill: 'hsl(263, 70%, 50%)', r: 5 }} name="Punctuality %" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* OVERTIME */}
      {tab === 'overtime' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="bg-card rounded-2xl border border-border shadow-card p-6">
            <h3 className="font-bold text-foreground mb-4" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Overtime by Department — February 2026</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={overtimeData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} unit="h" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="hours" radius={[6, 6, 0, 0]} name="Overtime Hours">
                  {overtimeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}
    </div>
  );
}
