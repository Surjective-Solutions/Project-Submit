'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import Icon from '@/components/admin/Icon';
import { useAdminConsole } from '@/components/admin/AdminConsoleContext';
import { TODAYS_CLASSES } from './dashboard-data';
import { formatNumber, formatWait, plural } from './format';
import useDashboardData from './useDashboardData';
import TodayClassesCard from './TodayClassesCard';
import SlipQueueCard from './SlipQueueCard';
import { StudentsByStreamCard } from './SummaryCards';
import styles from './dashboard.module.css';

// The academy runs on Sri Lanka time regardless of where the admin signs in.
const colomboParts = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Colombo',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: 'numeric',
  hourCycle: 'h23',
});

function subscribeToClock(callback) {
  const id = setInterval(callback, 30_000);
  return () => clearInterval(id);
}
const currentMinute = () => Math.floor(Date.now() / 60_000);

// Re-renders once a minute so the greeting rolls over on its own.
function useColomboToday() {
  const minute = useSyncExternalStore(subscribeToClock, currentMinute, () => null);
  if (minute == null) return { greeting: 'Welcome back', dateLabel: null };
  const parts = Object.fromEntries(
    colomboParts.formatToParts(new Date(minute * 60_000)).map((p) => [p.type, p.value]),
  );
  const hour = Number(parts.hour);
  return {
    greeting: hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening',
    dateLabel: `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`,
  };
}

const QUICK_ACTIONS = [
  { label: 'Upload recording', icon: 'upload', href: '/admin/class-recordings' },
  { label: 'Schedule class', icon: 'calendar_add_on', href: '/admin/classes/new' },
  { label: 'New study pack', icon: 'add_box', href: '/admin/study-packs' },
];

const liveClasses = TODAYS_CLASSES.filter((c) => c.status === 'live');

export default function AdminDashboard() {
  const { profile, slips, pendingSlipCount } = useAdminConsole();
  const { greeting, dateLabel } = useColomboToday();
  const { studentSummary } = useDashboardData();
  const oldestWait = slips.length ? Math.max(...slips.map((s) => s.waitingMinutes)) : 0;
  const totalClassesToday = TODAYS_CLASSES.length;
  const completedClasses = TODAYS_CLASSES.filter((c) => c.status === 'ended').length;
  

  return (
    <div className={styles.page}>
      {/* ── Greeting ── */}
      <div className={styles.greeting}>
        <div>
          <h1 className={styles.title}>
            {greeting}, {profile.firstName}
          </h1>
          <p className={styles.subline}>{dateLabel}</p>
        </div>
        <div className={styles.quickActions}>
          {QUICK_ACTIONS.map(({ label, icon, href }) => (
            <Link key={label} href={href} className={styles.quickAction}>
              <Icon name={icon} size={19} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <section className={styles.kpiGrid} aria-label="Key figures">
        <div className={styles.kpi}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTile}>
              <Icon name="school" size={19} />
            </span>
            Active students
          </div>
          <p className={styles.kpiValue}>
            {studentSummary.data ? formatNumber(studentSummary.data.active) : '—'}
          </p>
          <div className={styles.kpiFoot}>
            {studentSummary.data ? (
              <>
                <span className={styles.kpiDelta}>
                  <Icon name="trending_up" size={16} />+{formatNumber(studentSummary.data.newThisMonth)}
                </span>
                new this month
              </>
            ) : studentSummary.error ? (
              "Couldn't load student figures"
            ) : (
              'Loading…'
            )}
          </div>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTile}>
              <Icon name="calendar_today" size={19} />
            </span>
            Classes today
          </div>
          <p className={styles.kpiValue}>{completedClasses}/{totalClassesToday}</p>
          <div className={styles.kpiFoot}>
            completed · {plural(liveClasses.length, 'class', 'classes')} live now
          </div>
        </div>

        <div className={`${styles.kpi} ${styles.kpiWaiting}`}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiTile}>
              <Icon name="receipt_long" size={19} />
            </span>
            Slips to verify
          </div>
          <p className={styles.kpiValue}>{formatNumber(pendingSlipCount)}</p>
          <div className={styles.kpiFoot}>
            {pendingSlipCount ? (
              <>
                Oldest waiting {formatWait(oldestWait)}
                <a href="#slip-queue" className={styles.kpiWaitingLink}>
                  Review queue
                  <Icon name="arrow_forward" size={16} />
                </a>
              </>
            ) : (
              'All caught up'
            )}
          </div>
        </div>
      </section>

      {/* ── Classes + slip queue ── */}
      <div className={styles.row}>
        <TodayClassesCard />
        <SlipQueueCard />
      </div>

      {/* ── Students by stream ── */}
      <div className={styles.row}>
        <StudentsByStreamCard />
      </div>
    </div>
  );
}
