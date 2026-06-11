'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { MOCK_TUTORS } from '@/lib/mock-data';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = {
  Mathematics:            'bg-blue-50 text-blue-700',
  Physics:                'bg-orange-50 text-orange-700',
  Chemistry:              'bg-purple-50 text-purple-700',
  Biology:                'bg-green-50 text-green-700',
  'English Literature':   'bg-pink-50 text-pink-700',
  'Combined Mathematics': 'bg-cyan-50 text-cyan-700',
  default:                'bg-gray-100 text-gray-600',
};

function TeacherInitials({ name, size = 80 }) {
  const parts = (name ?? '').trim().split(' ');
  const abbr = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0]?.slice(0, 2) ?? '?').toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.28),
        background: 'linear-gradient(135deg, #3940A0 0%, #34A0C5 100%)',
      }}
    >
      {abbr}
    </div>
  );
}

// ── Teacher Card ──────────────────────────────────────────────────────────────

function TeacherCard({ teacher }) {
  const subjectColor = SUBJECT_COLORS[teacher.subject_area] ?? SUBJECT_COLORS.default;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-3">
        <TeacherInitials name={teacher.teacher_name} size={80} />
        <div className="text-center space-y-1.5">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{teacher.teacher_name}</p>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
            {teacher.subject_area}
          </span>
        </div>
        {teacher.bio && (
          <p className="text-xs text-gray-500 text-center line-clamp-2 leading-relaxed">{teacher.bio}</p>
        )}
      </div>
      <div className="px-4 pb-4 mt-auto">
        <Link
          href={`/student/dashboard/teachers/${teacher.id}`}
          className="w-full inline-flex items-center justify-center border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 text-xs h-8 rounded-md px-4 transition-colors"
        >
          View Classes
        </Link>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function TeachersSection() {
  const [query, setQuery] = useState('');

  const filtered = MOCK_TUTORS.filter((t) => {
    const q = query.toLowerCase();
    return (
      t.teacher_name.toLowerCase().includes(q) ||
      t.subject_area.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">Teachers</h2>
          <span className="text-sm text-gray-400">•&nbsp;{MOCK_TUTORS.length} on platform</span>
        </div>
        <div className="relative sm:max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 h-9 rounded-lg border border-input bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">No teachers match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      )}
    </div>
  );
}
