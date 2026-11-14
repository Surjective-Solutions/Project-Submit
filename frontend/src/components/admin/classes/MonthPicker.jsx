import Icon from '@/components/admin/Icon';
import { MONTH_NAMES, yearOptions } from '@/classes/sessionUtils';
import styles from './classes.module.css';
import s from './sessions.module.css';

// Chooses which month of sessions is listed: a month dropdown and a year dropdown.
export default function MonthPicker({ sessions, period, onChange }) {
  const years = yearOptions(sessions, period);
  const set = (patch) => onChange({ ...period, ...patch });

  return (
    <div className={s.picker} role="group" aria-label="Choose the month to show">
      <div className={s.pickerSelect}>
        <select
          className={s.pickerField}
          aria-label="Month"
          value={period.month}
          onChange={(event) => set({ month: Number(event.target.value) })}
        >
          {MONTH_NAMES.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
        <span className={styles.selectIcon} aria-hidden="true">
          <Icon name="expand_more" size={20} weight={500} />
        </span>
      </div>

      <div className={`${s.pickerSelect} ${s.pickerYear}`}>
        <select
          className={s.pickerField}
          aria-label="Year"
          value={period.year}
          onChange={(event) => set({ year: Number(event.target.value) })}
        >
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <span className={styles.selectIcon} aria-hidden="true">
          <Icon name="expand_more" size={20} weight={500} />
        </span>
      </div>
    </div>
  );
}
