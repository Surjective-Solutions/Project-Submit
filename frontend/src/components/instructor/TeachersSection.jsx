'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { MOCK_LOGGED_IN_INSTRUCTOR, MOCK_INSTRUCTOR_TEACHERS } from '@/lib/mock-data';

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

function subjectColor(subject) {
  return SUBJECT_COLORS[subject] ?? SUBJECT_COLORS.default;
}

function TeacherInitials({ name, size = 80 }) {
  const parts = (name ?? '').trim().split(' ');
  const abbr =
    parts.length >= 2
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
  const color = subjectColor(teacher.subject_area);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-3">
        <TeacherInitials name={teacher.teacher_name} size={80} />
        <div className="text-center space-y-1.5">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{teacher.teacher_name}</p>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${color}`}>
            {teacher.subject_area}
          </span>
        </div>
        {teacher.bio && (
          <p className="text-xs text-gray-500 text-center line-clamp-2 leading-relaxed">
            {teacher.bio}
          </p>
        )}
      </div>
      <div className="px-4 pb-4 mt-auto">
        <Button
          variant="outline"
          nativeButton={false}
          className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 text-xs h-8"
          render={<Link href={`/instructor/dashboard/teachers/${teacher.id}`} />}
        >
          View Classes
        </Button>
      </div>
    </div>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success('Instructor ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy Instructor ID"
      className="ml-1.5 p-1 rounded text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function TeachersSection() {
  const instructor = MOCK_LOGGED_IN_INSTRUCTOR;

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 flex items-center gap-2.5 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">My Teachers</h2>
          <span className="text-sm text-gray-400">•&nbsp;{MOCK_INSTRUCTOR_TEACHERS.length} teachers</span>
        </div>

        {/* Instructor ID callout */}
        <div
          className="rounded-xl border px-4 py-3 space-y-1 min-w-0 sm:max-w-xs"
          style={{
            background: 'rgba(238,242,255,0.8)',
            borderColor: 'rgba(99,102,241,0.25)',
          }}
        >
          <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">
            Your Instructor ID
          </p>
          <div className="flex items-center">
            <span className="font-mono text-lg font-bold text-indigo-900 tracking-wide">
              {instructor.employee_id}
            </span>
            <CopyButton value={instructor.employee_id} />
          </div>
          <p className="text-[11px] text-gray-500 leading-snug">
            To get added to a teacher&apos;s class, share this ID with your teacher.
          </p>
        </div>
      </div>

      {/* Card grid */}
      {MOCK_INSTRUCTOR_TEACHERS.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">
          No teachers have added you yet. Share your Instructor ID with a teacher to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_INSTRUCTOR_TEACHERS.map((teacher) => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      )}
    </div>
  );
}
