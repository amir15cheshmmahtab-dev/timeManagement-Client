  import React, {
    createContext, useContext, useState, useEffect,
    useCallback, useRef, ReactNode
  } from 'react';
  import { User } from '@/data/mockData';

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
      localStorage.removeItem('timetrack_tokens');
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem('timetrack_tokens');
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
      const all = getAttempts();
      const attempt = all[email] || { count: 0, lockedUntil: null };

      // Check lockout (client-side guard)
      if (attempt.lockedUntil && Date.now() < attempt.lockedUntil) {
        startLockoutCountdown(attempt.lockedUntil);
        return {
          success: false,
          locked: true,
          error: `Account locked. Try again in ${Math.ceil((attempt.lockedUntil - Date.now()) / 1000)}s.`,
        };
      }

      try {
        const API_BASE = import.meta.env.VITE_API_BASE || '';
        const res = await fetch(`${API_BASE}/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        });

        if (!res.ok) {
          // increment failed attempts
          const newCount = attempt.count + 1;
          const lockedUntil = newCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCKOUT_DURATION_MS : null;
          all[email] = { count: newCount, lockedUntil };
          saveAttempts(all);
          if (lockedUntil) startLockoutCountdown(lockedUntil);

          const payloadText = await res.text();
          return { success: false, error: payloadText || 'Invalid credentials' };
        }

        const body = await res.json();
        const tokens = body?.data;
        if (!tokens || !tokens.accessToken) {
          return { success: false, error: 'Invalid server response' };
        }

        // Clear failed attempts on success
        delete all[email];
        saveAttempts(all);

        // Decode JWT payload to build minimal user object
        const decodeJwt = <T,>(token: string): T | null => {
          try {
            const part = token.split('.')[1];
            let b64 = part.replace(/-/g, '+').replace(/_/g, '/');
            while (b64.length % 4) b64 += '=';
            const json = atob(b64);
            return JSON.parse(json) as T;
          } catch {
            return null;
          }
        };

        const payload = decodeJwt<{ userId: string; username: string; role: string }>(tokens.accessToken);
        const userObj: User = {
          id: payload?.userId ?? 'unknown',
          name: payload?.username ?? email,
          email: payload?.username ?? email,
          role: (payload?.role ?? 'Employee').toLowerCase() as any,
          department: '',
          position: '',
          avatar: (payload?.username ?? email).slice(0, 2).toUpperCase(),
          phone: '',
          joinDate: '',
          birthDate: '',
          status: 'active',
        };

        setUser(userObj);
        const serialised = JSON.stringify(userObj);
        if (rememberMe) {
          localStorage.setItem(STORAGE_KEY, serialised);
          localStorage.setItem(REMEMBER_KEY, '1');
          localStorage.setItem('timetrack_tokens', JSON.stringify(tokens));
        } else {
          sessionStorage.setItem(STORAGE_KEY, serialised);
          localStorage.removeItem(REMEMBER_KEY);
          sessionStorage.setItem('timetrack_tokens', JSON.stringify(tokens));
        }

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || 'Network error' };
      }
    };

    // ── Forgot password ────────────────────────────────────────────────────────
    const resetPassword = async (email: string) => {
      // Replace with server call if available. For now, behave as if a reset email
      // was sent (don't reveal account existence).
      await new Promise(r => setTimeout(r, 800));
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


//   import React, {
//   createContext, useContext, useState, useEffect,
//   useCallback, ReactNode
// } from 'react';
// import { User } from '@/data/mockData';

// interface AuthContextType {
//   user: User | null;
//   isLoading: boolean;
//   login: (
//     email: string,
//     password: string,
//     rememberMe: boolean
//   ) => Promise<{ success: boolean; error?: string }>;
//   logout: () => void;
//   resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// // ---------------------------------------------------------------------------
// // Storage keys
// // ---------------------------------------------------------------------------
// const STORAGE_KEY = 'timetrack_user';
// const REMEMBER_KEY = 'timetrack_remember';

// // ---------------------------------------------------------------------------
// // Provider
// // ---------------------------------------------------------------------------
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   // ── Hydrate session ────────────────────────────────────────────────────────
//   useEffect(() => {
//     const stored =
//       localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
//     if (stored) {
//       try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
//     }
//     setIsLoading(false);
//   }, []);

//   // ── Logout ─────────────────────────────────────────────────────────────────
//   const logout = useCallback(() => {
//     setUser(null);
//     localStorage.removeItem(STORAGE_KEY);
//     localStorage.removeItem(REMEMBER_KEY);
//     sessionStorage.removeItem(STORAGE_KEY);
//   }, []);

//   // ── Login ──────────────────────────────────────────────────────────────────
//   // Expects the caller (e.g. a server action / API route) to validate credentials
//   // and return a User on success. Replace the body here with your real auth call.
//   const login = useCallback(async (
//     email: string,
//     password: string,
//     rememberMe: boolean
//   ): Promise<{ success: boolean; error?: string }> => {
//     // TODO: replace with real API call
//     // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
//     // if (!res.ok) return { success: false, error: await res.text() };
//     // const foundUser: User = await res.json();
//     throw new Error('login() not implemented — wire up your auth API here.');

//     // Once you have `foundUser`:
//     // setUser(foundUser);
//     // const serialised = JSON.stringify(foundUser);
//     // if (rememberMe) {
//     //   localStorage.setItem(STORAGE_KEY, serialised);
//     //   localStorage.setItem(REMEMBER_KEY, '1');
//     // } else {
//     //   sessionStorage.setItem(STORAGE_KEY, serialised);
//     // }
//     // return { success: true };
//   }, []);

//   // ── Reset password ─────────────────────────────────────────────────────────
//   // Replace with a real API call; never reveal whether the email exists.
//   const resetPassword = useCallback(async (
//     email: string
//   ): Promise<{ success: boolean; error?: string }> => {
//     // TODO: replace with real API call
//     // await fetch('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ email }) });
//     throw new Error('resetPassword() not implemented — wire up your auth API here.');
//     // return { success: true };
//   }, []);

//   return (
//     <AuthContext.Provider value={{ user, isLoading, login, logout, resetPassword }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used within AuthProvider');
//   return ctx;
// };