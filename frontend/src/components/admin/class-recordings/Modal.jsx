'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Icon from '@/components/admin/Icon';
import styles from './classRecordings.module.css';

// A dialog over a dimmed backdrop. It closes on a backdrop click, the ✕ button or Esc, unless `dismissible` is false
// (while a video is uploading).
export default function Modal({ title, onClose, dismissible = true, children, footer }) {
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && dismissible) {
        event.stopPropagation();
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [dismissible, onClose]);

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose();
      }}
    >
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={title}>
        <div className={styles.modalHead}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button
            type="button"
            className={styles.iconBtn}
            aria-label="Close"
            disabled={!dismissible}
            onClick={onClose}
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer ? <div className={styles.modalFoot}>{footer}</div> : null}
      </div>
    </div>,
    document.body
  );
}
