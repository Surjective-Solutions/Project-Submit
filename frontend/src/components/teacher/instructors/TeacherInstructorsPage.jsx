'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '@/instructors/api';
import { plural } from '@/instructors/utils';
import AddInstructorCard from './AddInstructorCard';
import InstructorsTable from './InstructorsTable';
import { PlusIcon } from './icons';
import { AccessCard, HowItWorksCard } from './SideCards';
import Toast from './Toast';
import styles from './instructors.module.css';

const FRESH_MS = 6000;

// The teacher's Instructors page: add an instructor by their ID, see who has access to the classes, remove them.
export default function TeacherInstructorsPage() {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState('');
  const [instructors, setInstructors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [freshId, setFreshId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [toast, setToast] = useState(null);

  const idInput = useRef(null);
  const listHeading = useRef(null);
  const freshTimer = useRef(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [list, classList] = await Promise.all([api.getInstructors(), api.getClasses()]);
      setInstructors(list);
      setClasses(classList);
      setStatus('ready');
    } catch (err) {
      setError(err?.message || 'Could not load your instructors.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
    return () => clearTimeout(freshTimer.current);
  }, [load]);

  const closeToast = useCallback(() => setToast(null), []);
  const showToast = (message, tone) => setToast({ id: Date.now() + Math.random(), message, tone });

  async function addInstructor(instructorId) {
    const instructor = await api.addInstructor(instructorId);
    setInstructors((list) => [instructor, ...list.filter((i) => i.id !== instructor.id)]);
    setFreshId(instructor.id);
    clearTimeout(freshTimer.current);
    freshTimer.current = setTimeout(() => setFreshId(null), FRESH_MS);
    showToast(`${instructor.name} can now access all your classes.`, 'success');
  }

  async function removeInstructor(instructor) {
    setBusyId(instructor.id);
    try {
      await api.removeInstructor(instructor.id);
      setInstructors((list) => list.filter((i) => i.id !== instructor.id));
      setConfirmId(null);
      showToast(`${instructor.name} no longer has access to your classes.`, 'neutral');
      listHeading.current?.focus(); // the row the focus was on is gone
    } catch (err) {
      setConfirmId(null);
      showToast(err?.message || `Could not remove ${instructor.name}. Please try again.`, 'neutral');
    } finally {
      setBusyId(null);
    }
  }

  const classCount = classes.length;
  const summary =
    status === 'ready'
      ? `${plural(instructors.length, 'instructor')} · access to all ${classCount} ${classCount === 1 ? 'class' : 'classes'}`
      : 'Instructors';

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{summary}</p>
          <h1 className={styles.title}>Instructors</h1>
        </div>
        <button type="button" className={styles.btnPrimary} onClick={() => idInput.current?.focus()}>
          <PlusIcon size={18} strokeWidth={2.4} />
          Add instructor
        </button>
      </header>

      <div className={styles.top}>
        <AddInstructorCard inputRef={idInput} classes={classes} onLookup={api.lookupInstructor} onAdd={addInstructor} />
        <HowItWorksCard />
      </div>

      <InstructorsTable
        status={status}
        error={error}
        instructors={instructors}
        classCount={classCount}
        freshId={freshId}
        confirmId={confirmId}
        busyId={busyId}
        headingRef={listHeading}
        onRetry={load}
        onAsk={(instructor) => setConfirmId(instructor.id)}
        onKeep={() => setConfirmId(null)}
        onRemove={removeInstructor}
      />

      <AccessCard />

      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
