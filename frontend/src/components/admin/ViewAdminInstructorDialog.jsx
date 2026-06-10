'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

function Initials({ firstName, lastName }) {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();
  if (f && l) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  return '?';
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide shrink-0 pt-0.5">{label}</p>
      <p className="text-sm text-gray-800 text-right">{value}</p>
    </div>
  );
}

export default function ViewAdminInstructorDialog({ open, onOpenChange, instructor }) {
  const [showPassword, setShowPassword] = useState(false);

  if (!instructor) return null;

  const fullName = `${instructor.first_name} ${instructor.last_name}`;
  const isActive = instructor.status === 'ACTIVE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #053A34 0%, #0d6b5e 100%)' }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
            aria-hidden="true"
          >
            <Initials firstName={instructor.first_name} lastName={instructor.last_name} />
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">{fullName}</DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0 font-mono">
              {instructor.employee_id}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-1">
          {/* Status */}
          <div className="flex items-center justify-between py-1.5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {instructor.status}
            </span>
          </div>

          <Separator />

          <InfoRow label="Employee ID" value={instructor.employee_id} />
          <InfoRow label="Subject Area" value={instructor.subject_area} />
          <InfoRow label="Contact" value={instructor.contact_number} />
          <InfoRow label="Email" value={instructor.email} />

          <Separator />

          {/* Masked password */}
          <div className="flex items-center justify-between py-1.5">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Password</p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-gray-800">
                {showPassword ? 'SubmitX@2024' : '••••••••'}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
