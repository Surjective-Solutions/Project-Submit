'use client';

import { BarChart2, CalendarDays, HelpCircle } from 'lucide-react';

const CONFIG = {
  statistics: {
    icon: BarChart2,
    label: 'Statistics',
    color: '#E9D848',
    bg: 'rgba(233,216,72,0.12)',
    border: 'rgba(233,216,72,0.25)',
  },
  calendar: {
    icon: CalendarDays,
    label: 'Calendar',
    color: '#34A0C5',
    bg: 'rgba(52,160,197,0.12)',
    border: 'rgba(52,160,197,0.25)',
  },
  help: {
    icon: HelpCircle,
    label: 'Help',
    color: '#94A3B8',
    bg: 'rgba(148,163,184,0.12)',
    border: 'rgba(148,163,184,0.25)',
  },
};

export default function ComingSoonSection({ section }) {
  const { icon: Icon, label, color, bg, border } = CONFIG[section] ?? CONFIG.help;
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: bg, border: `1px solid ${border}` }}
      >
        <Icon className="h-8 w-8" style={{ color }} />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{label}</h2>
      <p className="text-sm text-gray-400 max-w-xs">This section is coming soon.</p>
    </div>
  );
}
