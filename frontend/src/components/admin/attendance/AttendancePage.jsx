'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { attendance, students, tutors as tutorsApi } from '@/attendance/api';
import { RECENT_LIMIT } from '@/attendance/constants';
import { loadSaved, save } from '@/attendance/storage';
import {
  clampDate,
  fallbackSince,
  firstName,
  isIsoDate,
  monthKey,
  normalizeBarcode,
  sortTutors,
  todayIso,
} from '@/attendance/utils';
import DayCard from './DayCard';
import EmptyState from './EmptyState';
import LookupCard from './LookupCard';
import MonthCard from './MonthCard';
import StudentCard from './StudentCard';
import styles from './attendance.module.css';

export default function AttendancePage() {
  // `today` stays empty until the page has mounted, so the server and browser never disagree on the date.
  const [today, setToday] = useState('');
  const [ready, setReady] = useState(false); // saved state has been read
  const [tutors, setTutors] = useState([]);
  const [tutorId, setTutorId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [student, setStudent] = useState(null);
  const [lookup, setLookup] = useState({ busy: false, error: null });
  const [recents, setRecents] = useState([]);
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [fetched, setFetched] = useState({ key: '', rows: null, failed: false });
  const [scanToken, setScanToken] = useState(0); // every successful lookup, so re-checking a student refreshes
  const [reloadKey, setReloadKey] = useState(0);

  const inputRef = useRef(null);
  const lookupSeq = useRef(0);
  const savedMonth = useRef('');

  const runLookup = useCallback(async (raw, { restore = false } = {}) => {
    const code = normalizeBarcode(raw);
    if (!code) {
      setLookup({ busy: false, error: { type: 'empty' } });
      return;
    }
    const seq = ++lookupSeq.current;
    setLookup({ busy: true, error: null });
    try {
      const found = await students.byBarcode(code);
      if (seq !== lookupSeq.current) return; // a newer scan has replaced this one
      if (!found) {
        setLookup({ busy: false, error: restore ? null : { type: 'notfound', code: String(raw).trim() } });
        return;
      }
      setStudent(found);
      setScanToken(seq);
      setBarcode(found.id);
      setRecents((list) =>
        [{ id: found.id, firstName: firstName(found) }, ...list.filter((r) => r.id !== found.id)].slice(0, RECENT_LIMIT),
      );
      setLookup({ busy: false, error: null });
    } catch {
      if (seq === lookupSeq.current) setLookup({ busy: false, error: { type: 'network' } });
    }
  }, []);

  // First load: read what was remembered, fetch the tutors, and look the last student up again.
  useEffect(() => {
    const now = todayIso();
    const saved = loadSaved();
    setToday(now);
    setTutorId(saved.tutorId || '');
    setDate(saved.date ? clampDate(saved.date, '', now) : now);
    savedMonth.current = saved.month || '';
    inputRef.current?.focus();

    let cancelled = false;
    tutorsApi
      .list()
      .then((list) => {
        if (!cancelled) setTutors(sortTutors(list));
      })
      .catch(() => {});

    const finish = () => {
      if (!cancelled) setReady(true);
    };
    if (saved.studentId) runLookup(saved.studentId, { restore: true }).then(finish, finish);
    else finish();
    return () => {
      cancelled = true;
    };
  }, [runLookup]);

  // Forget a remembered tutor that no longer exists.
  useEffect(() => {
    if (tutorId && tutors.length && !tutors.some((t) => t.id === tutorId)) setTutorId('');
  }, [tutors, tutorId]);

  const tutor = tutors.find((t) => t.id === tutorId) || null;
  const minDate = useMemo(() => {
    if (!today) return '';
    return student?.enrolledSince && isIsoDate(student.enrolledSince) ? student.enrolledSince : fallbackSince(today);
  }, [student, today]);

  // A new student: keep the chosen date if it is allowed for them, otherwise move it inside their range.
  // Then leave the cursor in the field with the ID selected, so the next scan replaces it.
  useEffect(() => {
    if (!student || !today) return;
    const nextDate = clampDate(date || today, minDate, today);
    setDate(nextDate);
    const wanted = savedMonth.current;
    savedMonth.current = '';
    setMonth(wanted && wanted >= monthKey(minDate) && wanted <= monthKey(today) ? wanted : monthKey(nextDate));
    inputRef.current?.focus();
    inputRef.current?.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

  // The attendance rows for this student (and tutor) from the start of their record to today. Rows are
  // stored with the request they belong to, so a previous student's rows never show for a new one.
  const requestKey = student && today && minDate ? `${student.id}|${tutorId}|${minDate}|${scanToken}|${reloadKey}` : '';
  useEffect(() => {
    if (!requestKey) return undefined;
    let cancelled = false;
    attendance
      .range({ studentId: student.id, from: minDate, to: today, tutorId: tutorId || undefined })
      .then((rows) => {
        if (!cancelled) setFetched({ key: requestKey, rows, failed: false });
      })
      .catch(() => {
        if (!cancelled) setFetched({ key: requestKey, rows: null, failed: true });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey]);
  const fresh = fetched.key === requestKey;
  const records = fresh && !fetched.failed ? fetched.rows : null; // null while loading
  const recordsError = fresh && fetched.failed;

  // Remember the last student, tutor, date and month between visits.
  useEffect(() => {
    if (!ready) return;
    save({ studentId: student?.id || '', tutorId, date, month });
  }, [ready, student, tutorId, date, month]);

  function changeDate(iso) {
    const next = clampDate(iso, minDate, today);
    setDate(next);
    setMonth(monthKey(next));
  }

  function handleSubmit(event) {
    event.preventDefault();
    runLookup(barcode);
  }

  const enrolledWithTutor = !student || !tutor || student.enrolledClasses.some((c) => c.tutor === tutor.name);
  const visibleRecords = useMemo(
    () => (records && tutor ? records.filter((r) => r.tutor === tutor.name) : records),
    [records, tutor],
  );

  return (
    <div className={styles.page}>
      <header>
        <h1 className={styles.title}>Attendance</h1>
        <p className={styles.subtitle}>Scan a student&rsquo;s barcode to check attendance on any date.</p>
      </header>

      <LookupCard
        barcode={barcode}
        onBarcodeChange={setBarcode}
        inputRef={inputRef}
        tutors={tutors}
        tutorId={tutorId}
        onTutorChange={setTutorId}
        date={date}
        minDate={minDate}
        maxDate={today}
        onDateChange={changeDate}
        onSubmit={handleSubmit}
        busy={lookup.busy}
        error={lookup.error}
        recents={recents}
        currentId={student?.id}
        onPickRecent={(id) => runLookup(id)}
      />

      {!student ? (
        <EmptyState />
      ) : (
        <>
          <div className={styles.row}>
            <StudentCard student={student} />
            <DayCard
              student={student}
              tutor={tutor}
              enrolledWithTutor={enrolledWithTutor}
              date={date}
              records={visibleRecords}
              error={recordsError}
              onRetry={() => setReloadKey((n) => n + 1)}
              onDateChange={changeDate}
            />
          </div>
          {enrolledWithTutor && visibleRecords && (
            <MonthCard
              tutor={tutor}
              records={visibleRecords}
              since={minDate}
              today={today}
              month={month || monthKey(date)}
              onMonthChange={setMonth}
              date={date}
              onDateChange={changeDate}
            />
          )}
        </>
      )}
    </div>
  );
}
