import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Lock, Mail, Shield, Clock, Users, BarChart3,
  ChevronRight, AlertTriangle, CheckCircle2, RefreshCw, X, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_ATTEMPTS = 5;

const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@timetrack.com',
    password: 'admin123',
    color: 'hsl(263, 70%, 50%)',
    desc: 'Full system access',
    initials: 'SJ',
  },
  {
    label: 'Manager',
    name: 'Marcus Chen',
    email: 'marcus.chen@timetrack.com',
    password: 'manager123',
    color: 'hsl(199, 89%, 48%)',
    desc: 'Department oversight',
    initials: 'MC',
  },
  {
    label: 'Employee',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@timetrack.com',
    password: 'emp123',
    color: 'hsl(142, 71%, 45%)',
    desc: 'Personal dashboard',
    initials: 'ER',
  },
];

const LEFT_FEATURES = [
  { icon: Clock, text: 'Smart check-in & overtime tracking' },
  { icon: Users, text: 'Department & team management' },
  { icon: BarChart3, text: 'Real-time analytics & reports' },
  { icon: Shield, text: 'Role-based access control' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type View = 'login' | 'forgot' | 'forgot-sent';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StrengthBar({ password }: { password: string }) {
  const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['', 'hsl(0,84%,60%)', 'hsl(38,92%,50%)', 'hsl(199,89%,48%)', 'hsl(142,71%,45%)'];
  if (!password) return null;
  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? colors[score] : 'hsl(var(--border))' }} />
        ))}
      </div>
      <p className="text-xs" style={{ color: colors[score] }}>{labels[score]}</p>
    </div>
  );
}


function AttemptDots({ used }: { used: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => (
        <div key={i} className="w-2 h-2 rounded-full transition-all duration-300"
          style={{ background: i < used ? 'hsl(var(--destructive))' : 'hsl(var(--border))' }} />
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Login() {
  const { login, resetPassword, getFailedAttempts, secondsUntilLockoutExpires } = useAuth();
  const navigate = useNavigate();

  // View state
  const [view, setView] = useState<View>('login');

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  // Forgot password form
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Check for session timeout reason
  const [timeoutBanner, setTimeoutBanner] = useState(false);
  useEffect(() => {
    if (sessionStorage.getItem('timetrack_logout_reason') === 'timeout') {
      setTimeoutBanner(true);
      sessionStorage.removeItem('timetrack_logout_reason');
    }
  }, []);

  // Sync lock countdown
  useEffect(() => {
    if (email) {
      const att = getFailedAttempts(email);
      if (att.lockedUntil && Date.now() < att.lockedUntil) setLocked(true);
      else setLocked(false);
    }
  }, [email, secondsUntilLockoutExpires, getFailedAttempts]);

  // Clear lock when countdown hits 0
  useEffect(() => {
    if (secondsUntilLockoutExpires === 0) setLocked(false);
  }, [secondsUntilLockoutExpires]);

  const failedAttempts = getFailedAttempts(email).count;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
    setLocked(false);
    setSelectedDemo(acc.label);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locked) return;
    setError('');
    setIsLoading(true);
    const result = await login(email, password, rememberMe);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      triggerShake();
      setError(result.error || 'Login failed');
      if (result.locked) setLocked(true);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    await resetPassword(forgotEmail);
    setForgotLoading(false);
    setView('forgot-sent');
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-background">

      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(263,70%,35%) 0%, hsl(263,70%,50%) 40%, hsl(280,60%,50%) 70%, hsl(245,75%,50%) 100%)' }}
      >
        {/* Floating blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, white, transparent)', filter: 'blur(60px)' }} />
          <div className="absolute bottom-20 -right-20 w-96 h-96 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, white, transparent)', filter: 'blur(80px)' }} />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, hsl(199,89%,70%), transparent)', filter: 'blur(50px)' }} />

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* Logo */}
        <motion.div className="relative" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white/25 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              TimeTrack Pro
            </span>
          </div>
          <p className="text-white/60 text-xs ml-[52px]">Enterprise Edition · v3.2</p>
        </motion.div>

        {/* Headline */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
          >
            <p className="text-white/60 text-sm font-medium uppercase tracking-widest mb-3">Work smarter</p>
            <h1
              className="text-4xl xl:text-5xl font-bold text-white leading-[1.15] mb-5"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              Your team's time,<br />
              <span className="text-white/80">perfectly managed.</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed mb-10 max-w-sm">
              Attendance, leave, reports, and team insights — all in one secure platform built for modern organizations.
            </p>
          </motion.div>

          <motion.div
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {LEFT_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center border border-white/10 backdrop-blur-sm">
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/85 text-sm font-medium">{f.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-10 p-4 rounded-2xl border border-white/15 bg-white/8 backdrop-blur-sm"
          >
            <p className="text-white/80 text-sm italic leading-relaxed">
              "TimeTrack saved us 12 hours a week on HR admin. The attendance reports are a game changer."
            </p>
            <div className="flex items-center gap-2 mt-3">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">JL</div>
              <div>
                <p className="text-white/90 text-xs font-semibold">Jessica Lee</p>
                <p className="text-white/50 text-xs">HR Director, Acme Corp</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="relative flex items-center gap-5"
        >
          {['SOC 2 Type II', 'GDPR Ready', '99.9% SLA'].map(b => (
            <div key={b} className="flex items-center gap-1.5 text-white/60 text-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
              {b}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'hsl(var(--primary))' }}>
              TimeTrack Pro
            </span>
          </div>

          {/* Session timeout banner */}
          <AnimatePresence>
            {timeoutBanner && (
              <motion.div
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                className="mb-5 px-4 py-3 rounded-xl flex items-start gap-3 border"
                style={{ background: 'hsl(38,92%,50%/0.1)', borderColor: 'hsl(38,92%,50%/0.3)', color: 'hsl(38,92%,35%)' }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-sm">
                  <span className="font-semibold">Session expired</span> — You were automatically signed out due to inactivity.
                </div>
                <button onClick={() => setTimeoutBanner(false)} className="opacity-60 hover:opacity-100 transition-opacity">
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Views ──────────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">

            {/* LOGIN VIEW */}
            {view === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-7">
                  <h2 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Welcome back
                  </h2>
                  <p className="text-muted-foreground mt-1 text-sm">Sign in to access your workspace</p>
                </div>

                {/* Demo role cards */}
                <div className="mb-6">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Quick Demo Access
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {DEMO_ACCOUNTS.map(acc => {
                      const isSelected = selectedDemo === acc.label;
                      return (
                        <button
                          key={acc.label}
                          onClick={() => fillDemo(acc)}
                          className="group relative p-3 rounded-xl border text-left transition-all duration-200 overflow-hidden"
                          style={{
                            borderColor: isSelected ? acc.color : 'hsl(var(--border))',
                            background: isSelected ? acc.color + '10' : 'hsl(var(--card))',
                            boxShadow: isSelected ? `0 0 0 2px ${acc.color}30` : 'none',
                          }}
                        >
                          {isSelected && (
                            <motion.div
                              layoutId="demo-selected"
                              className="absolute inset-0 rounded-xl"
                              style={{ background: acc.color + '08' }}
                            />
                          )}
                          <div className="relative">
                            <div
                              className="w-7 h-7 rounded-lg mb-2 flex items-center justify-center text-white text-xs font-bold"
                              style={{ background: acc.color }}
                            >
                              {acc.initials}
                            </div>
                            <p className="text-xs font-semibold text-foreground">{acc.label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{acc.desc}</p>
                            {isSelected && (
                              <div className="absolute top-0 right-0">
                                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: acc.color }} />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground">or enter credentials</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Form */}
                <motion.form
                  onSubmit={handleSubmit}
                  animate={shake ? { x: [0, -8, 8, -8, 8, -4, 4, 0] } : {}}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="email"
                        value={email}
                        onChange={e => { setEmail(e.target.value); setError(''); }}
                        placeholder="you@company.com"
                        autoComplete="email"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{
                          borderColor: error ? 'hsl(var(--destructive) / 0.5)' : 'hsl(var(--input))',
                          background: 'hsl(var(--card))',
                          boxShadow: error ? '0 0 0 3px hsl(var(--destructive) / 0.1)' : undefined,
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <button
                        type="button"
                        onClick={() => { setView('forgot'); setForgotEmail(email); }}
                        className="text-xs font-medium hover:underline transition-colors"
                        style={{ color: 'hsl(var(--primary))' }}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => { setPassword(e.target.value); setError(''); }}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        disabled={locked}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          borderColor: error ? 'hsl(var(--destructive) / 0.5)' : 'hsl(var(--input))',
                          background: 'hsl(var(--card))',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        tabIndex={-1}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={rememberMe}
                      onClick={() => setRememberMe(v => !v)}
                      className="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150 flex-shrink-0"
                      style={{
                        background: rememberMe ? 'hsl(var(--primary))' : 'transparent',
                        borderColor: rememberMe ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                      }}
                    >
                      {rememberMe && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <label
                      className="text-sm text-muted-foreground cursor-pointer select-none"
                      onClick={() => setRememberMe(v => !v)}
                    >
                      Remember me for 30 days
                    </label>
                  </div>

                  {/* Error / Lockout */}
                  <AnimatePresence>
                    {(error || locked) && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -6, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-4 py-3 rounded-xl flex items-start gap-3 border"
                          style={{
                            background: 'hsl(var(--destructive) / 0.08)',
                            borderColor: 'hsl(var(--destructive) / 0.25)',
                            color: 'hsl(var(--destructive))',
                          }}
                        >
                          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{error}</p>
                            {locked && secondsUntilLockoutExpires > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <RefreshCw className="w-3 h-3 animate-spin opacity-70" />
                                <span className="text-xs opacity-80">
                                  Unlocks in {secondsUntilLockoutExpires}s
                                </span>
                              </div>
                            )}
                            {!locked && failedAttempts > 0 && (
                              <div className="flex items-center gap-2 mt-2">
                                <AttemptDots used={failedAttempts} />
                                <span className="text-xs opacity-70">
                                  {MAX_ATTEMPTS - failedAttempts} attempt{MAX_ATTEMPTS - failedAttempts !== 1 ? 's' : ''} left
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading || locked}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 relative overflow-hidden mt-1"
                    style={{
                      background: locked
                        ? 'hsl(var(--muted-foreground) / 0.3)'
                        : 'linear-gradient(135deg, hsl(263,70%,50%), hsl(263,80%,60%))',
                      cursor: locked ? 'not-allowed' : 'pointer',
                      boxShadow: locked ? 'none' : '0 4px 16px hsl(263,70%,50%/0.35)',
                    }}
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : locked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        Account Locked · {secondsUntilLockoutExpires}s
                      </>
                    ) : (
                      <>
                        Sign In
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </motion.form>

                <p className="text-center text-xs text-muted-foreground mt-6">
                  By signing in you agree to our{' '}
                  <a href="#" className="underline underline-offset-2">Terms</a> &{' '}
                  <a href="#" className="underline underline-offset-2">Privacy Policy</a>
                </p>
              </motion.div>
            )}

            {/* FORGOT PASSWORD VIEW */}
            {view === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => setView('login')}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-7"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to sign in
                </button>

                <div className="mb-7">
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center mb-4 shadow-purple">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Reset your password
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                    Enter your work email and we'll send you a secure link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleForgot} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1.5">Work email address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => setForgotEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Must match the email tied to your TimeTrack account.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                    style={{ background: 'linear-gradient(135deg, hsl(263,70%,50%), hsl(263,80%,60%))', boxShadow: '0 4px 16px hsl(263,70%,50%/0.35)' }}
                  >
                    {forgotLoading
                      ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : 'Send Reset Link'
                    }
                  </button>
                </form>

                <div className="mt-5 p-4 rounded-xl border border-border bg-muted/50">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Didn't receive an email?</strong>{' '}
                    Check your spam folder. Reset links expire after 60 minutes. Contact{' '}
                    <a href="mailto:it@company.com" className="text-primary underline underline-offset-2">it@company.com</a>{' '}
                    if you need further help.
                  </p>
                </div>
              </motion.div>
            )}

            {/* FORGOT SENT VIEW */}
            {view === 'forgot-sent' && (
              <motion.div
                key="forgot-sent"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'hsl(142,71%,45%/0.12)', border: '2px solid hsl(142,71%,45%/0.3)' }}
                >
                  <CheckCircle2 className="w-8 h-8" style={{ color: 'hsl(142,71%,45%)' }} />
                </motion.div>

                <h2 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Check your inbox
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-2">
                  We've sent a password reset link to
                </p>
                <p className="font-semibold text-foreground text-sm mb-6">
                  {forgotEmail}
                </p>

                <div className="space-y-3 mb-8">
                  {['The link expires in 60 minutes', 'Check spam/junk if not received', 'One-time use only'].map(hint => (
                    <div key={hint} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'hsl(var(--primary))' }} />
                      {hint}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setView('login')}
                  className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200"
                  style={{ background: 'linear-gradient(135deg, hsl(263,70%,50%), hsl(263,80%,60%))', boxShadow: '0 4px 16px hsl(263,70%,50%/0.35)' }}
                >
                  Back to Sign In
                </button>

                <button
                  onClick={handleForgot}
                  className="mt-3 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                >
                  Didn't get it? Resend email
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
    