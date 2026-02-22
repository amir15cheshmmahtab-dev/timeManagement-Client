import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  delay?: number;
  highlight?: boolean;
}

function AnimatedNumber({ value }: { value: string | number }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  const numericMatch = String(value).match(/^([\d.]+)/);
  const numeric = numericMatch ? parseFloat(numericMatch[1]) : null;
  const suffix = numericMatch ? String(value).slice(numericMatch[1].length) : '';

  useEffect(() => {
    if (!inView || numeric === null) return;
    const duration = 900;
    const steps = 40;
    const increment = numeric / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(current + increment, numeric);
      setDisplayed(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, numeric]);

  if (numeric === null) return <span ref={ref}>{value}</span>;

  const formatted = numeric % 1 !== 0
    ? displayed.toFixed(1)
    : Math.round(displayed).toString();

  return <span ref={ref}>{formatted}{suffix}</span>;
}

export default function StatCard({
  title, value, subtitle, icon: Icon, iconColor, iconBg, trend, trendValue, delay = 0, highlight
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`relative bg-card rounded-2xl p-5 shadow-card border overflow-hidden transition-shadow duration-300 hover:shadow-purple ${
        highlight ? 'border-primary/30' : 'border-border'
      }`}
    >
      {highlight && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.04) 0%, transparent 70%)' }} />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1.5 leading-none" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            <AnimatedNumber value={value} />
          </p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>}
        </div>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
          style={{ background: iconBg || 'hsl(var(--primary) / 0.1)' }}
        >
          <Icon className="w-5 h-5" style={{ color: iconColor || 'hsl(var(--primary))' }} />
        </motion.div>
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex items-center justify-center w-4 h-4 rounded-full"
            style={{ background: trend === 'up' ? 'hsl(var(--success) / 0.15)' : trend === 'down' ? 'hsl(var(--destructive) / 0.15)' : 'hsl(var(--muted))' }}>
            {trend === 'up' ? (
              <TrendingUp className="w-2.5 h-2.5" style={{ color: 'hsl(var(--success))' }} />
            ) : trend === 'down' ? (
              <TrendingDown className="w-2.5 h-2.5" style={{ color: 'hsl(var(--destructive))' }} />
            ) : (
              <Minus className="w-2.5 h-2.5 text-muted-foreground" />
            )}
          </div>
          <span className="text-xs font-medium" style={{
            color: trend === 'up' ? 'hsl(var(--success))' :
                   trend === 'down' ? 'hsl(var(--destructive))' :
                   'hsl(var(--muted-foreground))'
          }}>
            {trendValue}
          </span>
        </div>
      )}
    </motion.div>
  );
}
