'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/admin/Icon';
import styles from './staff.module.css';

// Asks the admin to confirm before an account is activated or deactivated.
// The action is worked out from the person's current status.
export default function ConfirmStatusDialog({ open, person, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSubmitting(false);
  }, [open, person]);

  if (!open || !person) return null;

  const activating = person.status === 'Inactive';

  async function handleConfirm() {
    setSubmitting(true);
    try {
      await onConfirm(person);
    } finally {
      onClose();
    }
  }

  return (
    <div className={styles.dialogOverlay} onClick={submitting ? undefined : onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.dialogHeader}>
          <h2 className={styles.dialogTitle}>{activating ? 'Activate account?' : 'Deactivate account?'}</h2>
          <button
            type="button"
            className={styles.iconCloseButton}
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <p className={styles.dialogNote} style={{ marginTop: 0 }}>
          {activating ? (
            <>
              Activate <strong>{person.fullName}</strong>? They&rsquo;ll be able to sign in again.
            </>
          ) : (
            <>
              Deactivate <strong>{person.fullName}</strong>? They&rsquo;ll be signed out of every device straight
              away and won&rsquo;t be able to sign in until you activate the account again.
            </>
          )}
        </p>

        <div className={styles.dialogActions}>
          <button type="button" className={styles.cancelButton} onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="button" className={styles.sendInviteButton} onClick={handleConfirm} disabled={submitting}>
            <Icon name={activating ? 'how_to_reg' : 'person_off'} size={18} weight={600} />
            {submitting
              ? activating
                ? 'Activating…'
                : 'Deactivating…'
              : activating
                ? 'Activate'
                : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
}