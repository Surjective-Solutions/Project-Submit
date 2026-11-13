'use client';

import { useEffect, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import styles from './classes.module.css';

const FOCUSABLE = 'button:not([disabled]), select:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

// "Create class" dialog. The class details form is still to be designed, so for now it only picks the tutor.
// Render it only while it is open; it is pre-filled with `initialTutorId` (empty from the directory).
export default function CreateClassModal({ tutors, initialTutorId = '', onClose }) {
  const [tutorId, setTutorId] = useState(initialTutorId);
  const dialogRef = useRef(null);
  const selectRef = useRef(null);

  // Focus goes into the dialog, the page behind stops scrolling, and both are undone on close.
  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    selectRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (opener && typeof opener.focus === 'function') opener.focus();
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    // Keep Tab inside the dialog.
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      data-testid="modal-overlay"
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-class-title"
        onKeyDown={handleKeyDown}
      >
        <header className={styles.modalHeader}>
          <span className={styles.modalIcon} aria-hidden="true">
            <Icon name="add_circle" size={22} weight={500} />
          </span>
          <h2 id="create-class-title" className={styles.modalTitle}>
            Create class
          </h2>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={22} weight={500} />
          </button>
        </header>

        <div className={styles.modalBody}>
          <div className={styles.field}>
            <label htmlFor="create-class-tutor" className={styles.label}>
              Tutor{' '}
              <span className={styles.req} aria-hidden="true">
                *
              </span>
            </label>
            <div className={styles.selectWrap}>
              <select
                id="create-class-tutor"
                ref={selectRef}
                className={styles.select}
                value={tutorId}
                onChange={(event) => setTutorId(event.target.value)}
                aria-required="true"
              >
                <option value="">Select a tutor</option>
                {tutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.name} — {tutor.level} {tutor.subject}
                  </option>
                ))}
              </select>
              <span className={styles.selectIcon} aria-hidden="true">
                <Icon name="expand_more" size={22} weight={500} />
              </span>
            </div>
          </div>

          <div className={styles.placeholder} data-testid="form-placeholder">
            <Icon name="edit_note" size={26} weight={400} />
            <p className={styles.placeholderTitle}>Class details</p>
            <p className={styles.placeholderText}>The class details form will be added here.</p>
          </div>
        </div>

        <footer className={styles.modalFooter}>
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={styles.primaryButton} disabled>
            Create class
          </button>
        </footer>
      </div>
    </div>
  );
}
