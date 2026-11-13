'use client';

import Dialog from './Dialog';
import sessionStyles from './sessions.module.css';
import styles from './classes.module.css';

// Asks before something is deleted. Focus starts on Cancel so Enter never deletes by accident.
export default function ConfirmDialog({ title, message, confirmLabel, busy = false, error = '', onConfirm, onCancel }) {
  return (
    <Dialog
      title={title}
      titleId="confirm-title"
      icon="delete"
      tone="red"
      role="alertdialog"
      size="sm"
      onClose={busy ? () => {} : onCancel}
      closeOnOverlay={!busy}
      footer={
        <>
          <button type="button" className={styles.secondaryButton} onClick={onCancel} disabled={busy} data-autofocus>
            Cancel
          </button>
          <button type="button" className={sessionStyles.dangerButton} onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting…' : confirmLabel}
          </button>
        </>
      }
    >
      <p className={sessionStyles.confirmText}>{message}</p>
      {error && (
        <p className={sessionStyles.formError} role="alert">
          {error}
        </p>
      )}
    </Dialog>
  );
}
