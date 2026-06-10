'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MOCK_TUTORS, MOCK_STUDENT_ENROLLED_CLASSES, MOCK_TEACHER_CLASSES } from '@/lib/mock-data';

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

function formatLKR(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK')}`;
}

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

// ── View Teacher Dialog ───────────────────────────────────────────────────────

function ViewTeacherDialog({ open, onOpenChange, teacher }) {
  if (!teacher) return null;

  const subjectColor = SUBJECT_COLORS[teacher.subject] ?? SUBJECT_COLORS.default;

  // Classes from enrolled list that match this teacher
  const enrolledMatches = MOCK_STUDENT_ENROLLED_CLASSES.filter(
    (c) => c.teacher_name === teacher.displayName
  );

  // Fallback: show MOCK_TEACHER_CLASSES entries with teacher info injected
  const classRows = enrolledMatches.length > 0
    ? enrolledMatches.map((c) => ({
        id: c.id,
        name: c.class_name,
        year: c.class_year,
        fee: c.monthly_fee,
      }))
    : MOCK_TEACHER_CLASSES.slice(0, 3).map((c) => ({
        id: c.id,
        name: c.title,
        year: '2026',
        fee: c.fee,
      }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[90vh]"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Fixed header */}
        <div
          className="px-6 py-5 flex items-center gap-3 shrink-0"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <TeacherInitials name={teacher.displayName} size={44} />
          <div className="min-w-0">
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0 truncate">
              {teacher.displayName}
            </DialogTitle>
            <DialogDescription className="mt-1 m-0">
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
                {teacher.subject}
              </span>
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">

            {/* Contact info */}
            <div className="grid grid-cols-2 gap-3">
              {teacher.email && (
                <div className="col-span-2">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-sm text-gray-700">{teacher.email}</p>
                </div>
              )}
              {teacher.contactNumber && (
                <div>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Contact</p>
                  <p className="text-sm text-gray-700">{teacher.contactNumber}</p>
                </div>
              )}
            </div>

            {/* Classes */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  Classes by this Teacher
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="space-y-2">
                {classRows.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 leading-tight truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.year}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-semibold text-gray-700">{formatLKR(c.fee)}<span className="text-gray-400 font-normal">/mo</span></span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-2.5"
                        onClick={() => toast.info('Enrollment flow coming soon')}
                      >
                        Enroll
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-1" />
          </div>
        </div>

        {/* Fixed footer */}
        <div className="shrink-0 flex items-center justify-end px-6 py-4 border-t bg-gray-50/60 rounded-b-xl">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Teacher Card ──────────────────────────────────────────────────────────────

function TeacherCard({ teacher, onView }) {
  const subjectColor = SUBJECT_COLORS[teacher.subject] ?? SUBJECT_COLORS.default;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center pt-6 pb-4 px-4 gap-3">
        <TeacherInitials name={teacher.displayName} size={80} />
        <div className="text-center space-y-1.5">
          <p className="font-semibold text-gray-900 text-sm leading-tight">{teacher.displayName}</p>
          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
            {teacher.subject}
          </span>
        </div>
        {teacher.bio && (
          <p className="text-xs text-gray-500 text-center line-clamp-2 leading-relaxed">{teacher.bio}</p>
        )}
      </div>
      <div className="px-4 pb-4 mt-auto">
        <Button
          variant="outline"
          className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 text-xs h-8"
          onClick={() => onView(teacher)}
        >
          View Classes
        </Button>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function TeachersSection() {
  const [viewTeacher, setViewTeacher] = useState(null);
  const [query, setQuery] = useState('');

  const filtered = MOCK_TUTORS.filter((t) => {
    const q = query.toLowerCase();
    return (
      t.displayName.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q)
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
            <TeacherCard key={teacher.id} teacher={teacher} onView={setViewTeacher} />
          ))}
        </div>
      )}

      <ViewTeacherDialog
        open={!!viewTeacher}
        onOpenChange={(o) => !o && setViewTeacher(null)}
        teacher={viewTeacher}
      />
    </div>
  );
}
