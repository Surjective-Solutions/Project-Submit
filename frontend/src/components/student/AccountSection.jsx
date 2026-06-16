'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import EditProfileDialog from './EditProfileDialog';
import { MOCK_LOGGED_IN_STUDENT } from '@/lib/mock-data';

const STATUS_STYLES = {
  ACTIVE:    'bg-green-100 text-green-700',
  INACTIVE:  'bg-gray-100 text-gray-600',
  SUSPENDED: 'bg-red-100 text-red-700',
  GRADUATED: 'bg-blue-100 text-blue-700',
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

export default function AccountSection() {
  const [student, setStudent] = useState(MOCK_LOGGED_IN_STUDENT);
  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const initials = `${student.first_name[0]}${student.last_name[0]}`.toUpperCase();
  const statusClass = STATUS_STYLES[student.status] ?? STATUS_STYLES.INACTIVE;

  async function handleSave(data) {
    setEditLoading(true);
    try {
      setStudent((prev) => ({ ...prev, ...data }));
      toast.success('Profile updated');
      setEditOpen(false);
    } finally {
      setEditLoading(false);
    }
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[700px] space-y-6">

        {/* Avatar + student number + status */}
        <div className="flex flex-col items-center gap-3 py-6">
          {student.profile_photo_url ? (
            <img
              src={student.profile_photo_url}
              alt={`${student.first_name} ${student.last_name}`}
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
            <p className="text-lg font-bold text-gray-900">{student.first_name} {student.last_name}</p>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
              {student.student_number}
            </span>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${statusClass}`}>
              {student.status}
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

        {/* Profile details card */}
        <div className="bg-white rounded-2xl border border-border shadow-sm px-6 py-5 space-y-5">

          <SectionDivider label="Personal Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name"      value={student.first_name} />
            <Field label="Last Name"       value={student.last_name} />
            <Field label="Date of Birth"   value={student.date_of_birth} />
            <Field label="Gender"          value={student.gender} />
            <Field label="Contact Number"  value={student.contact_number} />
            <Field label="WhatsApp"        value={student.whatsapp_number} />
            <Field label="Email"           value={student.email} />
          </div>

          <SectionDivider label="Academic Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="School"         value={student.school_name} />
            <Field label="Grade"          value={student.grade} />
            <Field label="Subject Stream" value={student.subject_stream} />
            <Field label="District"       value={student.district} />
          </div>

          <SectionDivider label="Guardian Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Guardian Name"    value={student.guardian_name} />
            <Field label="Guardian Contact" value={student.guardian_contact} />
          </div>

          <SectionDivider label="Address" />
          <Field label="Full Address" value={student.address} />

        </div>
      </div>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        student={student}
        onSave={handleSave}
        isLoading={editLoading}
      />
    </div>
  );
}
