'use client';

import { useState } from 'react';
import { Pencil, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import EditProfileDialog from './EditProfileDialog';
import { MOCK_LOGGED_IN_INSTRUCTOR } from '@/lib/mock-data';

const STATUS_STYLES = {
  ACTIVE:   'bg-green-100 text-green-700',
  INACTIVE: 'bg-gray-100 text-gray-600',
};

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || <span className="text-gray-400 italic">Not set</span>}</p>
    </div>
  );
}

function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 pt-1 pb-2">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
  );
}

function CopyButton({ value }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success('Instructor ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy Instructor ID"
      className="ml-1.5 p-1 rounded text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function formatMemberSince(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function AccountSection() {
  const [instructor, setInstructor] = useState(MOCK_LOGGED_IN_INSTRUCTOR);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const initials = `${instructor.first_name[0]}${instructor.last_name[0]}`.toUpperCase();
  const statusClass = STATUS_STYLES[instructor.status] ?? STATUS_STYLES.INACTIVE;

  async function handleSave(data) {
    setEditLoading(true);
    try {
      setInstructor((prev) => ({ ...prev, ...data }));
      toast.success('Profile updated');
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[700px] space-y-6">

        {/* Avatar + employee ID + status */}
        <div className="flex flex-col items-center gap-3 py-6">
          {instructor.profile_photo_url ? (
            <img
              src={instructor.profile_photo_url}
              alt={`${instructor.first_name} ${instructor.last_name}`}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100"
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white ring-4 ring-indigo-100"
              style={{ background: 'linear-gradient(135deg, #3940A0 0%, #34A0C5 100%)' }}
            >
              {initials}
            </div>
          )}

          <div className="flex flex-col items-center gap-1.5">
            <p className="text-lg font-bold text-gray-900">
              {instructor.first_name} {instructor.last_name}
            </p>
            <div className="flex items-center">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold tracking-wide">
                {instructor.employee_id}
              </span>
              <CopyButton value={instructor.employee_id} />
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusClass}`}>
              {instructor.status}
            </span>
          </div>

          <Button
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 gap-1.5"
            onClick={() => setEditOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </Button>
        </div>

        {/* Profile details */}
        <div className="bg-white rounded-2xl border border-border shadow-sm px-6 py-5 space-y-5">

          <SectionDivider label="Personal Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name"      value={instructor.first_name} />
            <Field label="Last Name"       value={instructor.last_name} />
            <Field label="Email"           value={instructor.email} />
            <Field label="Contact Number"  value={instructor.contact_number} />
          </div>

          <SectionDivider label="Professional Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Subject Area"  value={instructor.subject_area} />
            <Field label="Employee ID"   value={instructor.employee_id} />
            <Field label="Member Since"  value={formatMemberSince(instructor.created_at)} />
          </div>

        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        instructor={instructor}
        onSave={handleSave}
        isLoading={editLoading}
      />
    </div>
  );
}
