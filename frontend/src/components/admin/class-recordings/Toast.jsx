'use client';

import { useEffect } from 'react';
import Icon from '@/components/admin/Icon';
import styles from './classRecordings.module.css';

const TOAST_MS = 3200;

// `toast` is { id, message } (a new id shows it again). `onDone` clears it.
export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDone, TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast, onDone]);

  if (!toast) return null;
  return (
    <div className={styles.toastWrap}>
      <div className={styles.toast} role="status" aria-live="polite" key={toast.id}>
        <Icon name="check_circle" size={18} fill={1} />
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
