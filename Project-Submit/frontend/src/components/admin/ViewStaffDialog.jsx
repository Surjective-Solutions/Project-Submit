'use client';

import { useState } from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DeleteConfirmDialog from './DeleteConfirmDialog';

function Initials({ name }) {
  const parts = name.trim().split(/\s+/);
  const letters =
    parts.length >= 2
      ? parts[0][0] + parts[parts.length - 1][0]
      : parts[0].slice(0, 2);
  return letters.toUpperCase();
}

function DetailRow({ label, value }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-sm text-gray-900">{value || '—'}</p>
    </div>
  );
}

export default function ViewStaffDialog({ open, onOpenChange, person, variant, onDelete }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!person) return null;

  const name = variant === 'tutor' ? person.displayName : person.fullName;

  function handleDelete() {
    setShowDeleteConfirm(false);
    onOpenChange(false);
    onDelete(person.id);
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {variant === 'tutor' ? 'Tutor Details' : 'Cashier Details'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Avatar */}
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden" aria-hidden="true">
                {person.profilePhotoUrl ? (
                  <img
                    src={person.profilePhotoUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-xl font-bold text-white"
                    style={{ backgroundColor: '#3940A0' }}
                  >
                    <Initials name={name} />
                  </div>
                )}
              </div>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Name" value={name} />
              <DetailRow label="Email" value={person.email} />
              {person.contactNumber && (
                <DetailRow label="Contact" value={person.contactNumber} />
              )}
              {variant === 'tutor' && (
                <DetailRow label="Subject" value={person.subject} />
              )}
              <DetailRow label="Username" value={person.username} />
            </div>

            {/* Password row */}
            <div className="space-y-0.5">
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Password</p>
              <div className="flex items-center justify-between rounded-lg border border-input bg-muted px-3 py-2">
                <span className="text-sm font-mono text-gray-700 tracking-widest">
                  {showPassword ? person.password : '••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-gray-400 hover:text-gray-700 transition-colors ml-2"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Delete */}
            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete {variant === 'tutor' ? 'Tutor' : 'Cashier'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        name={name}
        onConfirm={handleDelete}
      />
    </>
  );
}
