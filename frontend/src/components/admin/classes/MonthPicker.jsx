import Icon from '@/components/admin/Icon';
import { MONTH_NAMES, formatMonth, shiftMonth, yearOptions } from '@/classes/sessionUtils';
import styles from './classes.module.css';
import s from './sessions.module.css';

// Chooses which month of sessions is listed: a month dropdown, a year dropdown, and arrows to step to the
// previous or next month.
export default function MonthPicker({ sessions, period, onChange }) {
  
  const years = yearOptions(sessions, period);
  const set = (patch) => onChange({ ...period, ...patch });

  return (
    <div className={s.picker} role="group" aria-label="Choose the month to show">
      <button
        type="button"
        className={s.stepButton}
        onClick={() => onChange(shiftMonth(period, -1))}
        aria-label={`Previous month, ${formatMonth(shiftMonth(period, -1))}`}
      >
        <Icon name="chevron_left" size={22} weight={500} />
      </button>

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

      <button
        type="button"
        className={s.stepButton}
        onClick={() => onChange(shiftMonth(period, 1))}
        aria-label={`Next month, ${formatMonth(shiftMonth(period, 1))}`}
      >
        <Icon name="chevron_right" size={22} weight={500} />
      </button>
    </div>
  );
}
