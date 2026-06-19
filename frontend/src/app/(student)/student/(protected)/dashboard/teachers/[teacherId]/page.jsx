'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { useEnrolledClasses } from '@/context/EnrolledClassesContext';
import { MOCK_TUTORS } from '@/lib/mock-data';
import { getLastPaidMonth } from '@/lib/billing-utils';

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

function TeacherInitials({ name, size = 48 }) {
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

// ── Class Card ────────────────────────────────────────────────────────────────

function ClassCard({ cls, enrolledEntry, onAdd, onRemove }) {
  const subjectColor = SUBJECT_COLORS[cls.subject] ?? SUBJECT_COLORS.default;
  const isEnrolled = !!enrolledEntry;
  const canRemove = isEnrolled && getLastPaidMonth(enrolledEntry?.monthly_payments) === null;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: '16/9' }}>
        {cls.image_url ? (
          <img
            src={cls.image_url}
            alt={cls.class_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100">
            <BookOpen className="h-10 w-10 text-indigo-300" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{cls.class_name}</h3>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0 whitespace-nowrap font-medium">
              {cls.class_year}
            </span>
          </div>
          <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
            {cls.subject}
          </span>
          <p className="text-xs text-gray-400">
            {formatLKR(cls.monthly_fee)}{' '}
            <span className="text-gray-300">/ month</span>
          </p>
        </div>

        {/* Footer button */}
        <div className="mt-auto pt-1">
          {!isEnrolled ? (
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9"
              onClick={() => onAdd(cls)}
            >
              Add to My Classes
            </Button>
          ) : canRemove ? (
            <div className="flex gap-2">
              <div className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-medium cursor-default select-none">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                Already Added
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                onClick={() => onRemove(cls)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-lg border border-green-200 bg-green-50 text-green-700 text-xs font-medium cursor-default select-none">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              Already Added
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TeacherClassesPage() {
  const { teacherId } = useParams();
  const teacher = MOCK_TUTORS.find((t) => t.id === teacherId);
  const { classes, addClass, removeClass } = useEnrolledClasses();
  const [classToRemove, setClassToRemove] = useState(null);

  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500 text-sm">Teacher not found.</p>
        <Button variant="outline" asChild>
          <Link href="/student/dashboard?section=teachers">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Teachers
          </Link>
        </Button>
      </div>
    );
  }

  const subjectColor = SUBJECT_COLORS[teacher.subject_area] ?? SUBJECT_COLORS.default;

  function getEnrolledEntry(classId) {
    return classes.find((c) => c.id === classId) ?? null;
  }

  function handleAdd(cls) {
    if (getEnrolledEntry(cls.id)) return;
    addClass({
      id: cls.id,
      class_name: cls.class_name,
      class_year: cls.class_year,
      teacher_name: teacher.teacher_name,
      subject: cls.subject,
      image_url: cls.image_url,
      enrolled_at: new Date().toISOString(),
      monthly_fee: cls.monthly_fee,
      description: cls.description ?? '',
      monthly_payments: [],
      papers_by_month: [],
    });
    toast.success('Added to My Classes! Complete your payment to get access.');
  }

  function handleConfirmRemove() {
    if (!classToRemove) return;
    removeClass(classToRemove.id);
    toast.success('Class removed');
    setClassToRemove(null);
  }

  const classCount = teacher.classes.length;

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="bg-white rounded-xl border border-border px-5 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/student/dashboard?section=teachers"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="w-px h-10 bg-gray-200 shrink-0" />
          <TeacherInitials name={teacher.teacher_name} size={48} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-bold text-gray-900 leading-tight">{teacher.teacher_name}</h1>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
                {teacher.subject_area}
              </span>
            </div>
            {teacher.bio && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{teacher.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Classes grid */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            Classes by {teacher.teacher_name}
          </h2>
          <span className="text-sm text-gray-400">
            •&nbsp;{classCount} {classCount === 1 ? 'class' : 'classes'}
          </span>
        </div>

        {classCount === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
            <BookOpen className="h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-400">No classes listed yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teacher.classes.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                enrolledEntry={getEnrolledEntry(cls.id)}
                onAdd={handleAdd}
                onRemove={setClassToRemove}
              />
            ))}
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!classToRemove}
        onOpenChange={(o) => !o && setClassToRemove(null)}
        title="Remove Class"
        description={
          classToRemove
            ? `Are you sure you want to remove "${classToRemove.class_name}" from your classes? You can add it again later.`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}
