'use client';

import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function Initials({ name }) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

export default function InstructorCard({ instructor, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #34A0C5 0%, #3940A0 100%)' }}
          aria-hidden="true"
        >
          <Initials name={instructor.name} />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{instructor.name}</p>
          <p className="text-xs text-gray-500 font-mono mt-0.5">{instructor.employee_id}</p>
        </div>
      </div>

      {/* Status */}
      <div>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={
            instructor.status === 'ACTIVE'
              ? { background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }
              : { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.2)' }
          }
        >
          {instructor.status}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => onView(instructor)}>
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => onEdit(instructor)}>
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          onClick={() => onDelete(instructor)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
