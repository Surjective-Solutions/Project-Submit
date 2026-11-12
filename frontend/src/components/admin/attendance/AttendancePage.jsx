'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { attendance, students, tutors as tutorsApi } from '@/attendance/api';
import { loadSaved, save } from '@/attendance/storage';
import {
  clampDate,
  fallbackSince,
  isIsoDate,
  monthKey,
  formatPhoneInput,
  normalizeBarcode,
  normalizePhone,
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
  const [mode, setMode] = useState('barcode'); // how staff are searching: 'barcode' or 'phone'
  const [barcode, setBarcode] = useState('');
  const [phone, setPhone] = useState(''); // as typed, e.g. "77 123 4567"
  const [student, setStudent] = useState(null);
  const [lookup, setLookup] = useState({ busy: false, error: null });
  const [date, setDate] = useState('');
  const [month, setMonth] = useState('');
  const [fetched, setFetched] = useState({ key: '', rows: null, failed: false });
  const [scanToken, setScanToken] = useState(0); // every successful lookup, so re-checking a student refreshes
  const [reloadKey, setReloadKey] = useState(0);

  const inputRef = useRef(null);
  const lookupSeq = useRef(0);

  // Look a student up by barcode (student ID) or by phone number, depending on `by`.
  const runLookup = useCallback(async ({ by, value }) => {
    const seq = ++lookupSeq.current; // any newer submit makes older, slower lookups irrelevant
    // Searching with nothing typed clears the screen back to the "Enter barcode or phone number" prompt.
    const showEmpty = () => {
      setStudent(null);
      setLookup({ busy: false, error: { type: 'empty', by } });
    };
    let code;
    if (by === 'phone') {
      if (!String(value).trim()) {
        showEmpty();
        return;
      }
      const digits = normalizePhone(value);
      if (!digits) {
        setLookup({ busy: false, error: { type: 'invalid', by } });
        return;
      }
      code = `0${digits}`; // sent in local form, e.g. 0771234567
    } else {
      code = normalizeBarcode(value);
      if (!code) {
        showEmpty();
        return;
      }
    }
    setLookup({ busy: true, error: null });
    try {
      const found = await (by === 'phone' ? students.byPhone(code) : students.byBarcode(code));
      if (seq !== lookupSeq.current) return; // a newer scan has replaced this one
      if (!found) {
        const shown = by === 'phone' ? `+94 ${formatPhoneInput(value)}` : String(value).trim();
        setLookup({ busy: false, error: { type: 'notfound', by, code: shown } });
        return;
      }
      setStudent(found);
      setScanToken(seq);
      setBarcode(found.id);
      setPhone(formatPhoneInput(found.phone));
      setLookup({ busy: false, error: null });
    } catch {
      if (seq === lookupSeq.current) setLookup({ busy: false, error: { type: 'network' } });
    }
  }, []);

// First load: read the remembered tutor and date, and fetch the tutors. No student is remembered,
// the page always opens on the empty prompt. 
  useEffect(() => {
    const now = todayIso();
    const saved = loadSaved();
    setToday(now);
    setTutorId(saved.tutorId || '');
    setDate(saved.date ? clampDate(saved.date, '', now) : now);
    inputRef.current?.focus();

    let cancelled = false;
    tutorsApi
      .list()
      .then((list) => {
        if (!cancelled) setTutors(sortTutors(list));
      })
      .catch(() => {});

    setReady(true);
    return () => {
      cancelled = true;
    };
  }, []);

  // Put the cursor in whichever field is showing when the search mode changes.
  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

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
    setMonth(monthKey(nextDate));
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

  // Remember the last tutor and class date between visits (never a student).
  useEffect(() => {
    if (!ready) return;
    save({ tutorId, date });
  }, [ready, tutorId, date]);

  function changeDate(iso) {
    const next = clampDate(iso, minDate, today);
    setDate(next);
    setMonth(monthKey(next));
  }

  function handleSubmit(event) {
    event.preventDefault();
    runLookup(mode === 'phone' ? { by: 'phone', value: phone } : { by: 'barcode', value: barcode });
  }

  // Back to empty fields and the "Enter barcode or phone number" prompt. The tutor and class date stay,
  // so the next student can be checked for the same class.
  function handleClear() {
    lookupSeq.current += 1; // drop any lookup still running
    setStudent(null);
    setBarcode('');
    setPhone('');
    setMonth('');
    setLookup({ busy: false, error: null });
    inputRef.current?.focus();
  }

  function changeMode(next) {
    if (next === mode) return;
    lookupSeq.current += 1; // a lookup still running for the other mode is dropped
    setMode(next);
    setLookup({ busy: false, error: null });
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
        mode={mode}
        onModeChange={changeMode}
        barcode={barcode}
        onBarcodeChange={setBarcode}
        phone={phone}
        onPhoneChange={(value) => setPhone(formatPhoneInput(value))}
        inputRef={inputRef}
        tutors={tutors}
        tutorId={tutorId}
        onTutorChange={setTutorId}
        date={date}
        minDate={minDate}
        maxDate={today}
        onDateChange={changeDate}
        onSubmit={handleSubmit}
        onClear={handleClear}
        canClear={!!student && !lookup.busy}
        busy={lookup.busy}
        error={lookup.error}
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
