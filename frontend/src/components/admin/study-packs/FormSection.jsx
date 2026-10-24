'use client';

import Icon from '@/components/admin/Icon';
import styles from './study-packs.module.css';

// Card with the icon tile, title and subtitle that every form section shares.
export default function FormSection({ icon, title, subtitle, children }) {
  return (
    <section className={styles.formCard}>
      <header className={styles.sectionHeader}>
        <span className={styles.sectionIcon} aria-hidden="true">
          <Icon name={icon} size={19} />
        </span>
        <div className={styles.sectionText}>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionSubtitle}>{subtitle}</p>
        </div>
      </header>
      {children}
    </section>
  );
}

// Label, control and inline error message. `id` ties the label to the control.
export function Field({ id, label, required, error, hint, aside, children }) {
  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
          {required ? <span className={styles.req}> *</span> : null}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.errorText}>
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  );
}
