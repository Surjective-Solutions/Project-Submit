import { STATUS_KEYS, STATUS_META } from '@/attendance/constants';
import { formatMonthLabel, monthKey, monthsBetween, sinceLabel, summarize } from '@/attendance/utils';
import ClassList from './ClassList';
import MonthCalendar from './MonthCalendar';
import styles from './attendance.module.css';

export default function MonthCard({ tutor, records, since, today, month, onMonthChange, date, onDateChange }) {
  const months = monthsBetween(since, today);
  const overall = summarize(records);
  const monthRecords = records.filter((r) => monthKey(r.date) === month);
  const stats = summarize(monthRecords);

  return (
    <section className={styles.card} aria-label="Attendance by month">
      <div className={styles.monthHead}>
        <div>
          <h2 className={styles.monthTitle}>Attendance by month</h2>
          <p className={styles.monthSub}>
            {overall.total
              ? `${overall.attended} of ${overall.total} classes${tutor ? ` with ${tutor.name}` : ''} attended since ${sinceLabel(since, today)} · ${overall.percent}% overall`
              : `No classes${tutor ? ` with ${tutor.name}` : ''} recorded since ${sinceLabel(since, today)}`}
          </p>
        </div>
        <ul className={styles.legend} aria-label="Status colours">
          {STATUS_KEYS.map((key) => (
            <li key={key} className={styles.legendItem}>
              <span className={`${styles.swatch} ${styles.tone}`} data-status={key} aria-hidden="true" />
              {STATUS_META[key].label}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.monthGrid}>
        {months.map((key) => {
          const s = summarize(records.filter((r) => monthKey(r.date) === key));
          return (
            <button key={key} type="button" className={styles.monthBtn} aria-pressed={key === month} onClick={() => onMonthChange(key)}>
              <span className={styles.monthBtnTop}>
                <span className={styles.monthName}>{formatMonthLabel(key)}</span>
                <span className={styles.monthPct}>{s.percent === null ? '–' : `${s.percent}%`}</span>
              </span>
              <span className={styles.bar} aria-hidden="true">
                <span className={styles.barFill} style={{ width: `${s.percent ?? 0}%` }} />
              </span>
              <span className={styles.monthCount}>{s.total ? `${s.attended} of ${s.total} classes` : 'No classes'}</span>
            </button>
          );
        })}
      </div>

      <dl className={styles.stats}>
        {[
          { label: 'Attended', value: `${stats.attended} / ${stats.total}`, status: 'present' },
          { label: 'On time', value: stats.present, status: 'present' },
          { label: 'Late', value: stats.late, status: 'late' },
          { label: 'Absent', value: stats.absent, status: 'absent' },
        ].map((tile) => (
          <div key={tile.label} className={`${styles.stat} ${styles.tone}`} data-status={tile.status}>
            <dt className={styles.statLabel}>{tile.label}</dt>
            <dd className={styles.statValue}>{tile.value}</dd>
          </div>
        ))}
      </dl>

      <div className={styles.monthBody}>
        <div className={styles.calCol}>
          <MonthCalendar month={month} records={monthRecords} date={date} minDate={since} maxDate={today} onDateChange={onDateChange} />
        </div>
        <div className={styles.listCol}>
          <ClassList records={monthRecords} date={date} onDateChange={onDateChange} />
        </div>
      </div>
    </section>
  );
}
