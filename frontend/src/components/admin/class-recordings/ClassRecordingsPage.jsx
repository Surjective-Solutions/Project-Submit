'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTransitionNavigate } from '@/components/PageTransition';
import Icon from '@/components/admin/Icon';
import { listTutors } from '@/class-recordings/api';
import { tutorHref } from '@/class-recordings/paths';
import TutorAvatar, { LevelTag } from './TutorAvatar';
import styles from './classRecordings.module.css';

const LEVEL_KEY = 'syz.classRecordings.level';
const LEVELS = [
  { key: 'all', label: 'All' },
  { key: 'A/L', label: 'A/L' },
  { key: 'O/L', label: 'O/L' },
];

function TutorCard({ tutor, onOpen }) {
  return (
    <article
      className={`${styles.card} ${styles.cardHover} ${styles.tutorCard}`}
      role="button"
      tabIndex={0}
      aria-label={`${tutor.name}, ${tutor.subject}. Open recordings`}
      onClick={() => onOpen(tutor)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(tutor);
        }
      }}
    >
      <div className={styles.tutorTop}>
        <TutorAvatar tutor={tutor} size={56} />
        <div className={styles.tutorInfo}>
          <h2 className={styles.tutorName}>{tutor.name}</h2>
          <p className={styles.tutorSubject}>{tutor.subject}</p>
        </div>
        <LevelTag level={tutor.level} />
      </div>
      <div className={styles.chips}>
        {tutor.mediums.map((medium) => (
          <span key={medium} className={styles.chip}>
            {medium}
          </span>
        ))}
      </div>
    </article>
  );
}

// View 1: pick a tutor.
export default function ClassRecordingsPage() {
  const go = useTransitionNavigate(); // opening a tutor plays the page transition
  const [tutors, setTutors] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState('all');

  useEffect(() => {
    let cancelled = false;
    listTutors()
      .then((result) => {
        if (cancelled) return;
        setTutors(result);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Could not load the tutors.');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The level tab is remembered between visits.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LEVEL_KEY);
      if (LEVELS.some((l) => l.key === saved)) setLevel(saved);
    } catch {
      /* storage can be blocked; the tab just starts on All */
    }
  }, []);

  function chooseLevel(key) {
    setLevel(key);
    try {
      localStorage.setItem(LEVEL_KEY, key);
    } catch {
      /* ignore */
    }
  }

  const text = query.trim().toLowerCase();
  const matching = useMemo(
    () =>
      tutors.filter(
        (t) => !text || t.name.toLowerCase().includes(text) || t.subject.toLowerCase().includes(text)
      ),
    [tutors, text]
  );
  const counts = useMemo(
    () => ({
      all: matching.length,
      'A/L': matching.filter((t) => t.level === 'A/L').length,
      'O/L': matching.filter((t) => t.level === 'O/L').length,
    }),
    [matching]
  );
  const shown = level === 'all' ? matching : matching.filter((t) => t.level === level);

  let body;
  if (status === 'loading') {
    body = <div className={styles.loading}>Loading tutors…</div>;
  } else if (status === 'error') {
    body = <div className={styles.empty}>{error}</div>;
  } else if (shown.length === 0) {
    body = (
      <div className={styles.empty}>
        <span className={styles.emptyTitle}>
          {text ? `No tutors match “${query.trim()}”.` : 'No tutors here yet.'}
        </span>
      </div>
    );
  } else {
    body = (
      <div className={styles.tutorGrid}>
        {shown.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} onOpen={(t) => go(tutorHref(t.id))} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Class Recordings</h1>
        <p className={styles.subtitle}>Select a tutor to browse and upload their recordings.</p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <span className={styles.searchIcon} aria-hidden="true">
            <Icon name="search" size={20} />
          </span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search tutor or subject"
            aria-label="Search tutor or subject"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className={styles.seg} role="tablist" aria-label="Filter by level">
          {LEVELS.map(({ key, label }) => {
            const active = key === level;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                className={active ? `${styles.segBtn} ${styles.segBtnActive}` : styles.segBtn}
                onClick={() => chooseLevel(key)}
              >
                {label}
                <span className={styles.segCount}>{counts[key]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {body}
    </div>
  );
}
