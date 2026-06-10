'use client';

import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Initials({ firstName, lastName }) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return '?';
}

const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-50 text-blue-700',
  Physics: 'bg-orange-50 text-orange-700',
  Chemistry: 'bg-purple-50 text-purple-700',
  Biology: 'bg-green-50 text-green-700',
  'English Literature': 'bg-pink-50 text-pink-700',
  default: 'bg-gray-100 text-gray-600',
};

export default function AdminInstructorCard({ instructor, onView, onEdit }) {
  const fullName = `${instructor.first_name} ${instructor.last_name}`;
  const subjectColor = SUBJECT_COLORS[instructor.subject_area] ?? SUBJECT_COLORS.default;
  const isActive = instructor.status === 'ACTIVE';

  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      {/* Avatar + name */}
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #E9D848 0%, #d4c030 100%)', color: '#1a1a00' }}
          aria-hidden="true"
        >
          <Initials firstName={instructor.first_name} lastName={instructor.last_name} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900 truncate leading-snug">{fullName}</p>
          <span className="inline-block mt-1 text-[11px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
            {instructor.employee_id}
          </span>
        </div>
      </div>

      {/* Subject badge */}
      {instructor.subject_area && (
        <div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
            {instructor.subject_area}
          </span>
        </div>
      )}

      {/* Contact */}
      <div className="space-y-0.5 text-sm text-gray-500 min-w-0">
        {instructor.email && <p className="truncate">{instructor.email}</p>}
        <p>{instructor.contact_number}</p>
      </div>

      {/* Status + actions */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border mt-auto">
        <span
          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {instructor.status}
        </span>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => onView(instructor)}>
            <Eye className="h-3 w-3" />
            View
          </Button>
          <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => onEdit(instructor)}>
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
