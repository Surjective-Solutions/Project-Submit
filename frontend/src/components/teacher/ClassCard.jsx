'use client';

import { Eye, Pencil, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const SUBJECT_COLORS = {
  Mathematics: 'bg-blue-100 text-blue-700',
  Biology: 'bg-green-100 text-green-700',
  Chemistry: 'bg-purple-100 text-purple-700',
  Physics: 'bg-orange-100 text-orange-700',
  English: 'bg-pink-100 text-pink-700',
  default: 'bg-gray-100 text-gray-700',
};

export default function ClassCard({ classItem, onView, onEdit, onToggleStatus }) {
  const isActive = classItem.status === 'ACTIVE';
  const subjectColor = SUBJECT_COLORS[classItem.subject] ?? SUBJECT_COLORS.default;

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Image banner */}
      <div className="h-36 relative shrink-0" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3940A0 100%)' }}>
        {classItem.imageUrl ? (
          <img
            src={classItem.imageUrl}
            alt={classItem.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-white/30" />
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-2 right-2">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={
              isActive
                ? { background: 'rgba(34,197,94,0.2)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.3)' }
                : { background: 'rgba(107,114,128,0.2)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.3)' }
            }
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-gray-900 leading-snug truncate">{classItem.title}</h3>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${subjectColor}`}>
              {classItem.subject}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-50 text-indigo-700">
              {classItem.grade}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {classItem.description}
        </p>

        <div className="text-sm font-semibold text-gray-900">
          LKR {classItem.fee.toLocaleString()}
          <span className="text-xs font-normal text-gray-400 ml-1">/ month</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-border">
          <div className="flex items-center gap-1.5 mr-auto">
            <Switch
              checked={isActive}
              onCheckedChange={() => onToggleStatus(classItem)}
            />
            <span className="text-xs text-gray-500">{isActive ? 'Active' : 'Inactive'}</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => onView(classItem)}>
            <Eye className="h-3.5 w-3.5" />
            View
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => onEdit(classItem)}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
}
