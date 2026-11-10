import { STATUS_META } from '@/attendance/constants';
import { buildCalendar, formatShortDate, formatMonthTitle, groupByDate, worstStatus } from '@/attendance/utils';
import styles from './attendance.module.css';

const HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MonthCalendar({ month, records, date, minDate, maxDate, onDateChange }) {
  const byDate = groupByDate(records);
  const cells = buildCalendar(month);

  return (
    <div className={styles.calendar}>
      <h3 className={styles.calTitle}>{formatMonthTitle(month)}</h3>
      <div className={styles.calHead} aria-hidden="true">
        {HEADERS.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      <div className={styles.calGrid}>
        {cells.map((iso, index) => {
          if (!iso) return <span key={`blank-${index}`} />;
          const list = byDate.get(iso);
          const status = list ? worstStatus(list.map((r) => r.status)) : null;
          const outOfRange = iso > maxDate || iso < minDate;
          const label = `${formatShortDate(iso)}: ${status ? `${STATUS_META[status].label}${list.length > 1 ? ` (${list.length} classes)` : ''}` : outOfRange ? 'not available' : 'no class'}`;
          return (
            <button
              key={iso}
              type="button"
              className={`${styles.day} ${status ? styles.tone : ''}`}
              data-status={status || undefined}
              data-outside={outOfRange ? 'true' : undefined}
              aria-label={label}
              aria-pressed={iso === date}
              disabled={outOfRange}
              onClick={() => onDateChange(iso)}
            >
              {Number(iso.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
}
