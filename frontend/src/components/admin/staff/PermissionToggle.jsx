'use client';

import styles from './staff.module.css';

export default function PermissionToggle({ label, note, checked, onChange }) {
  return (
    <div className={styles.permissionRow}>
      <div className={styles.permissionText}>
        <span className={styles.permissionLabel}>{label}</span>
        {note && <span className={styles.permissionNote}>{note}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={styles.toggleTrack}
        data-on={checked}
        onClick={() => onChange(!checked)}
      >
        <span className={styles.toggleThumb} />
      </button>
    </div>
  );
}