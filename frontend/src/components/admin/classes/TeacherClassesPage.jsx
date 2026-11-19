'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { tutors as tutorsApi } from '@/classes/api';
import { ALL } from '@/classes/constants';
import { loadSaved, save } from '@/classes/storage';
import { useTeacherId } from '@/classes/teacher';
import {
  applyFilters,
  batchCounts,
  batchOptions,
  groupByBatch,
  groupSummary,
  teacherClassHref,
  tutorStats,
  typeCounts,
} from '@/classes/utils';
import ClassCard from './ClassCard';
import ClassFilters from './ClassFilters';
import TutorProfileCard from './TutorProfileCard';
import styles from './classes.module.css';

// The teacher's own classes, in the teacher account: the same batch / type filters and class cards as the admin
// page for a tutor: the teacher's profile card (without the Create class button, since the admin creates the classes),
// the filters and the class cards.
export default function TeacherClassesPage() {
  const tutorId = useTeacherId(); // undefined until the login token is read, null when signed out
  const [data, setData] = useState({ status: 'loading', tutor: null, classes: [] });
  const [filters, setFilters] = useState({ batch: ALL, type: ALL });

  useEffect(() => {
    if (!tutorId) return;
    const saved = loadSaved();
    if (saved.tutorId === String(tutorId)) setFilters({ batch: saved.batch, type: saved.type });
  }, [tutorId]);

  const load = useCallback(() => {
    if (tutorId === undefined) return undefined;
    if (tutorId === null) {
      setData({ status: 'missing', tutor: null, classes: [] });
      return undefined;
    }
    setData({ status: 'loading', tutor: null, classes: [] });
    let cancelled = false;
    Promise.all([tutorsApi.list(), tutorsApi.classes(tutorId)])
      .then(([tutors, classes]) => {
        if (cancelled) return;
        const tutor = tutors.find((t) => String(t.id) === tutorId) || null;
        setData({ status: tutor ? 'ready' : 'missing', tutor, classes });
      })
      .catch(() => !cancelled && setData({ status: 'error', tutor: null, classes: [] }));
    return () => {
      cancelled = true;
    };
  }, [tutorId]);
  useEffect(() => load(), [load]);

  const { tutor, classes } = data;
  const batches = useMemo(() => batchOptions(classes), [classes]);
  const batch = filters.batch === ALL || batches.some((b) => b.key === filters.batch) ? filters.batch : ALL;
  const type = filters.type;

  function change(patch) {
    const next = { batch, type, ...patch };
    setFilters(next);
    save({ tutorId: String(tutorId ?? ''), batch: next.batch, type: next.type });
  }

  const shown = useMemo(() => applyFilters(classes, { batch, type }), [classes, batch, type]);
  const groups = useMemo(() => groupByBatch(shown), [shown]);

  return (
    <div className={styles.page}>
      {data.status === 'loading' && (
        <div aria-busy="true" role="status" aria-label="Loading classes" className={styles.detailSkeleton}>
          <div className={`${styles.skeleton} ${styles.skeletonProfile}`} />
          <div className={`${styles.skeleton} ${styles.skeletonFilters}`} />
        </div>
      )}

      {data.status === 'error' && (
        <div className={styles.errorBox} role="alert">
          <Icon name="error" size={20} weight={600} fill={1} />
          <span className={styles.errorText}>Couldn&rsquo;t load your classes. Check the connection and try again.</span>
          <button type="button" className={styles.secondaryButton} onClick={load}>
            <Icon name="refresh" size={18} weight={600} />
            Try again
          </button>
        </div>
      )}

      {data.status === 'missing' && (
        <div className={styles.empty} role="status">
          Your teacher profile could not be found.
        </div>
      )}

      {data.status === 'ready' && (
        <>
          <TutorProfileCard tutor={tutor} stats={tutorStats(tutor, classes)} />

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
              You have no classes yet. The admin will add them for you.
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
                <span className={styles.groupCount}>{groupSummary(group)}</span>
              </header>
              <ul className={styles.classGrid}>
                {group.classes.map((cls) => (
                  <li key={cls.id} className={styles.gridItem}>
                    <ClassCard cls={cls} tutor={tutor} catalog={classes} href={(c) => teacherClassHref(c.id)} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  );
}
