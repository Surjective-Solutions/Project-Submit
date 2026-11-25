'use client';

import { useEffect } from 'react';
import { CheckIcon, CloseIcon } from './icons';
import styles from './instructors.module.css';

const HIDE_AFTER_MS = 6000;

// A message that hides itself after 6 seconds (or when closed). tone: 'success' (green) | 'neutral' (navy).
export default function Toast({ toast, onClose }) {
  const id = toast?.id;
  useEffect(() => {
    if (!id) return undefined;
    const timer = setTimeout(onClose, HIDE_AFTER_MS);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  if (!toast) return null;
  return (
    <div className={styles.toastWrap}>
      <div role="status" className={`${styles.toast} ${toast.tone === 'neutral' ? styles.toastNeutral : styles.toastSuccess}`}>
        <span className={styles.toastIcon}>
          <CheckIcon size={16} strokeWidth={2.4} />
        </span>
        <span className={styles.toastText}>{toast.message}</span>
        <button type="button" className={styles.toastClose} onClick={onClose} aria-label="Dismiss message">
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  );
}
