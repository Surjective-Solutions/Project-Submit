'use client';

import { BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ViewClassDialog({ open, onOpenChange, classItem }) {
  if (!classItem) return null;

  const isActive = classItem.status === 'ACTIVE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #5a62ff 100%)' }}
        >
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            {classItem.imageUrl ? (
              <img src={classItem.imageUrl} alt={classItem.title} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <BookOpen className="h-5 w-5 text-white" />
            )}
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">
              {classItem.title}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0">
              {classItem.subject} · {classItem.grade}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <Row label="Status">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={
                isActive
                  ? { background: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' }
                  : { background: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.2)' }
              }
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </Row>
          <Row label="Subject">{classItem.subject}</Row>
          <Row label="Grade">{classItem.grade}</Row>
          <Row label="Monthly Fee">LKR {classItem.fee.toLocaleString()}</Row>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{classItem.description}</p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide shrink-0">{label}</p>
      <p className="text-sm text-gray-900 text-right">{children}</p>
    </div>
  );
}
