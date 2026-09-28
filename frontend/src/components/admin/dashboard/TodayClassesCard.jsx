'use client';

import { useState } from 'react';
import Icon from '@/components/admin/Icon';
import { TODAYS_CLASSES } from './dashboard-data';
import { formatNumber, percent, plural } from './format';
import styles from './dashboard.module.css';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ended', label: 'Ended' },
];

const STATUS = {
  live: { label: 'Live', className: styles.chipLive },
  upcoming: { label: 'Upcoming', className: styles.chipUpcoming },
  ended: { label: 'Ended', className: styles.chipEnded },
};

const RECORDING = {
  recording: { label: 'Recording', icon: 'radio_button_checked', fill: true },
  published: { label: 'Published', icon: 'check_circle', fill: true },
  processing: { label: 'Processing', icon: 'hourglass_top', fill: false },
  scheduled: { label: 'Scheduled', icon: 'schedule', fill: false },
};

const EMPTY_MESSAGE = {
  live: 'No classes are live right now.',
  upcoming: 'No more classes scheduled for today.',
  ended: 'No classes have ended yet today.',
};

function Attendance({ attended, enrolled }) {
  if (attended == null) {
    return (
      <div className={styles.attText}>
        — / {formatNumber(enrolled)} enrolled
      </div>
    );
  }
  const pct = percent(attended, enrolled);
  return (
    <div
      role="img"
      aria-label={`${formatNumber(attended)} of ${formatNumber(enrolled)} enrolled attending, ${pct}%`}
    >
      <div className={styles.attText} aria-hidden="true">
        <strong>{formatNumber(attended)}</strong> / {formatNumber(enrolled)} · {pct}%
      </div>
      <div className={styles.attBar} aria-hidden="true">
        <div className={styles.attFill} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TodayClassesCard() {
  const [filter, setFilter] = useState('all');

  const counts = {
    all: TODAYS_CLASSES.length,
    live: TODAYS_CLASSES.filter((c) => c.status === 'live').length,
    upcoming: TODAYS_CLASSES.filter((c) => c.status === 'upcoming').length,
    ended: TODAYS_CLASSES.filter((c) => c.status === 'ended').length,
  };
  const rows = filter === 'all' ? TODAYS_CLASSES : TODAYS_CLASSES.filter((c) => c.status === filter);

  return (
    <section className={`${styles.card} ${styles.classesCard}`} aria-labelledby="today-classes-title">
      <div className={styles.cardHeader}>
        <div>
          <h2 id="today-classes-title" className={styles.cardTitle}>
            Today&apos;s classes &amp; attendance
          </h2>
          <p className={styles.cardSub}>
            {plural(counts.all, 'class', 'classes')} · {counts.live} live now
          </p>
        </div>
        <div className={styles.segmented} role="group" aria-label="Filter classes by status">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              className={filter === key ? `${styles.segment} ${styles.segmentActive}` : styles.segment}
              onClick={() => setFilter(key)}
            >
              {label}
              <span className={styles.segmentCount}>{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Class</th>
              <th scope="col">Medium</th>
              <th scope="col">Status</th>
              <th scope="col">Attendance</th>
              <th scope="col">Recording</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className={styles.emptyRow}>
                  {EMPTY_MESSAGE[filter]}
                </td>
              </tr>
            )}
            {rows.map((c) => {
              const status = STATUS[c.status];
              const rec = RECORDING[c.recording];
              return (
                <tr key={c.id} className={c.status === 'live' ? styles.rowLive : undefined}>
                  <td>
                    <span className={styles.timeStart}>{c.time}</span>
                    <span className={styles.timeEnd}>to {c.end}</span>
                  </td>
                  <td className={styles.classCell}>
                    <span className={styles.className}>{c.title}</span>
                    <span className={styles.teacher}>{c.teacher}</span>
                  </td>
                  <td>
                    <span className={`${styles.chip} ${styles.chipMedium}`}>{c.medium}</span>
                  </td>
                  <td>
                    <span className={`${styles.chip} ${status.className}`}>
                      {c.status === 'live' && <span className={styles.chipDot} aria-hidden="true" />}
                      {status.label}
                    </span>
                  </td>
                  <td className={styles.attendance}>
                    <Attendance attended={c.attended} enrolled={c.enrolled} />
                  </td>
                  <td>
                    <span className={`${styles.recording} ${styles[`rec_${c.recording}`]}`}>
                      <Icon name={rec.icon} size={17} fill={rec.fill} />
                      {rec.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
