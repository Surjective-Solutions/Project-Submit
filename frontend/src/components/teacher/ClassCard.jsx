'use client';

import Link from 'next/link';
import { Eye, Pencil, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function ClassCard({ classItem, onEdit, onToggleStatus }) {
  const isActive = classItem.status === 'ACTIVE';

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      {/* Header banner */}
      <div className="h-28 relative shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3940A0 100%)' }}>
        <BookOpen className="h-10 w-10 text-white/30" />
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
          <h3 className="font-semibold text-gray-900 leading-snug truncate">{classItem.display_name}</h3>
          <div className="mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-sky-100 text-sky-700">
              {classItem.subject_name}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1">
          {classItem.description}
        </p>

        <div className="text-sm font-semibold text-gray-900">
          LKR {classItem.monthly_fee.toLocaleString()}
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
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            className="gap-1"
            render={<Link href={`/teacher/dashboard/classes/${classItem.id}`} />}
          >
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
