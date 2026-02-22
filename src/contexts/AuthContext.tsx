import React, {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, ReactNode
} from 'react';
import { User, MOCK_CREDENTIALS, MOCK_USERS } from '@/data/mockData';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30_000; // 30 seconds (demo — real world: 15 min)
const SESSION_TIMEOUT_MS = 20 * 60_000; // 20 min
const SESSION_WARN_BEFORE_MS = 2 * 60_000; // warn 2 min before

interface LoginAttempt {
  count: number;
  lockedUntil: number | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  sessionWarning: boolean; 
  secondsUntilLockoutExpires: number; // 0 when not locked
  getFailedAttempts: (email: string) => LoginAttempt;
  login: (
    email: string,
    password: string,
    rememberMe: boolean
  ) => Promise<{ success: boolean; error?: string; locked?: boolean }>;
  logout: (reason?: 'manual' | 'timeout') => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  dismissSessionWarning: () => void;
  extendSession: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'timetrack_user';
const REMEMBER_KEY = 'timetrack_remember';
const ATTEMPTS_KEY = 'timetrack_attempts';

const getAttempts = (): Record<string, LoginAttempt> => {
  try {
    return JSON.parse(localStorage.getItem(ATTEMPTS_KEY) || '{}');
  } catch {
    return {};
  }
};

const saveAttempts = (attempts: Record<string, LoginAttempt>) => {
  localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionWarning, setSessionWarning] = useState(false);
  const [lockedCountdown, setLockedCountdown] = useState(0);

  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Hydrate session ────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  // ── Session timeout machinery ──────────────────────────────────────────────
  const clearTimers = useCallback(() => {
    if (activityTimer.current) clearTimeout(activityTimer.current);
    if (warnTimer.current) clearTimeout(warnTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const logout = useCallback((reason: 'manual' | 'timeout' = 'manual') => {
    clearTimers();
    setUser(null);
    setSessionWarning(false);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (reason === 'timeout') {
      sessionStorage.setItem('timetrack_logout_reason', 'timeout');
    }
  }, [clearTimers]);

  const armSessionTimers = useCallback(() => {
    clearTimers();
    warnTimer.current = setTimeout(() => {
      setSessionWarning(true);
    }, SESSION_TIMEOUT_MS - SESSION_WARN_BEFORE_MS);

    activityTimer.current = setTimeout(() => {
      logout('timeout');
    }, SESSION_TIMEOUT_MS);
  }, [clearTimers, logout]);

  // Reset timers on any user activity
  useEffect(() => {
    if (!user) return;
    const resetOnActivity = () => armSessionTimers();
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetOnActivity));
    armSessionTimers(); // arm immediately on login
    return () => {
      events.forEach(e => window.removeEventListener(e, resetOnActivity));
      clearTimers();
    };
  }, [user, armSessionTimers, clearTimers]);

  // ── Lockout countdown display ─────────────────────────────────────────────
  const startLockoutCountdown = (lockedUntil: number) => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    const tick = () => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
      if (remaining <= 0) {
        setLockedCountdown(0);
        if (countdownInterval.current) clearInterval(countdownInterval.current);
      } else {
        setLockedCountdown(remaining);
      }
    };
    tick();
    countdownInterval.current = setInterval(tick, 1000);
  };

  // ── Public getters ─────────────────────────────────────────────────────────
  const getFailedAttempts = (email: string): LoginAttempt => {
    const all = getAttempts();
    return all[email] || { count: 0, lockedUntil: null };
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string, rememberMe: boolean) => {
    // Simulate network latency
    await new Promise(r => setTimeout(r, 900));

    const all = getAttempts();
    const attempt = all[email] || { count: 0, lockedUntil: null };

    // Check lockout
    if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
      startLockoutCountdown(attempt.lockedUntil);
      return {
        success: false,
        locked: true,
        error: `Account locked. Try again in ${Math.ceil((attempt.lockedUntil - Date.now()) / 1000)}s.`,
      };
    }

    const cred = MOCK_CREDENTIALS.find(c => c.email === email && c.password === password);

    if (!cred) {
      const newCount = attempt.count + 1;
      const lockedUntil = newCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;
      all[email] = { count: newCount, lockedUntil };
      saveAttempts(all);

      if (lockedUntil) {
        startLockoutCountdown(lockedUntil);
        return {
          success: false,
          locked: true,
          error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MS / 1000}s.`,
        };
      }

      const remaining = MAX_FAILED_ATTEMPTS - newCount;
      return {
        success: false,
        error: `Incorrect email or password. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      };
    }

    // ── Success ─────────────────────────────────────────────────────────────
    const foundUser = MOCK_USERS.find(u => u.id === cred.userId)!;
    // Clear failed attempts
    delete all[email];
    saveAttempts(all);

    setUser(foundUser);
    const serialised = JSON.stringify(foundUser);
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, serialised);
      localStorage.setItem(REMEMBER_KEY, '1');
    } else {
      sessionStorage.setItem(STORAGE_KEY, serialised);
      localStorage.removeItem(REMEMBER_KEY);
    }

    return { success: true };
  };

  // ── Forgot password ────────────────────────────────────────────────────────
  const resetPassword = async (email: string) => {
    await new Promise(r => setTimeout(r, 1200));
    const exists = MOCK_CREDENTIALS.find(c => c.email === email);
    if (!exists) {
      // Don't reveal whether email exists — standard security practice
      return { success: true }; // pretend success always
    }
    return { success: true };
  };

  // ── Session warning controls ───────────────────────────────────────────────
  const dismissSessionWarning = () => setSessionWarning(false);

  const extendSession = () => {
    setSessionWarning(false);
    armSessionTimers();
  };

  return (
    <AuthContext.Provider value={{
      user, isLoading, sessionWarning,
      secondsUntilLockoutExpires: lockedCountdown,
      getFailedAttempts, login, logout, resetPassword,
      dismissSessionWarning, extendSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
