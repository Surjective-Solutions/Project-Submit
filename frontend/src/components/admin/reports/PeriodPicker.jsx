'use client';

import Icon from '@/components/admin/Icon';
import { EARLIEST_DATE } from '@/reports/dates';
import styles from './reports.module.css';

function DateField({ id, label, value, min, max, invalid, onChange }) {
  // Open the calendar when any part of the field is clicked, not just the small icon.
  function openPicker(event) {
    try {
      event.currentTarget.showPicker?.();
    } catch {
      /* some browsers refuse; the field still works by typing */
    }
  }

  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor={id}>
        {label}
      </label>
      <div className={`${styles.selectWrap} ${styles.selectWrapNarrow}`}>
        <input
          id={id}
          type="date"
          className={`${styles.dateInput} ${invalid ? styles.selectInvalid : ''}`}
          value={value}
          min={min}
          max={max}
          aria-invalid={invalid || undefined}
          onClick={openPicker}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default function PeriodPicker({ todayKey, from, to, error, onFromChange, onToChange }) {
  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>Time period</span>
      <div className={styles.customRange}>
        <DateField
          id="reports-from"
          label="From"
          value={from}
          min={EARLIEST_DATE}
          max={to || todayKey}
          invalid={Boolean(error)}
          onChange={onFromChange}
        />
        <span className={styles.customArrow} aria-hidden="true">
          <Icon name="arrow_forward" size={18} />
        </span>
        <DateField
          id="reports-to"
          label="To"
          value={to}
          min={from || EARLIEST_DATE}
          max={todayKey}
          invalid={Boolean(error)}
          onChange={onToChange}
        />
      </div>
      {error ? (
        <p className={styles.rangeError} role="alert">
          <Icon name="error" size={16} fill={1} />
          {error}
        </p>
      ) : null}
    </div>
  );
}