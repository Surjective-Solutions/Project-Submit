'use client';

import { useState } from 'react';
import { BookOpen, User, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MOCK_STUDENT_ENROLLED_CLASSES } from '@/lib/mock-data';

// ── Helpers ───────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = {
  Mathematics:          'bg-blue-50 text-blue-700',
  Physics:              'bg-orange-50 text-orange-700',
  Chemistry:            'bg-purple-50 text-purple-700',
  Biology:              'bg-green-50 text-green-700',
  'English Literature': 'bg-pink-50 text-pink-700',
  'Combined Mathematics': 'bg-cyan-50 text-cyan-700',
  default:              'bg-gray-100 text-gray-600',
};

const PAYMENT_BADGE = {
  PAID:     { label: 'Paid',             className: 'bg-green-500 text-white' },
  PENDING:  { label: 'Payment Pending',  className: 'bg-amber-500 text-white' },
  REJECTED: { label: 'Payment Rejected', className: 'bg-red-500 text-white'   },
};

const PAYMENT_BANNER = {
  PAID: {
    className: 'bg-green-50 border border-green-200 text-green-800',
    text: 'Your payment has been approved. You have full access to this class.',
  },
  PENDING: {
    className: 'bg-amber-50 border border-amber-200 text-amber-800',
    text: 'Your payment slip is under review. Access will be granted once approved.',
  },
  REJECTED: {
    className: 'bg-red-50 border border-red-200 text-red-800',
    text: 'Your payment was rejected. Please contact the cashier to resolve this.',
  },
};

function formatLKR(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK')}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── View Class Dialog ─────────────────────────────────────────────────────────

function ViewClassDialog({ open, onOpenChange, cls }) {
  if (!cls) return null;
  const subjectColor = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.default;
  const banner = PAYMENT_BANNER[cls.payment_status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh]"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Fixed header */}
        <div
          className="px-6 py-5 flex items-center gap-3 shrink-0"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0 truncate">
              {cls.class_name}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">
              {cls.class_year}
            </DialogDescription>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="px-6 py-5 space-y-4">

            {/* Class image */}
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={cls.image_url ?? 'https://placehold.co/400x200?text=Class+Image'}
                alt={cls.class_name}
                className="w-full object-cover"
                style={{ maxHeight: '180px' }}
              />
            </div>

            {/* Payment status banner */}
            <div className={`rounded-xl px-4 py-3 text-sm ${banner.className}`}>
              {banner.text}
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                { label: 'Class Name',    value: cls.class_name },
                { label: 'Year',          value: cls.class_year },
                { label: 'Subject',       value: <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>{cls.subject}</span> },
                { label: 'Teacher',       value: cls.teacher_name },
                { label: 'Monthly Fee',   value: formatLKR(cls.monthly_fee) },
                { label: 'Enrolled',      value: formatDate(cls.enrolled_at) },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-sm text-gray-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {cls.description && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">About</p>
                <p className="text-sm text-gray-600 leading-relaxed">{cls.description}</p>
              </div>
            )}

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

// ── Class Card ────────────────────────────────────────────────────────────────

function ClassCard({ cls, onView }) {
  const subjectColor = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.default;
  const badge = PAYMENT_BADGE[cls.payment_status];

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image with payment badge overlay */}
      <div className="relative" style={{ aspectRatio: '16/9' }}>
        <img
          src={cls.image_url ?? 'https://placehold.co/400x200?text=Class+Image'}
          alt={cls.class_name}
          className="w-full h-full object-cover"
        />
        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Payment status badge */}
        <span className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-1 rounded-full ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2.5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight flex-1">{cls.class_name}</h3>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0 whitespace-nowrap">
            {cls.class_year}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{cls.teacher_name}</span>
        </div>

        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium w-fit ${subjectColor}`}>
          {cls.subject}
        </span>
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <Button
          variant="outline"
          className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 text-xs h-8"
          onClick={() => onView(cls)}
        >
          View
        </Button>
      </div>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export default function MyClassesSection() {
  const [viewClass, setViewClass] = useState(null);
  const [query, setQuery] = useState('');

  const filtered = MOCK_STUDENT_ENROLLED_CLASSES.filter((cls) => {
    const q = query.toLowerCase();
    return (
      cls.class_name.toLowerCase().includes(q) ||
      cls.teacher_name.toLowerCase().includes(q) ||
      cls.subject.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2.5 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">My Classes</h2>
          <span className="text-sm text-gray-400">•&nbsp;{MOCK_STUDENT_ENROLLED_CLASSES.length} enrolled</span>
        </div>
        <div className="relative sm:max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by class, teacher, subject…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 pr-3 h-9 rounded-lg border border-input bg-white text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">No classes match your search.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((cls) => (
            <ClassCard key={cls.id} cls={cls} onView={setViewClass} />
          ))}
        </div>
      )}

      <ViewClassDialog
        open={!!viewClass}
        onOpenChange={(o) => !o && setViewClass(null)}
        cls={viewClass}
      />
    </div>
  );
}
