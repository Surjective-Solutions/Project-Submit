'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

export default function ViewInstructorDialog({ open, onOpenChange, instructor }) {
  if (!instructor) return null;

  const isActive = instructor.status === 'ACTIVE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #053A34 0%, #0d6b5e 100%)' }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-hidden="true"
          >
            <Initials name={instructor.name} />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">
              {instructor.name}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">
              {instructor.employee_id}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Employee ID</p>
            <p className="text-sm font-mono text-gray-900">{instructor.employee_id}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
            <p className="text-sm text-gray-900">{instructor.name}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Status</p>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={
                isActive
                  ? { background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }
                  : { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.2)' }
              }
            >
              {instructor.status}
            </span>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
