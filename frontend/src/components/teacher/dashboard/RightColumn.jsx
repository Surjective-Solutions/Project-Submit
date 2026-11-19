'use client';

import Link from 'next/link';
import { dayOfMonth, weekdayShort } from '@/teacher-dashboard/utils';
import { sectionHref } from './LeftColumn';
import s from './dashboard.module.css';

function WeekCard({ week, today }) {
  const first = week.days[0]?.date;
  const last = week.days[week.days.length - 1]?.date;
  const month = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' });
  return (
    <section className={s.card} aria-labelledby="dash-week">
      <div className={s.cardHead}>
        <h2 id="dash-week" className={s.cardTitle}>
          This week
        </h2>
        {first && (
          <span className={s.cardSub}>
            {dayOfMonth(first)} – {dayOfMonth(last)} {month(last)}
          </span>
        )}
      </div>
      <ol className={s.weekStrip}>
        {week.days.map((d) => (
          <li key={d.date} className={d.date === today ? s.weekDayToday : s.weekDay} aria-current={d.date === today ? 'date' : undefined}>
            <span className={s.weekName}>{weekdayShort(d.date)}</span>
            <span className={s.weekNum}>{dayOfMonth(d.date)}</span>
            <span className={s.weekDots}>
              {d.sessions.map((mode, i) => (
                <span key={i} className={`${s.dot} ${mode === 'online' ? s.dotOnline : s.dotHall}`} aria-hidden="true" />
              ))}
            </span>
            <span className={s.srOnly}>
              {d.sessions.length === 0 ? 'No sessions' : `${d.sessions.length} ${d.sessions.length === 1 ? 'session' : 'sessions'}: ${d.sessions.join(', ')}`}
            </span>
          </li>
        ))}
      </ol>
      <h3 className={s.eyebrow}>Coming up</h3>
      <ul className={s.rows}>
        {week.comingUp.map((u) => (
          <li key={u.id} className={s.row}>
            <span className={s.dateTile} aria-hidden="true">
              <small>{weekdayShort(u.date).toUpperCase()}</small>
              <strong>{dayOfMonth(u.date)}</strong>
            </span>
            <div className={s.rowText}>
              <p className={s.rowTitle}>{u.title}</p>
              <p className={s.rowSub}>
                {u.time} · {u.place}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NoticesCard({ items }) {
  return (
    <section className={s.card} aria-labelledby="dash-notices">
      <div className={s.cardHead}>
        <h2 id="dash-notices" className={s.cardTitle}>
          Recent notices
        </h2>
        <Link href={sectionHref('classes')} className={s.link}>
          All notices
        </Link>
      </div>
      {items.length === 0 ? (
        <p className={s.empty}>No notices yet.</p>
      ) : (
        <ul className={s.rows}>
          {items.map((n) => (
            <li key={n.id} className={s.row} style={{ alignItems: 'flex-start' }}>
              <span className={s.noticeDot} aria-hidden="true" />
              <div className={s.rowText}>
                <p className={s.rowTitle}>{n.title}</p>
                <p className={s.rowSub}>{n.sub}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function RightColumn({ data }) {
  return (
    <div className={s.col}>
      <WeekCard week={data.week} today={data.asOf.slice(0, 10)} />
      <NoticesCard items={data.notices} />
    </div>
  );
}
