'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { tutors as tutorsApi } from '@/classes/api';
import { ALL, LEVELS, LEVEL_LABEL } from '@/classes/constants';
import { loadSaved, save } from '@/classes/storage';
import { filterTutors, levelCounts, plural, totals } from '@/classes/utils';
import TutorCard from './TutorCard';
import styles from './classes.module.css';

const TABS = [ALL, ...LEVELS];
const TAB_LABEL = { [ALL]: 'All levels', ...LEVEL_LABEL };

export default function TutorDirectoryPage() {
  const [data, setData] = useState({ status: 'loading', tutors: [] });
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState(ALL);

  // The last level tab is read after mount so the server and browser render the same first page.
  useEffect(() => setLevel(loadSaved().level), []);

  const load = useCallback(() => {
    setData({ status: 'loading', tutors: [] });
    let cancelled = false;
    tutorsApi
      .list()
      .then((list) => !cancelled && setData({ status: 'ready', tutors: list }))
      .catch(() => !cancelled && setData({ status: 'error', tutors: [] }));
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => load(), [load]);

  function changeLevel(next) {
    setLevel(next);
    save({ level: next });
  }

  const { tutors } = data;
  const counts = useMemo(() => levelCounts(tutors, query), [tutors, query]);
  const shown = useMemo(() => filterTutors(tutors, { query, level }), [tutors, query, level]);
  const sums = totals(tutors);
  const ready = data.status === 'ready';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Classes</h1>
          <p className={styles.subtitle}>
            {ready
              ? `${plural(sums.tutors, 'tutor')} · ${plural(sums.classes, 'class', 'classes')} running across all batches`
              : 'Tutors and their classes'}
          </p>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.search}>
          <Icon name="search" size={20} weight={500} style={{ color: '#5b6178' }} />
          <input
            className={styles.searchInput}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tutor or subject"
            aria-label="Search tutor or subject"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <div className={styles.levelSelectWrap}>
          <select
            className={styles.levelSelect}
            value={level}
            onChange={(event) => changeLevel(event.target.value)}
            aria-label="Filter by level"
          >
            {TABS.map((tab) => (
              <option key={tab} value={tab}>
                {TAB_LABEL[tab]}
                {ready ? ` (${counts[tab]})` : ''}
              </option>
            ))}
          </select>
          <span className={styles.selectIcon} aria-hidden="true">
            <Icon name="expand_more" size={22} weight={500} />
          </span>
        </div>
      </div>

      {data.status === 'loading' && (
        <div className={styles.tutorGrid} aria-busy="true" role="status" aria-label="Loading tutors">
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <div key={n} className={styles.skeleton} />
          ))}
        </div>
      )}

      {data.status === 'error' && (
        <div className={styles.errorBox} role="alert">
          <Icon name="error" size={20} weight={600} fill={1} />
          <span className={styles.errorText}>Couldn&rsquo;t load the tutors. Check the connection and try again.</span>
          <button type="button" className={styles.secondaryButton} onClick={load}>
            <Icon name="refresh" size={18} weight={600} />
            Try again
          </button>
        </div>
      )}

      {ready && shown.length > 0 && (
        <ul className={styles.tutorGrid} aria-label="Tutors">
          {shown.map((tutor) => (
            <li key={tutor.id} className={styles.gridItem}>
              <TutorCard tutor={tutor} />
            </li>
          ))}
        </ul>
      )}

      {ready && shown.length === 0 && (
        <div className={styles.empty} role="status">
          {query.trim()
            ? `No tutors match “${query.trim()}”.`
            : tutors.length
              ? `No ${LEVEL_LABEL[level] || level} tutors yet.`
              : 'No tutors yet.'}
        </div>
      )}
    </div>
  );
}
