import Icon from '@/components/admin/Icon';
import { STATUS_META } from '@/attendance/constants';
import {
  firstName,
  formatClock,
  formatLongDate,
  formatScanTime,
  formatShortDate,
  lastClassBefore,
  weekdayIndex,
} from '@/attendance/utils';
import { WEEKDAYS_SHORT } from '@/attendance/constants';
import styles from './attendance.module.css';

export default function DayCard({
  student,
  tutor,
  enrolledWithTutor,
  date,
  records, // null while loading
  error,
  onRetry,
  onDateChange,
}) {
  const name = firstName(student);
  const dayRecords = records ? records.filter((r) => r.date === date).sort((a, b) => a.startTime.localeCompare(b.startTime)) : [];
  const last = records && !dayRecords.length ? lastClassBefore(records, date) : null;

  let body;
  if (!enrolledWithTutor) {
    body = (
      <p className={styles.notice}>
        <strong>{name}</strong> isn’t enrolled in {tutor?.name}’s classes.
      </p>
    );
  } else if (error) {
    body = (
      <div className={styles.banner} role="alert">
        <Icon name="error" size={20} weight={600} fill={1} />
        <span className={styles.bannerText}>Couldn’t load the attendance.</span>
        <button type="button" className={styles.bannerAction} onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  } else if (records === null) {
    body = (
      <p className={styles.loading} role="status">
        <span className={styles.spin}>
          <Icon name="progress_activity" size={20} weight={600} />
        </span>
        Loading attendance…
      </p>
    );
  } else if (dayRecords.length) {
    body = (
      <ul className={styles.dayList}>
        {dayRecords.map((r) => {
          const meta = STATUS_META[r.status];
          return (
            <li key={`${r.date}-${r.className}-${r.startTime}`} className={`${styles.dayRow} ${styles.tone}`} data-status={r.status}>
              <span className={styles.statusIcon} aria-hidden="true">
                <Icon name={meta.icon} size={28} weight={600} fill={1} />
              </span>
              <div className={styles.dayText}>
                <div className={styles.dayClass}>{r.className}</div>
                <div className={styles.daySub}>
                  {r.tutor} · {formatClock(r.startTime)}
                </div>
              </div>
              <div className={styles.dayStatus}>
                <div className={styles.dayStatusLabel}>{meta.label}</div>
                <div className={styles.daySub}>
                  {r.scannedAt ? `Scanned in at ${formatScanTime(r.scannedAt)}` : 'No scan recorded'}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    );
  } else {
    body = (
      <div className={styles.notice}>
        <p className={styles.noticeLine}>
          {tutor ? `No class with ${tutor.name} for ${name} on this date.` : `No class scheduled for ${name} on this date.`}
        </p>
        {last && (
          <div className={styles.lastClass}>
            <span>
              Last class: {formatShortDate(last.date)} · {last.className} · {STATUS_META[last.status].label}
            </span>
            <button type="button" className={styles.secondaryButton} onClick={() => onDateChange(last.date)}>
              View that day
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <section className={`${styles.card} ${styles.dayCol}`} aria-label="Attendance on the chosen date" aria-busy={records === null && !error ? true : undefined}>
      <div className={styles.dayHead}>
        <div>
          <div className={styles.eyebrow}>Attendance on</div>
          <h2 className={styles.dayTitle}>{formatLongDate(date)}</h2>
        </div>
      </div>

      {body}

      <div className={styles.enrolled}>
        <div className={styles.enrolledLabel}>Enrolled classes</div>
        <ul className={styles.chipList}>
          {student.enrolledClasses.map((c) => (
            <li
              key={`${c.name}-${c.tutor}-${c.weekday}`}
              className={styles.classChip}
              data-dim={tutor && c.tutor !== tutor.name ? 'true' : undefined}
            >
              {c.name} · {c.tutor} · {WEEKDAYS_SHORT[weekdayIndex(c.weekday)]}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
