'use client';

import Icon from '@/components/admin/Icon';
import { formatDuration, formatLkr, teacherName, toNumber } from '@/study-packs/utils';
import { lessonsFromLabel, totalMinutes } from '@/study-packs/sessionUtils';
import PackCover from './PackCover';
import base from './study-packs.module.css';
import s from './add-recordings.module.css';

export default function PackSummaryAside({ form, status, items, teachers, onEditSettings }) {
  const published = status === 'published';
  const byline = [teacherName(teachers, form.teacherId), form.subject].filter(Boolean).join(' · ');
  const price = toNumber(form.price);

  const stats = [
    { label: 'Sessions', value: String(items.length) },
    { label: 'Total duration', value: items.length ? formatDuration(totalMinutes(items)) : '—' },
    { label: 'Lessons from', value: lessonsFromLabel(items.map((item) => item.recording?.classDate)) },
    { label: 'Price', value: price > 0 ? formatLkr(price) : '—' },
  ];

  return (
    <>
      <div className={s.summaryCard}>
        <PackCover coverUrl={form.coverUrl} subject={form.subject} grade={form.grade}>
          <span className={`${base.statusChip} ${published ? base.chipPublished : base.chipDraft}`}>
            <span className={base.chipDot} aria-hidden="true" />
            {published ? 'Published' : 'Draft'}
          </span>
        </PackCover>

        <div className={s.summaryBody}>
          <h3 className={s.summaryName}>{form.name}</h3>
          {byline ? <p className={s.summaryBy}>{byline}</p> : null}

          <dl className={s.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={s.stat}>
                <dt className={s.statLabel}>{stat.label}</dt>
                <dd className={s.statValue}>{stat.value}</dd>
              </div>
            ))}
          </dl>

          <button type="button" className={`${base.secondaryButton} ${s.fullWidth}`} onClick={onEditSettings}>
            <Icon name="tune" size={18} weight={600} />
            Edit general settings
          </button>
        </div>
      </div>

      <div className={s.noteBox}>
        <Icon name="link" size={19} />
        <p>
          Videos aren&apos;t uploaded again. Each session links to its recording in Class Recordings. Students watch
          sessions in the order shown.
        </p>
      </div>
    </>
  );
}
