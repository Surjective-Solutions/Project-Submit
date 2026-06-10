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

const STATUS_STYLES = {
  ACTIVE: { bg: 'rgba(34,197,94,0.1)', color: '#16a34a', border: '1px solid rgba(34,197,94,0.2)' },
  INACTIVE: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', border: '1px solid rgba(107,114,128,0.2)' },
  SUSPENDED: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)' },
  GRADUATED: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)' },
};

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

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1 mb-1">
      {children}
    </p>
  );
}

export default function ViewStudentDialog({ open, onOpenChange, student }) {
  const [showPassword, setShowPassword] = useState(false);

  if (!student) return null;

  const fullName = `${student.first_name} ${student.last_name}`;
  const statusStyle = STATUS_STYLES[student.status] ?? STATUS_STYLES.INACTIVE;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-5 flex items-center gap-3"
          style={{ background: 'linear-gradient(135deg, #3940A0 0%, #34A0C5 100%)' }}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0" aria-hidden="true">
            {student.profile_photo_url ? (
              <img src={student.profile_photo_url} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base font-bold text-white bg-white/20">
                <Initials firstName={student.first_name} lastName={student.last_name} />
              </div>
            )}
          </div>
          <div>
            <DialogTitle className="text-white text-base font-semibold leading-tight m-0">{fullName}</DialogTitle>
            <DialogDescription className="text-white/60 text-xs mt-0.5 m-0 font-mono">
              {student.student_number}
            </DialogDescription>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between py-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={statusStyle}
            >
              {student.status}
            </span>
          </div>

          <Separator />

          <SectionLabel>Personal Info</SectionLabel>
          <InfoRow label="Date of Birth" value={student.date_of_birth} />
          <InfoRow label="Gender" value={student.gender} />
          <InfoRow label="Contact" value={student.contact_number} />
          <InfoRow label="WhatsApp" value={student.whatsapp_number} />
          <InfoRow label="Email" value={student.email} />

          <Separator />

          <SectionLabel>Academic Info</SectionLabel>
          <InfoRow label="School" value={student.school_name} />
          <InfoRow label="Grade" value={student.grade} />
          <InfoRow label="Stream" value={student.subject_stream} />
          <InfoRow label="District" value={student.district} />

          <Separator />

          <SectionLabel>Guardian Info</SectionLabel>
          <InfoRow label="Name" value={student.guardian_name} />
          <InfoRow label="Contact" value={student.guardian_contact} />

          {student.address && (
            <>
              <Separator />
              <SectionLabel>Address</SectionLabel>
              <p className="text-sm text-gray-800 leading-relaxed">{student.address}</p>
            </>
          )}

          <Separator />

          <SectionLabel>Account</SectionLabel>
          {/* Masked password row */}
          <div className="flex items-center justify-between py-1">
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

          <div className="flex justify-end pt-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
