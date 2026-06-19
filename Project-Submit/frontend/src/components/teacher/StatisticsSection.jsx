'use client';

import { BarChart2 } from 'lucide-react';

export default function StatisticsSection() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(233,216,72,0.12)', border: '1px solid rgba(233,216,72,0.25)' }}
      >
        <BarChart2 className="h-8 w-8" style={{ color: '#E9D848' }} />
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Statistics</h2>
      <p className="text-sm text-gray-400 max-w-xs">
        Analytics and performance insights are coming soon. Check back later.
      </p>
    </div>
  );
}
