'use client';

import Icon from '@/components/admin/Icon';
import { ALL_TEACHERS, TEACHERS, teacherOptionLabel } from '@/reports/teachers';
import styles from './reports.module.css';

export default function TeacherSelect({ value, onChange }) {
  return (
    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="reports-teacher">
        Teacher
      </label>
      <div className={styles.selectWrap}>
        <span className={styles.selectIcon} aria-hidden="true">
          <Icon name="person" size={18} />
        </span>
        <select
          id="reports-teacher"
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" hidden>
            Select a teacher
          </option>
          <option value={ALL_TEACHERS.id}>{ALL_TEACHERS.name}</option>
          {TEACHERS.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacherOptionLabel(teacher)}
            </option>
          ))}
        </select>
        <span className={styles.selectChevron} aria-hidden="true">
          <Icon name="expand_more" size={20} />
        </span>
      </div>
    </div>
  );
}
