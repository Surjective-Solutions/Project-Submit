'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { tutors as tutorsApi } from '@/classes/api';
import { ALL, CLASSES_ROUTE } from '@/classes/constants';
import { loadSaved, save } from '@/classes/storage';
import {
  applyFilters,
  batchCounts,
  batchOptions,
  groupByBatch,
  groupSummary,
  tutorStats,
  typeCounts,
} from '@/classes/utils';
import ClassCard from './ClassCard';
import ClassFilters from './ClassFilters';
import CreateClassModal from './CreateClassModal';
import TutorProfileCard from './TutorProfileCard';
import styles from './classes.module.css';

export default function TutorDetailPage({ tutorId }) {
  const [data, setData] = useState({ status: 'loading', tutor: null, tutors: [], classes: [] });
  const [filters, setFilters] = useState({ batch: ALL, type: ALL });
  const [creating, setCreating] = useState(false);

  // Opening a tutor starts at the top. Filters come back only when this same tutor was open before (a refresh);
  // clicking a tutor card on the directory has already reset them.
  useEffect(() => {
    window.scrollTo?.(0, 0);
    document.querySelector('main')?.scrollTo?.(0, 0);
    const saved = loadSaved();
    if (saved.tutorId === String(tutorId)) setFilters({ batch: saved.batch, type: saved.type });
  }, [tutorId]);

  const load = useCallback(() => {
    setData({ status: 'loading', tutor: null, tutors: [], classes: [] });
    let cancelled = false;
    Promise.all([tutorsApi.list(), tutorsApi.classes(tutorId)])
      .then(([tutors, classes]) => {
        if (cancelled) return;
        const tutor = tutors.find((t) => t.id === String(tutorId)) || null;
        setData({ status: tutor ? 'ready' : 'missing', tutor, tutors, classes });
      })
      .catch(() => !cancelled && setData({ status: 'error', tutor: null, tutors: [], classes: [] }));
    return () => {
      cancelled = true;
    };
  }, [tutorId]);
  useEffect(() => load(), [load]);

  const { tutor, classes } = data;
  const batches = useMemo(() => batchOptions(classes), [classes]);

  // A remembered batch that this tutor does not have any more is dropped.
  const batch = filters.batch === ALL || batches.some((b) => b.key === filters.batch) ? filters.batch : ALL;
  const type = filters.type;

  function change(patch) {
    const next = { batch, type, ...patch };
    setFilters(next);
    save({ tutorId: String(tutorId), batch: next.batch, type: next.type });
  }

  const shown = useMemo(() => applyFilters(classes, { batch, type }), [classes, batch, type]);
  const groups = useMemo(() => groupByBatch(shown), [shown]);

  return (
    <div className={styles.page}>
      <Link href={CLASSES_ROUTE} className={styles.backLink}>
        <Icon name="arrow_back" size={18} weight={600} />
        All tutors
      </Link>

      {data.status === 'loading' && (
        <div aria-busy="true" role="status" aria-label="Loading tutor" className={styles.detailSkeleton}>
          <div className={`${styles.skeleton} ${styles.skeletonProfile}`} />
          <div className={`${styles.skeleton} ${styles.skeletonFilters}`} />
        </div>
      )}

      {data.status === 'error' && (
        <div className={styles.errorBox} role="alert">
          <Icon name="error" size={20} weight={600} fill={1} />
          <span className={styles.errorText}>Couldn&rsquo;t load this tutor. Check the connection and try again.</span>
          <button type="button" className={styles.secondaryButton} onClick={load}>
            <Icon name="refresh" size={18} weight={600} />
            Try again
          </button>
        </div>
      )}

      {data.status === 'missing' && (
        <div className={styles.empty} role="status">
          This tutor could not be found. <Link href={CLASSES_ROUTE}>Back to all tutors</Link>
        </div>
      )}

      {data.status === 'ready' && (
        <>
          <TutorProfileCard tutor={tutor} stats={tutorStats(tutor, classes)} onCreate={() => setCreating(true)} />

          {classes.length > 0 && (
            <ClassFilters
              batches={batches}
              batch={batch}
              type={type}
              batchCounts={batchCounts(classes, type)}
              typeCounts={typeCounts(classes, batch)}
              onBatch={(value) => change({ batch: value })}
              onType={(value) => change({ type: value })}
            />
          )}

          {classes.length === 0 && (
            <div className={styles.empty} role="status">
              {tutor.name} has no classes yet.
            </div>
          )}

          {classes.length > 0 && groups.length === 0 && (
            <div className={styles.empty} role="status">
              <p className={styles.emptyTitle}>No classes match these filters</p>
              <button type="button" className={styles.secondaryButton} onClick={() => change({ batch: ALL, type: ALL })}>
                Clear filters
              </button>
            </div>
          )}

          {groups.map((group) => (
            <section key={group.key} className={styles.group} aria-labelledby={`group-${group.year}-${group.level.replace('/', '')}`}>
              <header className={styles.groupHeader}>
                <h2 id={`group-${group.year}-${group.level.replace('/', '')}`} className={styles.groupTitle}>
                  {group.year} {group.level} batch
                </h2>
                <span className={styles.groupCount}>
                  {groupSummary(group)}
                </span>
              </header>
              <ul className={styles.classGrid}>
                {group.classes.map((cls) => (
                  <li key={cls.id} className={styles.gridItem}>
                    <ClassCard cls={cls} tutor={tutor} catalog={classes} />
                  </li>
                ))}
              </ul>
            </section>
          ))}

          {creating && (
            <CreateClassModal tutors={data.tutors} initialTutorId={tutor.id} onClose={() => setCreating(false)} />
          )}
        </>
      )}
    </div>
  );
}
