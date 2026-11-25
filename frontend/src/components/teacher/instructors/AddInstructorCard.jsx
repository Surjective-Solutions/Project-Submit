'use client';

import { useId, useRef, useState } from 'react';
import { firstName, initials, maskEmail, normaliseInstructorId } from '@/instructors/utils';
import { AlertIcon, SpinnerIcon } from './icons';
import styles from './instructors.module.css';

// "Add an instructor": type an ID, Find them, check the name, then add. Everything else (the list, the toast) belongs to the page.
//   inputRef      lets the page's "+ Add instructor" button focus the field
//   classes       the teacher's classes, shown as chips in the preview
//   onLookup(id)  -> the instructor behind the ID ({ alreadyAdded } when they are on the list already)
//   onAdd(id)     -> adds them; the page updates the list and shows the toast
export default function AddInstructorCard({ inputRef, classes, onLookup, onAdd }) {
  const ids = useId();
  const inputId = `${ids}-id`;
  const hintId = `${ids}-hint`;
  const errorId = `${ids}-error`;

  const [value, setValue] = useState('');
  const [phase, setPhase] = useState('idle'); // 'idle' | 'searching' | 'found' | 'adding'
  const [found, setFound] = useState(null);
  const [error, setError] = useState('');
  const search = useRef(0); // lets an old answer be ignored once the field has been edited

  const busy = phase === 'searching' || phase === 'adding';

  function reset() {
    search.current += 1;
    setValue('');
    setFound(null);
    setError('');
    setPhase('idle');
  }

  function onChange(event) {
    if (phase === 'adding') return;
    search.current += 1; // anything still being looked up is no longer wanted
    setValue(event.target.value);
    setFound(null);
    setError('');
    setPhase('idle');
  }

  async function onFind(event) {
    event.preventDefault();
    if (busy) return;
    const { id, error: formatError } = normaliseInstructorId(value);
    if (formatError) {
      setError(formatError);
      setFound(null);
      return;
    }
    setValue(id);
    setError('');
    setFound(null);
    setPhase('searching');
    const mine = (search.current += 1);
    try {
      const result = await onLookup(id);
      if (mine !== search.current) return;
      if (result.alreadyAdded) {
        setError(`${result.name} (${result.id}) is already one of your instructors.`);
        setPhase('idle');
        return;
      }
      setFound(result);
      setPhase('found');
    } catch (err) {
      if (mine !== search.current) return;
      setError(err?.message || 'Could not look that ID up. Please try again.');
      setPhase('idle');
    }
  }

  async function onConfirm() {
    if (!found || busy) return;
    setPhase('adding');
    setError('');
    try {
      await onAdd(found.id);
      reset();
    } catch (err) {
      setError(err?.message || `Could not add ${found.name}. Please try again.`);
      setPhase('found');
    }
  }

  function onCancel() {
    reset();
    inputRef?.current?.focus();
  }

  return (
    <section className={styles.card} aria-labelledby={`${ids}-title`}>
      <form onSubmit={onFind} noValidate>
        <h2 id={`${ids}-title`} className={styles.cardTitle}>Add an instructor</h2>
        <p className={styles.helper}>
          Enter the Instructor ID from their Syzygy profile. Once added, they can access all of your classes.
        </p>

        <label htmlFor={inputId} className={styles.label}>Instructor ID</label>
        <div className={styles.findRow}>
          <input
            ref={inputRef}
            id={inputId}
            className={error ? `${styles.input} ${styles.inputInvalid}` : styles.input}
            type="text"
            value={value}
            onChange={onChange}
            placeholder="e.g. INS-52740"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? `${errorId} ${hintId}` : hintId}
            disabled={phase === 'adding'}
          />
          <button type="submit" className={styles.btnDark} disabled={busy}>
            {phase === 'searching' ? (
              <>
                <SpinnerIcon className={styles.spin} size={16} />
                Searching…
              </>
            ) : (
              'Find'
            )}
          </button>
        </div>
        <p id={hintId} className={styles.hint}>Instructor IDs start with INS- followed by 5 digits.</p>
        {error ? (
          <p id={errorId} role="alert" className={styles.error}>
            <AlertIcon size={16} />
            <span>{error}</span>
          </p>
        ) : null}
      </form>

      {found ? (
        <div className={styles.preview} role="region" aria-label="Instructor found">
          <div className={styles.previewTop}>
            <span className={styles.avatarLg} aria-hidden="true">{initials(found.name)}</span>
            <div className={styles.previewInfo}>
              <p className={styles.previewName}>{found.name}</p>
              <p className={styles.mono}>{found.id}</p>
              <p className={styles.previewMeta}>
                {maskEmail(found.email)}
                {found.since ? ` · On Syzygy since ${found.since}` : ''}
              </p>
            </div>
            <span className={styles.foundChip}>Instructor found</span>
          </div>

          <p className={styles.previewLead}>
            {classes.length > 0
              ? `They’ll get access to all ${classes.length} of your ${classes.length === 1 ? 'class' : 'classes'}:`
              : 'They’ll get access to your classes as soon as you create them.'}
          </p>
          {classes.length > 0 ? (
            <ul className={styles.chipList}>
              {classes.map((cls) => (
                <li key={cls.id} className={styles.chip}>{cls.name}</li>
              ))}
            </ul>
          ) : null}

          <div className={styles.previewActions}>
            <button type="button" className={styles.btnPrimary} onClick={onConfirm} disabled={phase === 'adding'}>
              {phase === 'adding' ? (
                <>
                  <SpinnerIcon className={styles.spin} size={16} />
                  Adding…
                </>
              ) : (
                `Add ${firstName(found.name)} as instructor`
              )}
            </button>
            <button type="button" className={styles.btnSecondary} onClick={onCancel} disabled={phase === 'adding'}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
