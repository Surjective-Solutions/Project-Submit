'use client';

import Icon from '@/components/admin/Icon';
import { REPORT_TYPES } from '@/reports/config';
import styles from './reports.module.css';

export default function ReportTypeSelect({ value, onChange }) {
  const selected = REPORT_TYPES.find((type) => type.key === value) ?? null;

  return (
    <div className={styles.fieldGroup}>
      <div className={styles.selectWrap}>
        <span className={styles.selectIcon} aria-hidden="true">
          <Icon name={selected ? selected.icon : 'assessment'} size={18} />
        </span>
        <select
          id="reports-type"
          aria-label="Report type"
          className={styles.select}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" hidden>
            Select the report type
          </option>
          {REPORT_TYPES.map((type) => (
            <option key={type.key} value={type.key}>
              {type.title}
            </option>
          ))}
        </select>
        <span className={styles.selectChevron} aria-hidden="true">
          <Icon name="expand_more" size={20} />
        </span>
      </div>
      {selected ? <p className={styles.typeHint}>{selected.description}</p> : null}
    </div>
  );
}
