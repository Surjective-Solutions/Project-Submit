'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Icon from '@/components/admin/Icon';
import { classes as classesApi } from '@/classes/api';
import { PARTICIPANT_FILTERS, PARTICIPANT_PAGE } from '@/classes/constants';
import { cleanParticipantQuery, filterParticipants, methodCounts, methodInfo } from '@/classes/participantUtils';
import { formatDateParts, formatDateTime, modeSummary, nowLocal } from '@/classes/sessionUtils';
import { formatPhone, initialsOf, plural } from '@/classes/utils';
import Dialog from './Dialog';
import styles from './classes.module.css';
import s from './sessions.module.css';

function DateTime({ value }) {
  const { date, time } = formatDateParts(value);
  return (
    <span className={s.dateBlock}>
      <span className={s.dateLine}>{date}</span>
      <span className={s.timeLine}>{time}</span>
    </span>
  );
}

// The students who attended one session (read-only): name, contact number, barcode, how they attended (online or
// physical) and when. Searched by phone number or barcode, and narrowed to online or physical attendance with the
// dropdown next to the search box.
export default function ParticipantsDialog({ classId, session, onClose }) {
  const [state, setState] = useState({ status: 'loading', items: [] });
  const [query, setQuery] = useState('');
  const [method, setMethod] = useState('all');
  const [limit, setLimit] = useState(PARTICIPANT_PAGE);
  const mounted = useRef(true);
  const searchRef = useRef(null);

  const load = useCallback(() => {
    setState({ status: 'loading', items: [] });
    classesApi
      .participants(classId, session.id)
      .then((items) => mounted.current && setState({ status: 'ready', items }))
      .catch(() => mounted.current && setState({ status: 'error', items: [] }));
  }, [classId, session.id]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const counts = useMemo(() => methodCounts(state.items, query), [state.items, query]);
  const found = useMemo(() => filterParticipants(state.items, { method, query }), [state.items, method, query]);
  const shown = found.slice(0, limit);
  const narrowed = query.trim() !== '' || method !== 'all';
  const ready = state.status === 'ready';
  const notStarted = !!session.startsAt && session.startsAt > nowLocal();

  const changeQuery = (value) => {
    setQuery(cleanParticipantQuery(value));
    setLimit(PARTICIPANT_PAGE);
  };
  const changeMethod = (value) => {
    setMethod(value);
    setLimit(PARTICIPANT_PAGE);
  };
  const clearAll = () => {
    setQuery('');
    setMethod('all');
    setLimit(PARTICIPANT_PAGE);
    searchRef.current?.focus();
  };

  return (
    <Dialog title="Participants" titleId="participants-title" icon="groups" size="xxl" onClose={onClose}
      footer={
        <button type="button" className={styles.secondaryButton} onClick={onClose}>
          Close
        </button>
      }
    >
      <div className={s.panel}>
        <div className={s.studentsBar}>
          <p className={s.participantsFor}>
            <strong>{session.name}</strong>
            <span>
              {formatDateTime(session.startsAt)} · {modeSummary(session)}
            </span>
            <span data-testid="participants-summary" aria-live="polite">
              {ready
                ? narrowed
                  ? `${found.length} of ${state.items.length} attended`
                  : `${plural(state.items.length, 'student')} attended`
                : 'Loading attendance…'}
            </span>
          </p>

          <div className={styles.toolbar}>
            <div className={styles.search}>
              <Icon name="search" size={20} weight={500} style={{ color: '#5b6178' }} />
              <input
                ref={searchRef}
                className={styles.searchInput}
                type="text"
                value={query}
                onChange={(event) => changeQuery(event.target.value)}
                placeholder="Search by phone number or barcode"
                aria-label="Search participants by phone number or barcode"
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
            <div className={s.methodSelect}>
              <select
                className={s.pickerField}
                aria-label="Attendance method"
                value={method}
                onChange={(event) => changeMethod(event.target.value)}
              >
                {PARTICIPANT_FILTERS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {ready ? `${item.label} (${counts[item.value]})` : item.label}
                  </option>
                ))}
              </select>
              <span className={styles.selectIcon} aria-hidden="true">
                <Icon name="expand_more" size={20} weight={500} />
              </span>
            </div>
          </div>
        </div>

        {state.status === 'loading' && (
          <div className={s.noticeList} role="status" aria-busy="true" aria-label="Loading attendance">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={styles.skeleton} style={{ minHeight: 52 }} />
            ))}
          </div>
        )}

        {state.status === 'error' && (
          <div className={styles.errorBox} role="alert">
            <Icon name="error" size={20} weight={600} fill={1} />
            <span className={styles.errorText}>Couldn’t load the attendance.</span>
            <button type="button" className={styles.secondaryButton} onClick={load}>
              <Icon name="refresh" size={18} weight={600} />
              Try again
            </button>
          </div>
        )}

        {ready && state.items.length === 0 && (
          <div className={s.resourceEmpty} role="status" data-testid="participants-empty">
            <Icon name="groups" size={26} weight={400} />
            <p>{notStarted ? 'This session hasn’t started yet, so nobody has attended.' : 'No students attended this session.'}</p>
          </div>
        )}

        {ready && state.items.length > 0 && found.length === 0 && (
          <div className={s.resourceEmpty} role="status" data-testid="participants-none">
            <Icon name="search_off" size={26} weight={400} />
            <p>
              No participants match{query.trim() ? ` “${query.trim()}”` : ''}
              {method !== 'all' ? ` among those who attended ${method === 'online' ? 'online' : 'physically'}` : ''}.
            </p>
            <button type="button" className={styles.secondaryButton} onClick={clearAll}>
              Clear search and filter
            </button>
          </div>
        )}

        {ready && found.length > 0 && (
          <>
            <div className={s.tableWrap}>
              <table className={s.table} aria-label="Participants">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Contact number</th>
                    <th scope="col">Barcode</th>
                    <th scope="col">Method</th>
                    <th scope="col">Attended on</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((p) => {
                    const info = methodInfo(p.method);
                    return (
                      <tr key={p.id}>
                        <td data-label="Name" className={s.nameCell}>
                          <span className={s.person}>
                            <span className={s.personAvatar} aria-hidden="true">
                              {initialsOf(p.name)}
                            </span>
                            <span className={s.personName}>{p.name}</span>
                          </span>
                        </td>
                        <td data-label="Contact number" className={s.phoneCell}>
                          {formatPhone(p.phone)}
                        </td>
                        <td data-label="Barcode">
                          <span className={s.codeChip}>
                            <Icon name="barcode" size={16} weight={500} />
                            {p.barcode}
                          </span>
                        </td>
                        <td data-label="Method">
                          <span className={`${s.statusChip} ${s.methodChip}`} style={{ color: info.color, background: info.tint }}>
                            <Icon name={info.icon} size={15} weight={600} />
                            {info.label}
                          </span>
                        </td>
                        <td data-label="Attended on" className={s.dateCell}>
                          <DateTime value={p.attendedAt} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {found.length > shown.length && (
              <div className={s.moreRow}>
                <button type="button" className={styles.secondaryButton} onClick={() => setLimit(limit + PARTICIPANT_PAGE)}>
                  Show {Math.min(PARTICIPANT_PAGE, found.length - shown.length)} more
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
  );
}
