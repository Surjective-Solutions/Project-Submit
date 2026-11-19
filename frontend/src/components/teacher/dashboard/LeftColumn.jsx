'use client';

import Link from 'next/link';
import { toast } from 'sonner';
import { clock12, formatRange, percent, sessionTiming } from '@/teacher-dashboard/utils';
import s from './dashboard.module.css';

export const sectionHref = (name) => `/teacher/dashboard?section=${name}`;
export const classHref = (id) => `/teacher/dashboard/classes/${id}`;

const ModeChip = ({ mode }) => (
  <span className={mode === 'online' ? s.chipOnline : s.chipHall}>{mode === 'online' ? 'Online' : 'Hall'}</span>
);

async function copyJoinLink(link) {
  try {
    await navigator.clipboard.writeText(link);
    toast.success('Join link copied');
  } catch {
    toast.error('Couldn’t copy the link');
  }
}

function SessionActions({ session, highlight }) {
  const details = (
    <Link key="details" href={classHref(session.classId)} className={s.btnSecondary}>
      Session details
    </Link>
  );
  const copy = (primary) => (
    <button key="copy" type="button" className={primary ? s.btnPrimary : s.btnSecondary} onClick={() => copyJoinLink(session.joinLink)}>
      Copy join link
    </button>
  );
  if (session.mode === 'online') return <div className={s.sessionActions}>{highlight ? [copy(true), details] : copy(false)}</div>;
  return (
    <div className={s.sessionActions}>
      {highlight && (
        <Link key="scan" href={sectionHref('attendance')} className={s.btnPrimary}>
          Open attendance scanner
        </Link>
      )}
      {details}
    </div>
  );
}

function StatusDots({ items }) {
  if (!items?.length) return null;
  const tone = { positive: s.dotPositive, negative: s.dotNegative, navy: s.dotNavy };
  return (
    <ul className={s.dots}>
      {items.map((item) => (
        <li key={item.text}>
          <span className={`${s.dot} ${tone[item.tone] || s.dotNavy}`} aria-hidden="true" />
          {item.text}
        </li>
      ))}
    </ul>
  );
}

function NextSession({ session, asOf }) {
  const from = clock12(session.start);
  const to = clock12(session.end);
  const timing = sessionTiming(asOf, session.start, session.end);
  return (
    <div className={s.sessionNext}>
      <div className={s.timeBlock}>
        <span className={s.timeBig}>{from.time}</span>
        <span className={s.timeSmall}>
          to {to.time} {to.suffix}
        </span>
        <span className={s.pill}>{timing.label}</span>
      </div>
      <div className={s.sessionBody}>
        <div className={s.sessionTitleRow}>
          <h3 className={s.sessionTitle}>{session.title}</h3>
          <ModeChip mode={session.mode} />
        </div>
        <p className={s.sessionDetail}>{session.detail}</p>
        <StatusDots items={session.status} />
        <SessionActions session={session} highlight />
      </div>
    </div>
  );
}

function SessionRow({ session, asOf }) {
  const timing = sessionTiming(asOf, session.start, session.end);
  return (
    <div className={s.session}>
      <div className={s.sessionBody}>
        <div className={s.sessionTitleRow}>
          <h3 className={s.sessionTitle}>
            {formatRange(session.start, session.end)} · {session.title}
          </h3>
          <ModeChip mode={session.mode} />
          {timing.state === 'over' && <span className={s.pillQuiet}>Finished</span>}
        </div>
        <p className={s.sessionDetail}>{session.detail}</p>
        <StatusDots items={session.status} />
        <SessionActions session={session} />
      </div>
    </div>
  );
}

function TodayCard({ sessions, asOf }) {
  const next = sessions.findIndex((x) => sessionTiming(asOf, x.start, x.end).state !== 'over');
  return (
    <section className={s.card} aria-labelledby="dash-today">
      <div className={s.cardHead}>
        <h2 id="dash-today" className={s.cardTitle}>
          Today · {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'}
        </h2>
        <Link href={sectionHref('classes')} className={s.link}>
          Full schedule
        </Link>
      </div>
      {sessions.length === 0 ? (
        <p className={s.empty}>No sessions today.</p>
      ) : (
        <div className={s.sessions}>
          {sessions.map((x, i) => (i === next ? <NextSession key={x.id} session={x} asOf={asOf} /> : <SessionRow key={x.id} session={x} asOf={asOf} />))}
        </div>
      )}
    </section>
  );
}

function FeesCard({ fees }) {
  const paid = fees.classes.reduce((sum, c) => sum + c.paid, 0);
  const total = fees.classes.reduce((sum, c) => sum + c.total, 0);
  const due = total - paid;
  return (
    <section className={s.card} aria-labelledby="dash-fees">
      <div className={s.cardHead}>
        <div>
          <h2 id="dash-fees" className={s.cardTitle}>
            {fees.month} fees
          </h2>
          <p className={s.cardSub}>
            {paid} of {total} paid
          </p>
        </div>
      </div>
      <ul className={s.feeList}>
        {fees.classes.map((c) => (
          <li key={c.name} className={s.feeRow}>
            <div className={s.feeTop}>
              <span className={s.feeName}>{c.name}</span>
              <span className={s.feeCount}>
                {c.paid} / {c.total} · <span className={s.due}>{c.total - c.paid} due</span>
              </span>
            </div>
            <div className={s.track} role="progressbar" aria-label={`${c.name}: ${c.paid} of ${c.total} paid`} aria-valuemin={0} aria-valuemax={c.total} aria-valuenow={c.paid}>
              <div className={s.trackFill} style={{ width: `${percent(c.paid, c.total)}%` }} />
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className={`${s.btnSecondary} ${s.btnWide}`} disabled={due === 0} onClick={() => toast.info('Payment reminders will be available once payments are connected.')}>
        Remind {due} unpaid students
      </button>
    </section>
  );
}

function ClassesTable({ classes }) {
  return (
    <section className={s.card} aria-labelledby="dash-classes">
      <div className={s.cardHead}>
        <h2 id="dash-classes" className={s.cardTitle}>
          My classes
        </h2>
        <Link href={sectionHref('classes')} className={s.link}>
          View all
        </Link>
      </div>
      <div className={s.tableWrap} tabIndex={0} role="region" aria-label="My classes, scrolls sideways on small screens">
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Class</th>
              <th scope="col">Schedule</th>
              <th scope="col">Mode</th>
              <th scope="col">Students</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={classHref(c.id)} className={s.className}>
                    {c.name}
                  </Link>
                  <span className={s.classVenue}>{c.venue}</span>
                </td>
                <td>{c.schedule}</td>
                <td>
                  <ModeChip mode={c.mode} />
                </td>
                <td className={s.num}>{c.students}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function LeftColumn({ data }) {
  return (
    <div className={s.col}>
      <TodayCard sessions={data.today} asOf={data.asOf} />
      <FeesCard fees={data.fees} />
      <ClassesTable classes={data.classes} />
    </div>
  );
}
