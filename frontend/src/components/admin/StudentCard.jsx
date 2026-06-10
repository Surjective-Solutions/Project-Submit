'use client';

import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATUS_STYLES = {
  ACTIVE: { bg: 'bg-green-100', text: 'text-green-700' },
  INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-600' },
  SUSPENDED: { bg: 'bg-red-100', text: 'text-red-700' },
  GRADUATED: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

const STREAM_COLORS = {
  'Physical Science': 'bg-blue-50 text-blue-700',
  'Biological Science': 'bg-green-50 text-green-700',
  Commerce: 'bg-amber-50 text-amber-700',
  Arts: 'bg-pink-50 text-pink-700',
  Technology: 'bg-violet-50 text-violet-700',
  'Combined Mathematics': 'bg-cyan-50 text-cyan-700',
  default: 'bg-gray-100 text-gray-600',
};

function Initials({ firstName, lastName }) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return '?';
}

export default function StudentCard({ student, onView, onEdit }) {
  const statusStyle = STATUS_STYLES[student.status] ?? STATUS_STYLES.INACTIVE;
  const streamColor = STREAM_COLORS[student.subject_stream] ?? STREAM_COLORS.default;
  const fullName = `${student.first_name} ${student.last_name}`;

  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Avatar + name */}
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0" aria-hidden="true">
          {student.profile_photo_url ? (
            <img src={student.profile_photo_url} alt={fullName} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #3940A0 0%, #34A0C5 100%)' }}
            >
              <Initials firstName={student.first_name} lastName={student.last_name} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate leading-snug">{fullName}</p>
          <span className="inline-block mt-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            {student.student_number}
          </span>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        {student.grade && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700">
            {student.grade}
          </span>
        )}
        {student.subject_stream && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${streamColor}`}>
            {student.subject_stream}
          </span>
        )}
      </div>

      {/* Contact */}
      <div className="space-y-0.5 text-sm text-gray-500 min-w-0">
        {student.email && <p className="truncate">{student.email}</p>}
        <p>{student.contact_number}</p>
      </div>

      {/* Status + actions */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border mt-auto">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
          {student.status}
        </span>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => onView(student)}>
            <Eye className="h-3 w-3" />
            View
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => onEdit(student)}>
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
