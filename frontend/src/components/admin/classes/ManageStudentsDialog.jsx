'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/admin/Icon';
import { classes as classesApi } from '@/classes/api';
import { STUDENT_FILTERS, STUDENT_PAGE } from '@/classes/constants';
import { cleanPhoneQuery, filterCounts, filterStudents, statusInfo } from '@/classes/studentUtils';
import { formatPhone, initialsOf, plural } from '@/classes/utils';
import ConfirmDialog from './ConfirmDialog';
import Dialog from './Dialog';
import styles from './classes.module.css';
import s from './sessions.module.css';

// The students enrolled in one class: name, contact number, barcode and status, with a search by phone number,
// All / Paid / Free buttons and an Unenroll button on each row. Unenrolling removes the student from the class and
// reports the class's new enrollment numbers to the page (onEnrollmentsChange) so the tiles stay right.
export default function ManageStudentsDialog({ classId, className, onEnrollmentsChange, onClose }) {
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [limit, setLimit] = useState(STUDENT_PAGE);
  const [removing, setRemoving] = useState(null); // { student, busy, error }
  const mounted = useRef(true);
  const searchRef = useRef(null);

  const load = useCallback(() => {
    setState({ status: 'loading', items: [] });
    classesApi
      .students(classId)
      .then((items) => mounted.current && setState({ status: 'ready', items }))
      .catch(() => mounted.current && setState({ status: 'error', items: [] }));
  }, [classId]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const counts = useMemo(() => filterCounts(state.items, query), [state.items, query]);
  const found = useMemo(() => filterStudents(state.items, { filter, query }), [state.items, filter, query]);
  const shown = found.slice(0, limit);
  const narrowed = query.trim() !== '' || filter !== 'all';

  const changeQuery = (value) => {
    setQuery(cleanPhoneQuery(value));
    setLimit(STUDENT_PAGE);
  };
  const changeFilter = (value) => {
    setFilter(value);
    setLimit(STUDENT_PAGE);
  };
  const clearAll = () => {
    setQuery('');
    setFilter('all');
    setLimit(STUDENT_PAGE);
    searchRef.current?.focus();
  };

  async function confirmUnenroll() {
    const { student } = removing;
    setRemoving({ student, busy: true, error: '' });
    try {
      const { enrollments } = await classesApi.unenroll(classId, student.id);
      if (!mounted.current) return;
      setState((current) => ({ ...current, items: current.items.filter((x) => x.id !== student.id) }));
      setRemoving(null);
      onEnrollmentsChange(enrollments);
      toast.success(`${student.name} was unenrolled.`);
      searchRef.current?.focus();
    } catch {
      if (mounted.current) setRemoving({ student, busy: false, error: 'Couldn’t unenroll the student. Check the connection and try again.' });
    }
  }

  const ready = state.status === 'ready';

  return (
    <>
      <Dialog
        title="Manage students"
        titleId="students-title"
        icon="manage_accounts"
        size="xxl"
        onClose={onClose}
        footer={
          <button type="button" className={styles.secondaryButton} onClick={onClose}>
            Close
          </button>
        }
      >
        <div className={s.panel}>
          <div className={s.studentsBar}>
            <p className={s.noticesIntro}>
              <strong>{className}</strong>
              <span data-testid="students-summary" aria-live="polite">
                {ready ? (narrowed ? `${found.length} of ${plural(state.items.length, 'student')}` : `${plural(state.items.length, 'student')} enrolled`) : 'Loading students…'}
              </span>
            </p>

            <div className={styles.toolbar}>
              <div className={styles.search}>
                <Icon name="search" size={20} weight={500} style={{ color: '#5b6178' }} />
                <input
                  ref={searchRef}
                  className={styles.searchInput}
                  type="text"
                  inputMode="tel"
                  value={query}
                  onChange={(event) => changeQuery(event.target.value)}
                  placeholder="Search by phone number"
                  aria-label="Search students by phone number"
                  autoComplete="off"
                  spellCheck={false}
                  data-autofocus
                />
                {query && (
                  <button type="button" className={s.searchClear} onClick={() => changeQuery('')} aria-label="Clear search">
                    <Icon name="close" size={18} weight={600} />
                  </button>
                )}
              </div>
              <div className={s.filterGroup} role="group" aria-label="Show students">
                {STUDENT_FILTERS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className={styles.pill}
                    aria-pressed={filter === item.value}
                    onClick={() => changeFilter(item.value)}
                  >
                    {item.label}
                    {ready && <span className={styles.pillCount}>{counts[item.value]}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {state.status === 'loading' && (
            <div className={s.noticeList} role="status" aria-busy="true" aria-label="Loading students">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={styles.skeleton} style={{ minHeight: 52 }} />
              ))}
            </div>
          )}

          {state.status === 'error' && (
            <div className={styles.errorBox} role="alert">
              <Icon name="error" size={20} weight={600} fill={1} />
              <span className={styles.errorText}>Couldn’t load the students.</span>
              <button type="button" className={styles.secondaryButton} onClick={load}>
                <Icon name="refresh" size={18} weight={600} />
                Try again
              </button>
            </div>
          )}

          {ready && state.items.length === 0 && (
            <div className={s.resourceEmpty} role="status" data-testid="students-empty">
              <Icon name="groups" size={26} weight={400} />
              <p>No students are enrolled in this class.</p>
            </div>
          )}

          {ready && state.items.length > 0 && found.length === 0 && (
            <div className={s.resourceEmpty} role="status" data-testid="students-none">
              <Icon name="search_off" size={26} weight={400} />
              <p>No students match{query.trim() ? ` “${query.trim()}”` : ''}{filter !== 'all' ? ` among the ${filter === 'paid' ? 'paid' : 'free'} students` : ''}.</p>
              <button type="button" className={styles.secondaryButton} onClick={clearAll}>
                Clear search and filter
              </button>
            </div>
          )}

          {ready && found.length > 0 && (
            <>
              <div className={s.tableWrap}>
                <table className={s.table} aria-label="Enrolled students">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Contact number</th>
                      <th scope="col">Barcode</th>
                      <th scope="col">Status</th>
                      <th scope="col">
                        <span className={s.srOnly}>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((student) => {
                      const status = statusInfo(student.status);
                      return (
                        <tr key={student.id}>
                          <td data-label="Name" className={s.nameCell}>
                            <span className={s.person}>
                              <span className={s.personAvatar} aria-hidden="true">
                                {initialsOf(student.name)}
                              </span>
                              <span className={s.personName}>{student.name}</span>
                            </span>
                          </td>
                          <td data-label="Contact number" className={s.phoneCell}>
                            {formatPhone(student.phone)}
                          </td>
                          <td data-label="Barcode">
                            <span className={s.codeChip}>
                              <Icon name="barcode" size={16} weight={500} />
                              {student.barcode}
                            </span>
                          </td>
                          <td data-label="Status">
                            <span className={s.statusChip} style={{ color: status.color, background: status.tint }}>
                              {status.label}
                            </span>
                          </td>
                          <td className={s.actionsCell}>
                            <button
                              type="button"
                              className={s.unenrollButton}
                              onClick={() => setRemoving({ student, busy: false, error: '' })}
                              aria-label={`Unenroll ${student.name}`}
                            >
                              <Icon name="person_remove" size={18} weight={500} />
                              Unenroll
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {found.length > shown.length && (
                <div className={s.moreRow}>
                  <button type="button" className={styles.secondaryButton} onClick={() => setLimit(limit + STUDENT_PAGE)}>
                    Show {Math.min(STUDENT_PAGE, found.length - shown.length)} more
                  </button>
                  <span className={s.hint}>
                    Showing {shown.length} of {found.length}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </Dialog>

      {removing && (
        <ConfirmDialog
          title="Unenroll student?"
          message={`${removing.student.name} (${formatPhone(removing.student.phone)}) will be removed from the students enrolled in this class.`}
          confirmLabel="Unenroll"
          busyLabel="Unenrolling…"
          icon="person_remove"
          busy={removing.busy}
          error={removing.error}
          onConfirm={confirmUnenroll}
          onCancel={() => setRemoving(null)}
        />
      )}
    </>
  );
}
