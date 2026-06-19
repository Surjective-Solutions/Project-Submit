'use client';

import { Eye, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function Initials({ name }) {
  const parts = name.trim().split(/\s+/);
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Biology: 'bg-green-100 text-green-700',
  Chemistry: 'bg-purple-100 text-purple-700',
  Physics: 'bg-orange-100 text-orange-700',
  default: 'bg-gray-100 text-gray-700',
};

export default function StaffCard({ person, onView, onEdit, variant = 'tutor' }) {
  const name = variant === 'tutor' ? person.displayName : person.fullName;
  const subjectColor = SUBJECT_COLORS[person.subject] ?? SUBJECT_COLORS.default;

  return (
    <div className="bg-white border border-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Top: avatar + name */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden shrink-0" aria-hidden="true">
          {person.profilePhotoUrl ? (
            <img
              src={person.profilePhotoUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
              style={{ backgroundColor: '#3940A0' }}
            >
              <Initials name={name} />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{name}</p>
          {variant === 'tutor' && person.subject && (
            <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
              {person.subject}
            </span>
          )}
          {variant === 'cashier' && (
            <Badge className="mt-0.5 bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-xs">
              Cashier
            </Badge>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-1 text-sm text-gray-500 min-w-0">
        <p className="truncate">{person.email}</p>
        {person.contactNumber && <p>{person.contactNumber}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onView(person)}
        >
          <Eye className="h-3.5 w-3.5" />
          View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5"
          onClick={() => onEdit(person)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
    </div>
  );
}
