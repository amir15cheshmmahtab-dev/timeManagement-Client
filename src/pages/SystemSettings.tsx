import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Clock, Calendar, Globe, Bell, Shield, Building2, ChevronRight } from 'lucide-react';

const settingSections = [
  {
    id: 'working-hours',
    label: 'Working Hours',
    icon: Clock,
    fields: [
      { label: 'Work Start Time', type: 'time', value: '09:00' },
      { label: 'Work End Time', type: 'time', value: '17:00' },
      { label: 'Late Threshold (minutes)', type: 'number', value: '15' },
      { label: 'Minimum Work Hours', type: 'number', value: '8' },
    ],
  },
  {
    id: 'leave',
    label: 'Leave Policies',
    icon: Calendar,
    fields: [
      { label: 'Annual Vacation Days', type: 'number', value: '15' },
      { label: 'Sick Days per Year', type: 'number', value: '10' },
      { label: 'Personal Days', type: 'number', value: '5' },
      { label: 'Max Carry-forward Days', type: 'number', value: '5' },
    ],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    toggles: [
      { label: 'Late arrival alerts to manager', value: true },
      { label: 'Consecutive absence alerts', value: true },
      { label: 'Checkout reminder after hours', value: true },
      { label: 'Weekly summary email', value: true },
      { label: 'Leave approval reminders', value: false },
    ],
  },
  {
    id: 'system',
    label: 'System',
    icon: Globe,
    toggles: [
      { label: 'WFH mode enabled company-wide', value: true },
      { label: 'QR code check-in', value: true },
      { label: 'Require overtime approval', value: true },
    ],
    fields: [
      { label: 'Timezone', type: 'text', value: 'UTC-5 (Eastern Time)' },
      { label: 'Date Format', type: 'text', value: 'YYYY-MM-DD' },
    ],
  },
];

export default function SystemSettings() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'Late arrival alerts to manager': true,
    'Consecutive absence alerts': true,
    'Checkout reminder after hours': true,
    'Weekly summary email': true,
    'Leave approval reminders': false,
    'WFH mode enabled company-wide': true,
    'QR code check-in': true,
    'Require overtime approval': true,
  });

  const [activeSection, setActiveSection] = useState('working-hours');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          <SettingsIcon className="w-6 h-6" style={{ color: 'hsl(var(--primary))' }} />
          System Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Configure company-wide policies and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {settingSections.map(sec => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left transition-all duration-200 ${
                  activeSection === sec.id ? 'text-primary shadow-sm' : 'text-foreground hover:bg-muted'
                }`}
                style={activeSection === sec.id ? { background: 'hsl(var(--primary) / 0.08)', color: 'hsl(var(--primary))' } : {}}
              >
                <sec.icon className="w-4 h-4 flex-shrink-0" />
                {sec.label}
                {activeSection === sec.id && <ChevronRight className="w-3 h-3 ml-auto" />}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {settingSections.map(sec => (
            activeSection === sec.id && (
              <motion.div key={sec.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                className="bg-card rounded-2xl border border-border shadow-card p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                    <sec.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{sec.label}</h2>
                    <p className="text-xs text-muted-foreground">Configure {sec.label.toLowerCase()} settings</p>
                  </div>
                </div>

                {sec.fields?.map(f => (
                  <div key={f.label}>
                    <label className="text-sm font-medium text-foreground block mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={f.value}
                      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}

                {sec.toggles?.map(t => (
                  <div key={t.label} className="flex items-center justify-between p-4 rounded-xl bg-muted">
                    <div>
                      <div className="text-sm font-medium text-foreground">{t.label}</div>
                    </div>
                    <button
                      onClick={() => setToggles(prev => ({ ...prev, [t.label]: !prev[t.label] }))}
                      className="w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0"
                      style={{ background: toggles[t.label] ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground) / 0.3)' }}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${toggles[t.label] ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}

                <div className="flex justify-end gap-2 pt-2">
                  <button className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    Reset Defaults
                  </button>
                  <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white gradient-primary shadow-purple hover:opacity-90 transition-all">
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
