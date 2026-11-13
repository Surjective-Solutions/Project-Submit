'use client';

import { useEffect, useRef } from 'react';
import Icon from '@/components/admin/Icon';
import styles from './classes.module.css';

const FOCUSABLE =
  'button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

// A dialog shell: dark overlay, header with an icon tile and a close button, scrolling body, footer.
// Focus goes into the dialog (the element marked data-autofocus, else the first control), Tab stays inside,
// Escape closes it, the page behind stops scrolling, and focus returns to what opened it.
// Render it only while it is open.
export default function Dialog({
  title,
  titleId,
  icon,
  tone = 'navy',
  role = 'dialog',
  size = 'md',
  closeOnOverlay = true,
  onClose,
  tabs = null,
  footer = null,
  children,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const root = dialogRef.current;
    const target =
      root?.querySelector('[data-autofocus]') ||
      [...(root?.querySelectorAll(FOCUSABLE) || [])].find((el) => !el.closest('[hidden]') && el.getAttribute('aria-label') !== 'Close');
    target?.focus();
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
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter((el) => !el.closest('[hidden]'));
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
      data-testid="modal-overlay"
      onMouseDown={(event) => {
        if (closeOnOverlay && event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className={styles.modal}
        style={{ maxWidth: size === 'lg' ? 680 : size === 'sm' ? 440 : undefined }}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
      >
        <header className={styles.modalHeader}>
          <span
            className={styles.modalIcon}
            style={tone === 'red' ? { background: '#fdecec', color: '#b3141a' } : undefined}
            aria-hidden="true"
          >
            <Icon name={icon} size={22} weight={500} />
          </span>
          <h2 id={titleId} className={styles.modalTitle}>
            {title}
          </h2>
          <button type="button" className={styles.iconButton} onClick={onClose} aria-label="Close">
            <Icon name="close" size={22} weight={500} />
          </button>
        </header>
        {tabs}
        <div className={styles.modalBody}>{children}</div>
        {footer && <footer className={styles.modalFooter}>{footer}</footer>}
      </div>
    </div>
  );
}
