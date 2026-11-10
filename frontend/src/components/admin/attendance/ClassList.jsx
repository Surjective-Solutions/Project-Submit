import { formatClock, formatDayCell, formatScanTime, formatShortDate, sortNewestFirst } from '@/attendance/utils';
import StatusChip from './StatusChip';
import styles from './attendance.module.css';

export default function ClassList({ records, date, onDateChange }) {
  const rows = sortNewestFirst(records);

  if (!rows.length) return <p className={styles.notice}>No classes scheduled this month.</p>;

  return (
    <div className={styles.listWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Class</th>
            <th scope="col">Status</th>
            <th scope="col">Scanned in</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={`${r.date}-${r.className}-${r.startTime}`}
              className={r.date === date ? styles.rowSelected : undefined}
              onClick={() => onDateChange(r.date)}
            >
              <td>
                <button type="button" className={styles.linkButton} aria-label={`Show ${formatShortDate(r.date)}`} aria-pressed={r.date === date}>
                  {formatDayCell(r.date)}
                </button>
              </td>
              <td>
                <div className={styles.listClass}>{r.className}</div>
                <div className={styles.listSub}>
                  {formatClock(r.startTime)} · {r.tutor}
                </div>
              </td>
              <td>
                <StatusChip status={r.status} />
              </td>
              <td>{r.scannedAt ? formatScanTime(r.scannedAt) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
